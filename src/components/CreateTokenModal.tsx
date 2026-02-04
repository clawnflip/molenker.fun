"use client";

import { useState } from "react";

interface CreateTokenModalProps {
  onClose: () => void;
}

export default function CreateTokenModal({ onClose }: CreateTokenModalProps) {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenDescription, setTokenDescription] = useState("");
  const [tokenImage, setTokenImage] = useState<File | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);
    
    setTimeout(() => {
      setIsDeploying(false);
      alert("Token deployed! (Demo - connect wallet to deploy for real)");
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            <span style={{ fontSize: '28px' }}>🦞</span>
            Create your coin
          </h2>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>

        {/* Fee Banner */}
        <div className="modal-banner">
          <span className="modal-banner-icon">💰</span>
          <div className="modal-banner-text">
            <h4>Earn 90% of trading fees!</h4>
            <p>Your token, your earnings. Only 10% goes to molenker.fun</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Token Name <span>*</span>
            </label>
            <input
              type="text"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              placeholder="e.g. LobsterKing"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Token Symbol <span>*</span>
            </label>
            <input
              type="text"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
              placeholder="e.g. LOBK"
              maxLength={10}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={tokenDescription}
              onChange={(e) => setTokenDescription(e.target.value)}
              placeholder="Tell us about your token..."
              className="form-input form-textarea"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Token Image</label>
            <div className="upload-zone">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setTokenImage(e.target.files?.[0] || null)}
                style={{ display: 'none' }}
                id="token-image"
              />
              <label htmlFor="token-image" style={{ cursor: 'pointer', display: 'block' }}>
                {tokenImage ? (
                  <div style={{ color: 'var(--success)' }}>✓ {tokenImage.name}</div>
                ) : (
                  <>
                    <div className="upload-zone-icon">📸</div>
                    <div className="upload-zone-text">Click to upload or drag and drop</div>
                    <div className="upload-zone-hint">PNG, JPG, GIF up to 5MB</div>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Warning */}
          <div className="modal-warning">
            <span className="modal-warning-icon">⚠️</span>
            <div className="modal-warning-text">
              <h5>Connect your wallet to deploy</h5>
              <p>You need a wallet with some ETH on Base network</p>
            </div>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeploying || !tokenName || !tokenSymbol}
              className="btn-primary"
            >
              {isDeploying ? (
                <>
                  <span className="animate-spin">🦞</span>
                  Deploying...
                </>
              ) : (
                <>
                  <span>🦞</span>
                  Launch Token
                </>
              )}
            </button>
          </div>
        </form>

        <div className="modal-footer">
          Tokens are deployed on Base network via Clanker protocol 🦞
        </div>
      </div>
    </div>
  );
}
