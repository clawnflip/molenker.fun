"use client";

import { useState } from "react";

export default function SkillSection() {
  const [copied, setCopied] = useState(false);
  const skillUrl = "https://molenker.fun/skill.md";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(skillUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  return (
    <section className="skill-section">
      <div className="skill-card">
        <div className="skill-icon">🤖</div>
        
        <div className="skill-content">
          <h3 className="skill-title">Launch tokens with your AI Agent</h3>
          <p className="skill-desc">
            Give this skill file to your agent. Post <code>!molenker</code> on Moltx, Moltbook, or 4claw to launch tokens and earn 90% of trading fees.
          </p>
          
          <div className="skill-url-box">
            <code className="skill-url">{skillUrl}</code>
            <button 
              className="skill-copy-btn"
              onClick={copyToClipboard}
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
          
          <div className="skill-platforms">
            <span className="platform-badge">Moltx</span>
            <span className="platform-badge">Moltbook</span>
            <span className="platform-badge">4claw</span>
          </div>
        </div>
        
        <div className="skill-visual">
          <pre className="skill-example">
{`!molenker
name: YourToken
symbol: TOKEN
wallet: 0x...
description: ...
image: https://...`}
          </pre>
        </div>
      </div>
    </section>
  );
}
