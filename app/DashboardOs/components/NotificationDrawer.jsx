'use client';

import { useState } from 'react';
import {
  getStoreNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearStoreNotifications,
} from '../../../lib/sunblixOsStore';

export default function NotificationDrawer({ onClose, onNavigate }) {
  const [notifs, setNotifs] = useState(() => getStoreNotifications());
  const [filter, setFilter] = useState('all');

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  const handleItemClick = (notif) => {
    markNotificationRead(notif.id);
    setNotifs(getStoreNotifications());
    if (notif.targetNav && onNavigate) {
      onNavigate(notif.targetNav);
    }
    onClose();
  };

  const handleMarkAll = () => {
    markAllNotificationsRead();
    setNotifs(getStoreNotifications());
  };

  const handleClearAll = () => {
    if (confirm('Hapus semua notifikasi?')) {
      clearStoreNotifications();
      setNotifs([]);
    }
  };

  const filtered = notifs.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'sph') return n.category === 'sph';
    if (filter === 'finance') return n.category === 'finance';
    if (filter === 'crm') return n.category === 'crm' || n.category === 'survey';
    return true;
  });

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
          borderLeft: '1px solid rgba(56, 189, 248, 0.3)',
          borderTop: 'none',
          borderBottom: 'none',
          borderRight: 'none',
          animation: 'sbxSlideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="sbx-modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="sbx-modal-tag">PUSAT NOTIFIKASI</span>
              {unreadCount > 0 && (
                <span className="sbx-status-badge warning" style={{ fontSize: '10px' }}>
                  {unreadCount} Baru
                </span>
              )}
            </div>
            <h2 className="sbx-modal-title" style={{ fontSize: '17px' }}>
              🔔 Notifikasi Operasional
            </h2>
          </div>
          <button type="button" className="sbx-modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Quick Filter Bar */}
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--sbx-glass-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
          <div className="sbx-tab-pills" style={{ flexWrap: 'wrap', gap: '6px' }}>
            <button
              type="button"
              className={`sbx-tab-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              Semua ({notifs.length})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              Belum Dibaca ({unreadCount})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${filter === 'sph' ? 'active' : ''}`}
              onClick={() => setFilter('sph')}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              📑 SPH
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${filter === 'finance' ? 'active' : ''}`}
              onClick={() => setFilter('finance')}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              💵 Keuangan
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="sbx-modal-body" style={{ padding: '12px 14px', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => handleItemClick(n)}
                style={{
                  padding: '12px 14px',
                  background: n.isRead ? 'rgba(255, 255, 255, 0.02)' : 'rgba(56, 189, 248, 0.08)',
                  border: n.isRead ? '1px solid var(--sbx-glass-border)' : '1px solid rgba(56, 189, 248, 0.35)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
              >
                {!n.isRead && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--sbx-accent)',
                      boxShadow: '0 0 8px var(--sbx-accent)',
                    }}
                  />
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ fontSize: '18px', lineHeight: 1 }}>{n.icon || '📌'}</span>
                  <div style={{ flex: 1, paddingRight: '12px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--sbx-text)', marginBottom: '3px' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--sbx-text-muted)', lineHeight: '1.45', marginBottom: '6px' }}>
                      {n.desc}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--sbx-text-dim)' }}>
                      <span>🕒 {n.time}</span>
                      <span style={{ color: 'var(--sbx-accent)', fontWeight: 600 }}>Buka Menu ➔</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--sbx-text-muted)' }}>
                Tidak ada notifikasi di kategori ini.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sbx-modal-footer" style={{ justifyContent: 'space-between', padding: '12px 18px' }}>
          <button
            type="button"
            className="sbx-filter-pill-btn"
            style={{ fontSize: '11.5px', color: '#f43f5e' }}
            onClick={handleClearAll}
          >
            Hapus Semua
          </button>
          <button
            type="button"
            className="sbx-filter-pill-btn"
            style={{ fontSize: '11.5px' }}
            onClick={handleMarkAll}
          >
            ✓ Tandai Semua Dibaca
          </button>
        </div>
      </div>
    </div>
  );
}
