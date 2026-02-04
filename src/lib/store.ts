import { createClient } from '@vercel/kv';
import { TokenLaunch } from './types';

// Initialize KV client
// Will automatically use KV_REST_API_URL and KV_REST_API_TOKEN env vars
const kv = createClient({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
});

const IS_KV_CONFIGURED = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// Fallback in-memory store for local dev without KV credentials
const memoryTokens: Map<string, TokenLaunch> = new Map();
const memoryProcessedPosts: Set<string> = new Set();

/**
 * Add a new token launch
 */
export async function addToken(token: TokenLaunch): Promise<void> {
  if (IS_KV_CONFIGURED) {
    await kv.hset('molenker:tokens', { [token.id]: token });
  } else {
    memoryTokens.set(token.id, token);
  }
}

/**
 * Update an existing token
 */
export async function updateToken(id: string, updates: Partial<TokenLaunch>): Promise<TokenLaunch | null> {
  const token = await getToken(id);
  if (!token) return null;
  
  const updated = { ...token, ...updates };
  
  if (IS_KV_CONFIGURED) {
    await kv.hset('molenker:tokens', { [id]: updated });
  } else {
    memoryTokens.set(id, updated);
  }
  
  return updated;
}

/**
 * Get a token by ID
 */
export async function getToken(id: string): Promise<TokenLaunch | null> {
  if (IS_KV_CONFIGURED) {
    const token = await kv.hget<TokenLaunch>('molenker:tokens', id);
    return token || null;
  } else {
    return memoryTokens.get(id) || null;
  }
}

/**
 * Get token by contract address
 */
export async function getTokenByAddress(address: string): Promise<TokenLaunch | null> {
  const tokens = await getAllTokens();
  return tokens.find(t => t.tokenAddress?.toLowerCase() === address.toLowerCase()) || null;
}

/**
 * Helper to get all tokens
 */
async function getAllTokens(): Promise<TokenLaunch[]> {
  if (IS_KV_CONFIGURED) {
    const tokens = await kv.hgetall<Record<string, TokenLaunch>>('molenker:tokens');
    return tokens ? Object.values(tokens) : [];
  } else {
    return Array.from(memoryTokens.values());
  }
}

/**
 * Get all tokens with optional filters
 */
export async function getTokens(options: {
  source?: 'moltx' | 'moltbook' | '4claw';
  status?: 'pending' | 'deployed' | 'failed';
  limit?: number;
  offset?: number;
  sortBy?: 'newest' | 'marketCap' | 'volume';
} = {}): Promise<TokenLaunch[]> {
  let result = await getAllTokens();

  // Filter by source
  if (options.source) {
    result = result.filter(t => t.source === options.source);
  }

  // Filter by status
  if (options.status) {
    result = result.filter(t => t.status === options.status);
  }

  // Sort
  switch (options.sortBy) {
    case 'marketCap':
      result.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
      break;
    case 'volume':
      result.sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0));
      break;
    case 'newest':
    default:
      result.sort((a, b) => {
        const dateA = a.deployedAt ? new Date(a.deployedAt).getTime() : 0;
        const dateB = b.deployedAt ? new Date(b.deployedAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  // Pagination
  const offset = options.offset || 0;
  const limit = options.limit || 50;
  result = result.slice(offset, offset + limit);

  return result;
}

/**
 * Check if a post has been processed
 */
export async function isPostProcessed(postId: string): Promise<boolean> {
  if (IS_KV_CONFIGURED) {
    const isMember = await kv.sismember('molenker:processed_posts', postId);
    return isMember === 1;
  } else {
    return memoryProcessedPosts.has(postId);
  }
}

/**
 * Mark a post as processed
 */
export async function markPostProcessed(postId: string): Promise<void> {
  if (IS_KV_CONFIGURED) {
    await kv.sadd('molenker:processed_posts', postId);
  } else {
    memoryProcessedPosts.add(postId);
  }
}

/**
 * Get stats
 */
export async function getStats(): Promise<{
  totalTokens: number;
  deployedTokens: number;
  pendingTokens: number;
  failedTokens: number;
  totalVolume: number;
  totalMarketCap: number;
}> {
  const allTokens = await getAllTokens();
  
  return {
    totalTokens: allTokens.length,
    deployedTokens: allTokens.filter(t => t.status === 'deployed').length,
    pendingTokens: allTokens.filter(t => t.status === 'pending').length,
    failedTokens: allTokens.filter(t => t.status === 'failed').length,
    totalVolume: allTokens.reduce((sum, t) => sum + (t.volume24h || 0), 0),
    totalMarketCap: allTokens.reduce((sum, t) => sum + (t.marketCap || 0), 0),
  };
}

/**
 * Get HOT tokens (highest price change in 24h)
 */
export async function getHotTokens(limit: number = 10): Promise<TokenLaunch[]> {
  const allTokens = await getAllTokens();
  return allTokens
    .filter(t => t.status === 'deployed' && t.priceChange24h !== undefined)
    .sort((a, b) => (b.priceChange24h || 0) - (a.priceChange24h || 0))
    .slice(0, limit);
}

/**
 * Get new tokens (launched in last 24h)
 */
export async function getNewTokens(limit: number = 10): Promise<TokenLaunch[]> {
  const allTokens = await getAllTokens();
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  
  return allTokens
    .filter(t => {
      if (t.status !== 'deployed' || !t.deployedAt) return false;
      return new Date(t.deployedAt).getTime() > oneDayAgo;
    })
    .sort((a, b) => {
      const dateA = a.deployedAt ? new Date(a.deployedAt).getTime() : 0;
      const dateB = b.deployedAt ? new Date(b.deployedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, limit);
}

/**
 * Get top volume tokens
 */
export async function getTopVolumeTokens(limit: number = 10): Promise<TokenLaunch[]> {
  const allTokens = await getAllTokens();
  return allTokens
    .filter(t => t.status === 'deployed' && t.volume24h !== undefined)
    .sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0))
    .slice(0, limit);
}

// Seed mock data if empty (for demo/dev purposes)
// async function seedMockData() {
//   // Disabled for production cleanliness - agents will populate this
//   const tokens = await getAllTokens();
//   if (tokens.length > 0) return;
//   
//   if (!IS_KV_CONFIGURED) {
//     console.log('In-memory store initialized (empty)');
//   } else {
//     console.log('Vercel KV connected');
//   }
// }

// Trigger seed
// seedMockData().catch(console.error);
