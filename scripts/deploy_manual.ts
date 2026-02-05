import { Clanker } from 'clanker-sdk/v4';
import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import * as dotenv from 'dotenv';

// Load env vars if needed
dotenv.config();

// Configuration
const PRIVATE_KEY = '0x02cb7180a1c4b3c0b47b225a74d0197f9f00d897e2303b691ba60524859ebf09'; // User provided key
const PLATFORM_WALLET = '0x8644EBC4126a7EB130dCddC6e3C215d0EdC2F9eE';
const POST_OWNER_WALLET = '0xEAD642Ef58F162a11f4d9346FA59a07F5CDfE896'; // From user's example post

async function main() {
  console.log('🚀 Starting Manual Token Deployment...');

  try {
    const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
    console.log(`🔑 Wallet: ${account.address}`);

    const publicClient = createPublicClient({
      chain: base,
      transport: http()
    });

    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http()
    });

    // Initialize SDK
    // @ts-ignore
    const clanker = new Clanker({
      publicClient: publicClient as any,
      wallet: walletClient as any,
    });

    console.log('📡 Deploying token to Clanker...');

    const { txHash, waitForTransaction, error } = await clanker.deploy({
      name: "Molenker Test",
      symbol: "MOLTEST",
      tokenAdmin: PLATFORM_WALLET as `0x${string}`,
      image: "https://pbs.twimg.com/profile_images/2018808665302609921/Ejai0BGm_400x400.jpg",
      metadata: {
        description: "Manual test deployment via Molenker CLI",
        socialMediaUrls: [],
        auditUrls: [],
      },
      context: {
        interface: 'Molenker CLI',
        platform: 'moltx',
        messageId: 'manual-test-01',
        id: POST_OWNER_WALLET,
      },
      rewards: {
        recipients: [
          {
            admin: PLATFORM_WALLET as `0x${string}`,
            recipient: POST_OWNER_WALLET as `0x${string}`,
            bps: 9000,
            token: 'Both',
          },
          {
            admin: PLATFORM_WALLET as `0x${string}`,
            recipient: PLATFORM_WALLET as `0x${string}`,
            bps: 1000,
            token: 'Both',
          },
        ]
      },
      // Using standard position (meme)
      // vanity: true, // Optional
    });

    if (error) {
      console.error('❌ Deployment Request Failed:', error);
      process.exit(1);
    }

    console.log(`✅ Transaction Sent! Hash: ${txHash}`);
    console.log('⏳ Waiting for confirmation...');

    const { address, error: waitError } = await waitForTransaction();

    if (waitError) {
      console.error('❌ Confirmation Failed:', waitError);
      process.exit(1);
    }

    console.log(`🎉 Token Deployed Successfully!`);
    console.log(`📍 Address: ${address}`);
    console.log(`🌐 Link: https://clanker.world/token/${address}`);

  } catch (err) {
    console.error('❌ Fatal Error:', err);
    process.exit(1);
  }
}

main();
