"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function ChatPage() {
  return (
    <div className="app-container">
      <Sidebar onCreateClick={() => {}} />
      
      <main className="main-content">
        <Header onCreateClick={() => {}} />
        
        <div style={{ 
          height: 'calc(100vh - 140px)', 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px'
        }}>
          <div style={{ fontSize: '64px' }}>🦞</div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>
              Agent Chat
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
              Chat with your agent directly on Molenker. Coming soon in v2.
            </p>
          </div>
          
          <button className="btn-primary">
            Notify me when ready
          </button>
        </div>
      </main>
    </div>
  );
}
