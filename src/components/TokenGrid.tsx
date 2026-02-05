"use client";

import { useEffect, useState } from "react";
import { TokenLaunch } from "@/lib/types";

interface TokenGridProps {
  filter: string;
}

export default function TokenGrid({ filter }: TokenGridProps) {
  const [tokens, setTokens] = useState<TokenLaunch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          filter: filter === 'hot' ? 'hot' : filter === 'volume' ? 'volume' : 'new',
          limit: '50'
        });
        
        // If "all" or specific sorting is needed differently from "filter", adjust here.
        // The API supports filter=hot|new|volume. 
        // If the UI filter "new" maps to API filter "new", etc.
        
        const res = await fetch(`/api/tokens?${query.toString()}`);
        const data = await res.json();
        
        if (data.tokens) {
          setTokens(data.tokens);
        }
      } catch (error) {
        console.error('Failed to fetch tokens:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
    const interval = setInterval(fetchTokens, 15000); // Poll every 15s for grid
    return () => clearInterval(interval);
  }, [filter]);

  if (loading && tokens.length === 0) {
    return (
      <div className="token-grid-loading">
        <div className="loading-spinner">🦞</div>
        <p>Loading fresh catches...</p>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="token-grid-empty">
        <p>No tokens found for this filter.</p>
        <p className="sub-text">Be the first to create one!</p>
      </div>
    );
  }

  return (
    <div className="token-grid">
      {tokens.map((token) => (
        <div key={token.id} className="token-card">
          <div className="token-card-header">
            <div className="token-card-icon">
              {token.image ? <img src={token.image} alt={token.name} /> : '🦞'}
            </div>
            <div className="token-card-main">
              <div className="token-card-top">
                <div>
                  <div className="token-card-name">{token.name}</div>
                  <div className="token-card-symbol">{token.symbol}</div>
                </div>
                <div className={`token-card-change ${
                    (token.priceChange24h || 0) >= 0 ? 'positive' : 'negative'
                  }`}>
                  {(token.priceChange24h || 0) >= 0 ? '+' : ''}
                  {(token.priceChange24h || 0).toFixed(2)}%
                </div>
              </div>
              <div className="token-card-meta">
                <span>{token.agentName ? `@${token.agentName}` : 'Unknown'}</span>
                <span>•</span>
                <span>{getTimeSince(token.deployedAt)}</span>
              </div>
              <div className="token-card-footer">
                <span className="token-card-mc">MC: {formatMC(token.marketCap)}</span>
                <div className="token-card-bar">
                   <div className="token-card-bar-fill" style={{ width: getBarWidth(token.marketCap) }} />
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

function getTimeSince(date?: Date | string): string {
  if (!date) return 'Just now';
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function formatMC(mc?: number): string {
  if (!mc) return '$0';
  if (mc >= 1000000) return `$${(mc / 1000000).toFixed(2)}M`;
  if (mc >= 1000) return `$${(mc / 1000).toFixed(1)}K`;
  return `$${mc.toFixed(0)}`;
}

function getBarWidth(mc?: number): string {
    if (!mc) return '5%';
    // Simple mock logic for bar width based on MC up to 1M
    const percentage = Math.min(100, Math.max(5, (mc / 1000000) * 100));
    return `${percentage}%`;
}
