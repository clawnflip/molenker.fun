"use client";

import Link from "next/link";

interface SidebarProps {
  onCreateClick: () => void;
}

export default function Sidebar({ onCreateClick }: SidebarProps) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <Link href="/" className="sidebar-logo">
        <span className="sidebar-logo-icon animate-float">🦞</span>
        <div>
          <span className="sidebar-logo-text">molenker</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '-4px' }}>.fun</span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <Link href="/" className="nav-item active">
          <span className="nav-item-icon">🏠</span>
          Home
        </Link>
        
        <Link href="/livestreams" className="nav-item">
          <span className="nav-item-icon">📺</span>
          Livestreams
        </Link>
        
        <Link href="/terminal" className="nav-item">
          <span className="nav-item-icon">💻</span>
          Terminal
        </Link>
        
        <Link href="/chat" className="nav-item">
          <span className="nav-item-icon">💬</span>
          Chat
        </Link>
        
        <Link href="/support" className="nav-item">
          <span className="nav-item-icon">❓</span>
          Support
        </Link>
        
        <Link href="/more" className="nav-item">
          <span className="nav-item-icon">⋯</span>
          More
        </Link>
      </nav>

      {/* Create Button */}
      <div className="sidebar-create-btn">
        <button onClick={onCreateClick} className="btn-primary" style={{ width: '100%' }}>
          <span>🦞</span>
          Create coin
        </button>
      </div>

      {/* App Box */}
      <div className="sidebar-app-box">
        <h3 className="sidebar-app-title">
          <span>📱</span>
          Molenker app
        </h3>
        <div className="sidebar-qr">🦞</div>
        <p className="sidebar-app-hint">Scan to download</p>
        <button className="btn-secondary" style={{ width: '100%', fontSize: '12px', padding: '8px' }}>
          Learn more
        </button>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-links">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
        <p className="sidebar-footer-copy">© 2024 molenker.fun</p>
      </div>
    </aside>
  );
}
