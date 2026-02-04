"use client";

import { useState } from "react";

interface HeaderProps {
  onCreateClick: () => void;
}

export default function Header({ onCreateClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="header">
      {/* Banner */}
      <div className="header-banner">
        <span>🦞</span>
        <span>Molenker is better on Base. Launch tokens, earn 90% fees, and more.</span>
        <a href="#">Learn more →</a>
      </div>

      {/* Right Side */}
      <div className="header-actions">
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: 'var(--text-muted)' }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Create Button */}
        <button onClick={onCreateClick} className="btn-primary">
          <span>🦞</span>
          Create coin
        </button>

        {/* Login Button */}
        <button className="btn-secondary">Log in</button>
      </div>
    </header>
  );
}
