'use client';

import { useState } from 'react';
import { getStoreMessages } from '../../../lib/sunblixOsStore';

export default function MessagesDrawer({ onClose, onOpenCrm }) {
  const [messages] = useState(() => getStoreMessages());

  return (
    <div className="sbx-modal-backdrop" onClick={onClose} style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div
        className="sbx-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '440px',
          height: '100vh',
          maxHeight: '100vh',
          borderRadius: 0,
          borderLeft: '1px solid rgba(16, 185, 129, 0.3)',
          borderTop: 'none',
          borderBottom: 'none',
          borderRight: 'none',
          animation: 'sbxSlideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="sbx-modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="sbx-modal-tag" style={{ color: '#10b981' }}>WHATSAPP &amp; WEB INBOUND</span>
              <span className="sbx-status-badge success" style={{ fontSize: '10px' }}>
                {messages.length} Chat
              </span>
            </div>
            <h2 className="sbx-modal-title" style={{ fontSize: '17px' }}>
              💬 Pesan Calon Klien Masuk
            </h2>
          </div>
          <button type="button" className="sbx-modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="sbx-modal-body" style={{ padding: '14px', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((m) => {
              const waUrl = `https://wa.me/${m.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                `Halo ${m.sender}, terima kasih telah menghubungi PT Sunblix Energi Indonesia.`
              )}`;

              return (
                <div
                  key={m.id}
                  style={{
                    padding: '12px 14px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--sbx-glass-border)',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--sbx-text)' }}>
                      👤 {m.sender}
                    </div>
                    <span className="sbx-status-badge info" style={{ fontSize: '10px' }}>
                      {m.status}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--sbx-text-muted)', lineHeight: '1.45' }}>
                    &ldquo;{m.text}&rdquo;
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '11px', color: 'var(--sbx-text-dim)' }}>
                    <span>🕒 {m.time} • {m.phone}</span>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sbx-row-action-btn"
                      style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)', textDecoration: 'none' }}
                    >
                      Balas WA ↗
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="sbx-modal-footer">
          <button
            type="button"
            className="sbx-action-btn primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => {
              if (onOpenCrm) onOpenCrm();
              onClose();
            }}
          >
            Buka Pipeline CRM Lengkap ➔
          </button>
        </div>
      </div>
    </div>
  );
}
