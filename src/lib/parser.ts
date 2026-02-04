import { ParsedLaunchData, PLATFORM_CONFIG } from './types';

/**
 * Parse !molenker post content to extract token launch data
 * Supports both key:value format and JSON format
 */
export function parsePost(content: string): ParsedLaunchData | null {
  // Check for trigger command
  if (!content.includes(PLATFORM_CONFIG.TRIGGER_COMMAND)) {
    return null;
  }

  // Try JSON format first (in code block)
  const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (jsonMatch) {
    try {
      const data = JSON.parse(jsonMatch[1]);
      return validateAndNormalize(data);
    } catch {
      // Fall through to key:value parsing
    }
  }

  // Try key:value format
  const data: Record<string, string> = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    // Match "key: value" or "key = value" format
    const match = line.match(/^\s*(\w+)\s*[:=]\s*(.+?)\s*$/);
    if (match) {
      const key = match[1].toLowerCase();
      const value = match[2].trim();
      data[key] = value;
    }
  }

  return validateAndNormalize(data);
}

/**
 * Validate and normalize parsed data
 */
function validateAndNormalize(data: Record<string, string>): ParsedLaunchData | null {
  // Map alternative field names
  const fieldMappings: Record<string, string[]> = {
    name: ['name', 'token', 'token_name'],
    symbol: ['symbol', 'ticker'],
    wallet: ['wallet', 'address', 'recipient'],
    description: ['description', 'desc', 'about', 'bio'],
    image: ['image', 'img', 'logo', 'icon'],
    website: ['website', 'site', 'url', 'link', 'homepage'],
    twitter: ['twitter', 'x', 'social'],
  };

  const normalized: Record<string, string> = {};
  
  for (const [targetField, sourceFields] of Object.entries(fieldMappings)) {
    for (const sourceField of sourceFields) {
      if (data[sourceField]) {
        normalized[targetField] = data[sourceField];
        break;
      }
    }
  }

  // Validate required fields
  const requiredFields = ['name', 'symbol', 'wallet', 'description', 'image'];
  for (const field of requiredFields) {
    if (!normalized[field]) {
      console.error(`Missing required field: ${field}`);
      return null;
    }
  }

  // Validate wallet format
  if (!isValidWallet(normalized.wallet)) {
    console.error('Invalid wallet address format');
    return null;
  }

  // Validate image URL
  if (!isValidImageUrl(normalized.image)) {
    console.error('Invalid image URL');
    return null;
  }

  // Normalize symbol to uppercase
  normalized.symbol = normalized.symbol.toUpperCase();

  // Trim lengths
  normalized.name = normalized.name.slice(0, 50);
  normalized.symbol = normalized.symbol.slice(0, 10);
  normalized.description = normalized.description.slice(0, 500);

  return normalized as unknown as ParsedLaunchData;
}

/**
 * Validate wallet address format
 */
function isValidWallet(wallet: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(wallet);
}

/**
 * Validate image URL
 */
function isValidImageUrl(url: string): boolean {
  // Check for known image hosts
  const knownHosts = [
    'iili.io',
    'i.imgur.com',
    'arweave.net',
    'ipfs.io',
    'cloudflare-ipfs.com',
  ];

  try {
    const parsed = new URL(url);
    
    // Check known hosts
    if (knownHosts.some(host => parsed.hostname.includes(host))) {
      return true;
    }
    
    // Check file extension
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
    if (imageExtensions.some(ext => parsed.pathname.toLowerCase().endsWith(ext))) {
      return true;
    }
    
    // Check IPFS protocol
    if (url.startsWith('ipfs://')) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Extract errors from parsing attempt
 */
export function getParseErrors(content: string): string[] {
  const errors: string[] = [];
  
  if (!content.includes(PLATFORM_CONFIG.TRIGGER_COMMAND)) {
    errors.push(`Missing ${PLATFORM_CONFIG.TRIGGER_COMMAND} trigger`);
    return errors;
  }

  // Try to parse and collect specific errors
  const data: Record<string, string> = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^\s*(\w+)\s*[:=]\s*(.+?)\s*$/);
    if (match) {
      data[match[1].toLowerCase()] = match[2].trim();
    }
  }

  // Check required fields
  const requiredFields = ['name', 'symbol', 'wallet', 'description', 'image'];
  for (const field of requiredFields) {
    const alternates: Record<string, string[]> = {
      name: ['name', 'token', 'token_name'],
      symbol: ['symbol', 'ticker'],
      wallet: ['wallet', 'address', 'recipient'],
      description: ['description', 'desc', 'about', 'bio'],
      image: ['image', 'img', 'logo', 'icon'],
    };
    
    const found = alternates[field]?.some(alt => data[alt]);
    if (!found) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate wallet if present
  const wallet = data.wallet || data.address || data.recipient;
  if (wallet && !isValidWallet(wallet)) {
    errors.push('Invalid wallet address (must be 0x + 40 hex characters)');
  }

  // Validate image if present
  const image = data.image || data.img || data.logo || data.icon;
  if (image && !isValidImageUrl(image)) {
    errors.push('Invalid image URL (must be direct link to image file)');
  }

  return errors;
}
