import { NextResponse } from 'next/server';
import { getStats, getNewTokens, getHotTokens, getTopVolumeTokens } from '@/lib/store';

export async function GET() {
  const stats = await getStats();
  const newTokens = await getNewTokens(5);
  const hotTokens = await getHotTokens(5);
  const topVolume = await getTopVolumeTokens(5);

  return NextResponse.json({
    stats,
    highlights: {
      new: newTokens.length,
      hot: hotTokens.length,
      topVolume: topVolume.length,
    },
    lastUpdated: new Date().toISOString(),
  });
}
