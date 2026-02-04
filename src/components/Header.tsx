"use client";

import Link from "next/link";

interface HeaderProps {}

export default function Header({}: HeaderProps) {
  return (
    <header className="header">
      {/* Banner */}
      <div className="header-banner">
        <span>🦞</span>
        <span>Molenker is better on Base. Launch tokens, earn 90% fees, and more.</span>
        <Link href="/support">Learn more →</Link>
      </div>

      {/* Right Side */}
      <div className="header-actions">
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
          />
        </div>
      </div>
    </header>
  );
}
