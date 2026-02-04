# molenker.fun 🦞

The #1 token launchpad on Base. Deploy your token in seconds and earn 90% of
trading fees.

## Features

- 🦞 **Easy Token Creation** - Launch your token in seconds
- 💰 **90% Fee Share** - You keep 90% of all trading fees
- 🔥 **Trending Tokens** - Discover hot tokens on Base
- ⚡ **Built on Clanker** - Powered by audited smart contracts

## Tech Stack

- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS
- **Blockchain**: Base Network (L2)
- **Token Deploy**: Clanker SDK v4
- **Wallet**: RainbowKit + wagmi

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Deployment

This project is configured for Vercel deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Fee Structure

| Recipient        | Share          |
| ---------------- | -------------- |
| Token Creator    | 90%            |
| molenker.fun     | 10%            |
| Clanker Protocol | 20% (separate) |

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_PLATFORM_WALLET=0xYOUR_PLATFORM_WALLET_ADDRESS
NEXT_PUBLIC_PLATFORM_ADMIN=0xYOUR_ADMIN_WALLET_ADDRESS
```

## License

MIT

---

Made with 🦞 by molenker.fun team
