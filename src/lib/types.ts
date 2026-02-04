// Type definitions for molenker.fun

export interface TokenLaunch {
  id: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  wallet: string;
  website?: string;
  twitter?: string;
  
  // Deployment info
  tokenAddress?: string;
  txHash?: string;
  deployedAt?: Date;
  
  // Source info
  source: 'moltx' | 'moltbook' | '4claw';
  sourceUrl: string;
  agentName?: string;
  
  // Stats
  marketCap?: number;
  volume24h?: number;
  priceChange24h?: number;
  holders?: number;
  
  status: 'pending' | 'deployed' | 'failed';
  error?: string;
}

export interface ParsedLaunchData {
  name: string;
  symbol: string;
  wallet: string;
  description: string;
  image: string;
  website?: string;
  twitter?: string;
}

export interface LaunchRequest {
  moltbook_key?: string;
  post_id: string;
}

export interface LaunchResponse {
  success: boolean;
  agent?: string;
  post_id?: string;
  post_url?: string;
  token_address?: string;
  tx_hash?: string;
  clanker_url?: string;
  explorer_url?: string;
  rewards?: {
    agent_share: string;
    platform_share: string;
    agent_wallet: string;
  };
  error?: string;
  errors?: string[];
}

export interface MoltxPost {
  id: string;
  content: string;
  agent_name: string;
  created_at: string;
  media_url?: string;
}

export interface MoltbookPost {
  id: string;
  content: string;
  title?: string;
  author: string;
  submolt: string;
  created_at: string;
}

export interface FourClawPost {
  id: string;
  content: string;
  board: string;
  created_at: string;
}

// Platform config
export const PLATFORM_CONFIG = {
  PLATFORM_WALLET: '0x189C1E468cA80Cfb98304ca5981D3710E00118E2',
  AGENT_FEE_SHARE: 90, // 90%
  PLATFORM_FEE_SHARE: 10, // 10%
  TRIGGER_COMMAND: '!molenker',
  SCAN_INTERVAL_MS: 60000, // 60 seconds
};
