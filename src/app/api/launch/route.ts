import { NextResponse } from 'next/server';
import { parsePost, getParseErrors } from '@/lib/parser';
import { addToken, isPostProcessed, markPostProcessed } from '@/lib/store';
import { TokenLaunch, PLATFORM_CONFIG } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

// Moltbook launch endpoint - requires API call
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { moltbook_key, post_id } = body;

    if (!post_id) {
      return NextResponse.json({
        error: 'Missing post_id',
        errors: ['post_id is required'],
      }, { status: 400 });
    }

    // Check if already processed
    const isProcessed = await isPostProcessed(post_id);
    if (isProcessed) {
      return NextResponse.json({
        error: 'Post already processed',
        errors: ['This post has already been used for a launch'],
      }, { status: 400 });
    }

    // Fetch post content from Moltbook
    let postData: { content: string; author: string; url: string };
    
    if (moltbook_key) {
      // Moltbook source
      try {
        const response = await fetch(`https://www.moltbook.com/api/v1/posts/${post_id}`, {
          headers: {
            'Authorization': `Bearer ${moltbook_key}`,
          },
        });
        
        if (!response.ok) {
          return NextResponse.json({
            error: 'Failed to fetch post from Moltbook',
            errors: ['Could not retrieve post. Check post_id and API key.'],
          }, { status: 400 });
        }
        
        const data = await response.json();
        postData = {
          content: data.post?.content || data.content || '',
          author: data.post?.author || data.author || 'Unknown',
          url: `https://www.moltbook.com/post/${post_id}`,
        };
      } catch {
        return NextResponse.json({
          error: 'Failed to connect to Moltbook',
          errors: ['Network error connecting to Moltbook API'],
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({
        error: 'Missing moltbook_key',
        errors: ['moltbook_key is required for Moltbook launches'],
      }, { status: 400 });
    }

    // Parse the post content
    const parsed = parsePost(postData.content);
    
    if (!parsed) {
      const errors = getParseErrors(postData.content);
      return NextResponse.json({
        error: 'Invalid launch format',
        errors: errors.length > 0 ? errors : ['Could not parse launch data from post'],
      }, { status: 400 });
    }

    // Mark as processed to prevent duplicate launches
    await markPostProcessed(post_id);

    // Create token record
    const tokenId = uuidv4();
    const token: TokenLaunch = {
      id: tokenId,
      name: parsed.name,
      symbol: parsed.symbol,
      description: parsed.description,
      image: parsed.image,
      wallet: parsed.wallet,
      website: parsed.website,
      twitter: parsed.twitter,
      source: 'moltbook',
      sourceUrl: postData.url,
      agentName: postData.author,
      status: 'pending',
    };

    await addToken(token);

    // TODO: Deploy via Clanker SDK
    // For now, simulate deployment
    const mockTokenAddress = `0x${Math.random().toString(16).slice(2, 42)}`;
    const mockTxHash = `0x${Math.random().toString(16).slice(2, 66)}`;

    // Update token with deployment info
    token.tokenAddress = mockTokenAddress;
    token.txHash = mockTxHash;
    token.deployedAt = new Date();
    token.status = 'deployed';
    token.marketCap = Math.floor(Math.random() * 100000);
    token.volume24h = Math.floor(Math.random() * 50000);
    token.priceChange24h = Math.random() * 100;
    
    // Save updated token
    await addToken(token); // Or use updateToken, addToken covers overwrite if needed for simpler KV logic

    return NextResponse.json({
      success: true,
      agent: postData.author,
      post_id: post_id,
      post_url: postData.url,
      token_address: token.tokenAddress,
      tx_hash: token.txHash,
      clanker_url: `https://clanker.world/clanker/${token.tokenAddress}`,
      explorer_url: `https://basescan.org/token/${token.tokenAddress}`,
      rewards: {
        agent_share: `${PLATFORM_CONFIG.AGENT_FEE_SHARE}%`,
        platform_share: `${PLATFORM_CONFIG.PLATFORM_FEE_SHARE}%`,
        agent_wallet: parsed.wallet,
      },
    });

  } catch (error) {
    console.error('Launch error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      errors: ['An unexpected error occurred'],
    }, { status: 500 });
  }
}
