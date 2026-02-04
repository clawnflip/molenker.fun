"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  onCreateClick: () => void;
}

export default function Sidebar({ onCreateClick }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <Link href="/" className="sidebar-logo">
        <span className="sidebar-logo-icon">🦞</span>
        <div className="sidebar-logo-text">
          <div>molenker</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400 }}>.fun</div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <Link href="/" className={`nav-item ${pathname === "/" ? "active" : ""}`}>
          <span className="nav-item-icon">🏠</span>
          Home
        </Link>
        
        <Link href="/terminal" className={`nav-item ${pathname === "/terminal" ? "active" : ""}`}>
          <span className="nav-item-icon">💻</span>
          Terminal
        </Link>
        
        <Link href="/chat" className={`nav-item ${pathname === "/chat" ? "active" : ""}`}>
          <span className="nav-item-icon">💬</span>
          Chat
        </Link>
        
        <Link href="/support" className={`nav-item ${pathname === "/support" ? "active" : ""}`}>
          <span className="nav-item-icon">❓</span>
          Support
        </Link>
      </nav>

      {/* App Box */}
      <div className="sidebar-app-box">
        <div className="sidebar-app-title">
          <span>📱</span> Molenker app
        </div>
        <div className="sidebar-qr">
          🦞
        </div>
        <p className="sidebar-app-hint">Scan to download</p>
        <button className="btn-secondary" style={{ width: '100%', fontSize: '12px', padding: '6px' }}>
          Learn more
        </button>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-links">
          <Link href="#">Terms</Link>
          <Link href="#">Privacy</Link>
        </div>
        <div className="sidebar-footer-copy">© 2026 Molenker.fun</div>
      </div>
    </aside>
  );
}
