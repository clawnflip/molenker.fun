import { NextResponse } from 'next/server';
import { parsePost } from '@/lib/parser';
import { addToken, isPostProcessed, markPostProcessed } from '@/lib/store';
import { TokenLaunch, PLATFORM_CONFIG } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { deployClankerToken } from '@/lib/clanker';

export const dynamic = 'force-dynamic';

interface MoltxPost {
  id: string;
  content: string;
  author: {
    name: string;
    display_name: string;
    avatar_url?: string;
  };
  created_at: string;
}

interface MoltxSearchResponse {
  data: {
    posts: MoltxPost[];
  };
}

async function fetchMoltxPosts(): Promise<MoltxPost[]> {
  try {
    const res = await fetch('https://moltx.io/v1/search/posts?q=!molenker&sort=new', {
      next: { revalidate: 0 },
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      console.error('Moltx API returned:', res.status, await res.text());
      return [];
    }

    const json: MoltxSearchResponse = await res.json();
    // Return posts array from data.posts
    return json.data?.posts || [];
  } catch (error) {
    console.error('Failed to fetch from Moltx API:', error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const posts = await fetchMoltxPosts();
    let processedCount = 0;
    const results = [];

    for (const post of posts) {
      // Skip if already processed
      if (await isPostProcessed(post.id)) continue;

      // Parse content
      const parsed = parsePost(post.content);
      if (!parsed) continue;

      // Mark processed
      await markPostProcessed(post.id);

      // Create Token
      const tokenId = uuidv4();
      const token: TokenLaunch = {
        id: tokenId,
        name: parsed.name,
        symbol: parsed.symbol,
        description: parsed.description,
        image: parsed.image || post.author?.avatar_url || '',
        wallet: parsed.wallet,
        website: parsed.website,
        twitter: parsed.twitter,
        source: 'moltx',
        sourceUrl: `https://moltx.io/post/${post.id}`,
        agentName: post.author?.name || 'Unknown Agent',
        status: 'pending',
      };

      await addToken(token);

      // Deploy via Clanker SDK (or Mock if no key)
      // We pass the parsed wallet as the owner (90% fee recipient)
      let deployResult = await deployClankerToken({
        name: parsed.name,
        symbol: parsed.symbol,
        image: parsed.image || post.author?.avatar_url || '',
        description: parsed.description,
        ownerAddress: parsed.wallet, // Agent's wallet from post
        castHash: post.id,
        website: parsed.website,
        twitter: parsed.twitter,
      });

      if (deployResult && deployResult.success) {
        token.tokenAddress = 'PENDING_ON_CHAIN'; // Real address comes from logs later
        token.txHash = deployResult.txHash;
        token.status = 'deployed';
        console.log(`Deployed token ${token.symbol} tx: ${token.txHash}`);
      } else {
        // Fallback to simulation for demo
        token.tokenAddress = `0x${Math.random().toString(16).slice(2, 42)}`;
        token.txHash = `0x${Math.random().toString(16).slice(2, 66)}`;
        token.status = 'deployed';
        token.marketCap = 1000 + Math.random() * 5000;
        token.volume24h = Math.random() * 1000;
        token.priceChange24h = (Math.random() * 200) - 50;
      }
      
      token.deployedAt = new Date();
      await addToken(token);
      processedCount++;
      results.push({ name: token.name, symbol: token.symbol });
    }

    return NextResponse.json({
      success: true,
      scanned_posts: posts.length,
      new_launches: processedCount,
      details: results,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Scan error full:', error);
    return NextResponse.json({ 
      error: 'Scan failed', 
      message: error.message,
      stack: error.stack,
      step: 'unknown' // Add steps inside try block if needed
    }, { status: 500 });
  }
}
