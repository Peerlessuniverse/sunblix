'use client';

import { useEffect } from 'react';

const YOUTUBE_VIDEO_ID = 'iXp1qE8Plu0';
const YOUTUBE_EMBED_URL = `https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

export default function VideoModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal open"
      id="modal"
      aria-hidden="false"
      onClick={(e) => {
        if (e.target.id === 'modal') onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(3, 28, 63, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="modal-box"
        style={{
          position: 'relative',
          maxWidth: '960px',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
          background: '#000',
        }}
      >
        <button
          type="button"
          className="close"
          id="close"
          aria-label="Close"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '16px',
            zIndex: 10,
            background: 'rgba(0,0,0,0.6)',
            color: '#fff',
            border: 'none',
            fontSize: '28px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          ×
        </button>
        <iframe
          src={YOUTUBE_EMBED_URL}
          title="SUNBLIX Video"
          style={{
            width: '100%',
            height: '100%',
            border: 0,
            display: 'block',
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
}

