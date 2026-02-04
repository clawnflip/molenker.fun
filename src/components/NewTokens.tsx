"use client";

import { useState, useEffect } from "react";
import { TokenLaunch } from "@/lib/types";

interface NewTokensProps {
  tokens?: TokenLaunch[];
}

export default function NewTokens({ tokens: initialTokens }: NewTokensProps) {
  const [tokens, setTokens] = useState<TokenLaunch[]>(initialTokens || []);
  const [newTokenFlash, setNewTokenFlash] = useState<string | null>(null);

  useEffect(() => {
    // Fetch new tokens periodically
    const fetchTokens = async () => {
      try {
        const res = await fetch('/api/tokens?filter=new&limit=5');
        const data = await res.json();
        
        if (data.tokens && data.tokens.length > 0) {
          // Check if there's a new token
          const newToken = data.tokens.find((t: TokenLaunch) => 
            !tokens.some(existing => existing.id === t.id)
          );
          
          if (newToken) {
            setNewTokenFlash(newToken.id);
            setTimeout(() => setNewTokenFlash(null), 3000);
          }
          
          setTokens(data.tokens);
        }
      } catch (error) {
        console.error('Failed to fetch new tokens:', error);
      }
    };

    fetchTokens();
    const interval = setInterval(fetchTokens, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [tokens]);

  if (tokens.length === 0) {
    return (
      <div className="new-tokens-empty">
        <span className="pulse-emoji">🦞</span>
        <p>Waiting for new launches...</p>
      </div>
    );
  }

  return (
    <div className="new-tokens-container">
      <div className="new-tokens-header">
        <h2 className="section-title">
          <span className="fire-animation">🔥</span>
          New Launches
          <span className="live-badge">LIVE</span>
        </h2>
      </div>
      
      <div className="new-tokens-grid">
        {tokens.map((token, index) => (
          <div 
            key={token.id} 
            className={`new-token-card ${newTokenFlash === token.id ? 'flash' : ''}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="new-token-badge">
              {getTimeSince(token.deployedAt)}
            </div>
            
            <div className="new-token-icon">
              {token.image ? (
                <img src={token.image} alt={token.name} />
              ) : (
                <span>🦞</span>
              )}
            </div>
            
            <div className="new-token-info">
              <div className="new-token-name">{token.name}</div>
              <div className="new-token-symbol">${token.symbol}</div>
            </div>
            
            <div className="new-token-stats">
              <div className="new-token-mc">
                <span className="label">MC</span>
                <span className="value">{formatMC(token.marketCap)}</span>
              </div>
              {token.priceChange24h !== undefined && (
                <div className={`new-token-change ${token.priceChange24h >= 0 ? 'positive' : 'negative'}`}>
                  {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(1)}%
                </div>
              )}
            </div>
            
            <div className="new-token-source">
              via {token.source}
            </div>
          </div>
        ))}
      </div>
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
  return `$${mc}`;
}
