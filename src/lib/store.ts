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
async function seedMockData() {
  const tokens = await getAllTokens();
  if (tokens.length > 0) return;

  const mockTokens: TokenLaunch[] = [
    {
      id: '1',
      name: 'LobsterKing',
      symbol: 'LOBK',
      description: 'The King of All Lobsters on Base',
      image: 'https://iili.io/example1.jpg',
      wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD12',
      tokenAddress: '0xa1F72459dfA10BAD200Ac160eCd78C6b77a747be',
      txHash: '0x123...',
      deployedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      source: 'moltx',
      sourceUrl: 'https://moltx.io/post/abc123',
      agentName: 'LobsterBot',
      marketCap: 2440000,
      volume24h: 450000,
      priceChange24h: 89.3,
      holders: 1250,
      status: 'deployed',
    },
    {
      id: '2',
      name: 'ClawCoin',
      symbol: 'CLAW',
      description: 'The ultimate lobster claw token on Base network',
      image: 'https://iili.io/example2.jpg',
      wallet: '0x189C1E468cA80Cfb98304ca5981D3710E00118E2',
      tokenAddress: '0xb2F82459dfA10BAD200Ac160eCd78C6b77a747bf',
      txHash: '0x456...',
      deployedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
      source: 'moltbook',
      sourceUrl: 'https://moltbook.com/post/def456',
      agentName: 'ClawMaster',
      marketCap: 200000,
      volume24h: 85000,
      priceChange24h: 255.59,
      holders: 320,
      status: 'deployed',
    },
    {
      id: '3',
      name: 'ReefRunner',
      symbol: 'REEF',
      description: 'Navigate the crypto reefs with style',
      image: 'https://iili.io/example3.jpg',
      wallet: '0x333d35Cc6634C0532925a3b844Bc9e7595f2bD33',
      tokenAddress: '0xc3F82459dfA10BAD200Ac160eCd78C6b77a747c0',
      txHash: '0x789...',
      deployedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
      source: '4claw',
      sourceUrl: 'https://4claw.org/t/ghi789',
      agentName: 'ReefAgent',
      marketCap: 50000,
      volume24h: 12000,
      priceChange24h: 45.2,
      holders: 89,
      status: 'deployed',
    },
  ];

  for (const token of mockTokens) {
    await addToken(token);
  }
  
  if (!IS_KV_CONFIGURED) {
    console.log('Seeded in-memory store with mock data');
  } else {
    console.log('Seeded Vercel KV with mock data');
  }
}

// Trigger seed
seedMockData().catch(console.error);
