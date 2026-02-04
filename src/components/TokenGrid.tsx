"use client";

interface TokenGridProps {
  filter: string;
}

const tokens = [
  { id: 1, name: "JOJ", symbol: "JOJ", image: "🧑‍🎨", creator: "@moji75", createdAt: "7m ago", marketCap: "$4.1K", change: "+30.46%", positive: true, description: "Just a fun meme token on Base" },
  { id: 2, name: "eCash", symbol: "ECASH", image: "💵", creator: "@EE313Y", createdAt: "8m ago", marketCap: "$20.0K", change: "+138.24%", positive: true, description: "In 1960, David Chaum created a digital currency called eCash, laying the..." },
  { id: 3, name: "Joogle", symbol: "JOOGLE", image: "🔍", creator: "@2YhTn8", createdAt: "2h ago", marketCap: "$293.5K", change: "+3.59%", positive: true, description: "joogle.io a search engine for exploring publicly available Epstein-related..." },
  { id: 4, name: "LobsterFi", symbol: "LOBFI", image: "🦞", creator: "@lobsterking", createdAt: "5m ago", marketCap: "$5.7K", change: "+47.54%", positive: true, description: "The first DeFi protocol for lobsters, as mentioned by Epstein in the..." },
  { id: 5, name: "Base44", symbol: "BASE44", image: "🔷", creator: "@7qAs6v", createdAt: "7d ago", marketCap: "$21.7K", change: "+39.32%", positive: true, description: "Base44 is an AI-powered app builder that lets you create simple software tools ju..." },
  { id: 6, name: "Simpstein", symbol: "SIMP", image: "🟡", creator: "@FqoSLp", createdAt: "1h ago", marketCap: "$99.7K", change: "+27.61%", positive: true, description: "Simpsons 'Epstein Island' Prediction Meme From Season 12, Episode 6 'The..." },
  { id: 7, name: "Oods", symbol: "OODS", image: "🟠", creator: "@FbXGOW", createdAt: "27m ago", marketCap: "$189.5K", change: "-1.84%", positive: false, description: "Price discovery through prediction markets. Fair distribution. No rug..." },
  { id: 8, name: "ClawCoin", symbol: "CLAW", image: "🦞", creator: "@clawmaster", createdAt: "15m ago", marketCap: "$20.0K", change: "+255.59%", positive: true, description: "The ultimate lobster claw token on Base network" },
];

export default function TokenGrid({ filter }: TokenGridProps) {
  return (
    <div className="token-grid">
      {tokens.map((token) => (
        <div key={token.id} className="token-card">
          <div className="token-card-header">
            <div className="token-card-icon">{token.image}</div>
            <div className="token-card-main">
              <div className="token-card-top">
                <div>
                  <div className="token-card-name">{token.name}</div>
                  <div className="token-card-symbol">{token.symbol}</div>
                </div>
                <div className={`token-card-change ${token.positive ? 'positive' : 'negative'}`}>
                  {token.change}
                </div>
              </div>
              <div className="token-card-meta">
                <span>{token.creator}</span>
                <span>•</span>
                <span>{token.createdAt}</span>
              </div>
              <div className="token-card-footer">
                <span className="token-card-mc">MC: {token.marketCap}</span>
                <div className="token-card-bar">
                  <div className="token-card-bar-fill" style={{ width: `${Math.floor(Math.random() * 80) + 20}%` }} />
                </div>
              </div>
              <div className="token-card-desc">{token.description}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
