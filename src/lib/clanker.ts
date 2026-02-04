import { Clanker } from 'clanker-sdk/v4';
import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

// Platform Wallet - receives 10% of rewards
const PLATFORM_WALLET = '0x8644EBC4126a7EB130dCddC6e3C215d0EdC2F9eE';

interface DeployParams {
  name: string;
  symbol: string;
  image: string;
  description: string;
  ownerAddress: string; // Post owner's wallet - receives 90% of rewards
  castHash?: string;
  website?: string;
  twitter?: string;
}

interface DeployResult {
  success: boolean;
  txHash?: string;
  tokenAddress?: string;
  error?: any;
}

export async function deployClankerToken(params: DeployParams): Promise<DeployResult> {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  
  if (!privateKey) {
    console.log('DEPLOYER_PRIVATE_KEY not set - returning null for mock mode');
    return { success: false, error: 'No private key configured' };
  }

  try {
    // Setup viem clients
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    
    const publicClient = createPublicClient({
      chain: base,
      transport: http()
    });
    
    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http()
    });

    // Initialize Clanker SDK
    // Using 'as any' to bypass viem version mismatch between project and SDK
    const clanker = new Clanker({
      publicClient: publicClient as any,
      wallet: walletClient as any,
    });

    // Build social URLs with proper format
    const socialMediaUrls: { platform: string; url: string }[] = [];
    if (params.website) {
      socialMediaUrls.push({ platform: 'website', url: params.website });
    }
    if (params.twitter) {
      socialMediaUrls.push({ 
        platform: 'twitter', 
        url: `https://twitter.com/${params.twitter.replace('@', '')}` 
      });
    }

    // Deploy token with reward split:
    // 90% to post owner, 10% to platform
    const { txHash, waitForTransaction, error } = await clanker.deploy({
      name: params.name,
      symbol: params.symbol,
      tokenAdmin: PLATFORM_WALLET as `0x${string}`,
      image: params.image,
      metadata: {
        description: params.description,
        socialMediaUrls,
        auditUrls: [],
      },
      context: {
        interface: 'Molenker',
        platform: 'moltx',
        messageId: params.castHash || '',
        id: params.ownerAddress,
      },
      // Reward distribution with proper structure
      rewards: {
        recipients: [
          {
            admin: PLATFORM_WALLET as `0x${string}`,
            recipient: params.ownerAddress as `0x${string}`,
            bps: 9000, // 90%
            token: 'Both' as const,
          },
          {
            admin: PLATFORM_WALLET as `0x${string}`,
            recipient: PLATFORM_WALLET as `0x${string}`,
            bps: 1000, // 10%
            token: 'Both' as const,
          },
        ],
      },
    });

    if (error) {
      console.error('Clanker deploy error:', error);
      return { success: false, error };
    }

    console.log(`Token deployment tx: ${txHash}`);

    // Wait for deployment to complete
    const { address, error: waitError } = await waitForTransaction();
    
    if (waitError) {
      console.error('Waiting for tx error:', waitError);
      return { success: true, txHash, error: waitError };
    }

    console.log(`Token deployed at: ${address}`);

    return {
      success: true,
      txHash,
      tokenAddress: address,
    };

  } catch (err) {
    console.error('Clanker deployment failed:', err);
    return { success: false, error: err };
  }
}
