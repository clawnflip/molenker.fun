"use client";

const trendingCoins = [
  { id: 1, name: "Accelerando", symbol: "ACCEL", image: "🚀", marketCap: "$1.52M", change: "+45.2%", description: "Are We Just Living In Accelerando Now?" },
  { id: 2, name: "LobsterKing", symbol: "LOBK", image: "🦞", marketCap: "$2.44M", change: "+89.3%", description: "The King of All Lobsters on Base" },
  { id: 3, name: "BasedClaw", symbol: "CLAW", image: "🦀", marketCap: "$25.57M", change: "+156.7%", description: "When They Said 'Buy The Bottom'" },
  { id: 4, name: "RedWave", symbol: "RWAVE", image: "🔴", marketCap: "$3.20M", change: "+34.1%", description: "The Red Wave Is Coming" },
  { id: 5, name: "PinchyCoin", symbol: "PINCH", image: "🦞", marketCap: "$26.14M", change: "+201.5%", description: "Pinchy Goes To The Moon" },
  { id: 6, name: "ShellToken", symbol: "SHELL", image: "🐚", marketCap: "$5.39M", change: "+67.8%", description: "Hard Shell, Soft Heart" },
];

export default function TrendingCoins() {
  return (
    <div className="trending-scroll">
      {trendingCoins.map((coin) => (
        <div key={coin.id} className="trending-card">
          <div className="trending-card-image">
            <span>{coin.image}</span>
            <div className="trending-card-mc">{coin.marketCap}</div>
          </div>
          <div className="trending-card-info">
            <div className="trending-card-name">{coin.name}</div>
            <div className="trending-card-change positive">{coin.change}</div>
            <div className="trending-card-desc">{coin.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
