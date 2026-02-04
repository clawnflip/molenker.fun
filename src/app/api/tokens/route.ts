import { NextResponse } from 'next/server';
import { getTokens, getHotTokens, getNewTokens, getTopVolumeTokens, getStats, getTokenByAddress } from '@/lib/store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const source = searchParams.get('source') as 'moltx' | 'moltbook' | '4claw' | null;
  const status = searchParams.get('status') as 'pending' | 'deployed' | 'failed' | null;
  const sortBy = searchParams.get('sort') as 'newest' | 'marketCap' | 'volume' | null;
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');
  const address = searchParams.get('address');
  const filter = searchParams.get('filter'); // 'hot', 'new', 'volume'

  // Get token by addresss
  if (address) {
    const token = await getTokenByAddress(address);
    if (token) {
      return NextResponse.json({ token });
    }
    return NextResponse.json({ error: 'Token not found' }, { status: 404 });
  }

  // Get filtered tokens
  if (filter === 'hot') {
    return NextResponse.json({
      tokens: await getHotTokens(limit),
      filter: 'hot',
    });
  }

  if (filter === 'new') {
    return NextResponse.json({
      tokens: await getNewTokens(limit),
      filter: 'new',
    });
  }

  if (filter === 'volume') {
    return NextResponse.json({
      tokens: await getTopVolumeTokens(limit),
      filter: 'volume',
    });
  }

  // Get all tokens with filters
  const tokens = await getTokens({
    source: source || undefined,
    status: status || undefined,
    sortBy: sortBy || 'newest',
    limit,
    offset,
  });

  const stats = await getStats();

  return NextResponse.json({
    tokens,
    stats,
    pagination: {
      limit,
      offset,
      hasMore: tokens.length === limit,
    },
  });
}
