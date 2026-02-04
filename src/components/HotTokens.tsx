"use client";

import { useState, useEffect } from "react";
import { TokenLaunch } from "@/lib/types";

export default function HotTokens() {
  const [tokens, setTokens] = useState<TokenLaunch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotTokens = async () => {
      try {
        const res = await fetch('/api/tokens?filter=hot&limit=6');
        const data = await res.json();
        setTokens(data.tokens || []);
      } catch (error) {
        console.error('Failed to fetch hot tokens:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotTokens();
    const interval = setInterval(fetchHotTokens, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="hot-tokens-loading">Loading hot tokens...</div>;
  }

  return (
    <div className="hot-tokens-container">
      <h2 className="section-title">
        <span>🔥</span>
        HOT Tokens
        <span className="hot-badge">TOP GAINERS</span>
      </h2>

      <div className="hot-tokens-grid">
        {tokens.map((token, index) => (
          <div 
            key={token.id} 
            className="hot-token-card"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="hot-rank">#{index + 1}</div>
            
            <div className="hot-token-icon">
              {token.image ? (
                <img src={token.image} alt={token.name} />
              ) : (
                <span>🦞</span>
              )}
            </div>
            
            <div className="hot-token-info">
              <div className="hot-token-name">{token.name}</div>
              <div className="hot-token-symbol">${token.symbol}</div>
            </div>
            
            <div className="hot-token-change positive">
              +{token.priceChange24h?.toFixed(1)}%
            </div>
            
            <div className="hot-token-mc">
              {formatMC(token.marketCap)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatMC(mc?: number): string {
  if (!mc) return '$0';
  if (mc >= 1000000) return `$${(mc / 1000000).toFixed(2)}M`;
  if (mc >= 1000) return `$${(mc / 1000).toFixed(1)}K`;
  return `$${mc}`;
}
