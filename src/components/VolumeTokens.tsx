"use client";

import { useState, useEffect } from "react";
import { TokenLaunch } from "@/lib/types";

export default function VolumeTokens() {
  const [tokens, setTokens] = useState<TokenLaunch[]>([]);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await fetch('/api/tokens?filter=volume&limit=6');
        const data = await res.json();
        setTokens(data.tokens || []);
      } catch (error) {
        console.error('Failed to fetch volume tokens:', error);
      }
    };

    fetchTokens();
    const interval = setInterval(fetchTokens, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="volume-tokens-container">
      <h2 className="section-title">
        <span>📊</span>
        Top Volume
      </h2>

      <div className="volume-tokens-list">
        {tokens.map((token, index) => (
          <div key={token.id} className="volume-token-row">
            <span className="volume-rank">#{index + 1}</span>
            <div className="volume-token-icon">
              {token.image ? (
                <img src={token.image} alt={token.name} />
              ) : (
                <span>🦞</span>
              )}
            </div>
            <div className="volume-token-name">
              <span>{token.name}</span>
              <span className="symbol">${token.symbol}</span>
            </div>
            <div className="volume-amount">
              {formatVolume(token.volume24h)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatVolume(vol?: number): string {
  if (!vol) return '$0';
  if (vol >= 1000000) return `$${(vol / 1000000).toFixed(2)}M`;
  if (vol >= 1000) return `$${(vol / 1000).toFixed(1)}K`;
  return `$${vol}`;
}
