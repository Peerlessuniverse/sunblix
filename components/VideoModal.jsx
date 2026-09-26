'use client';

import { useEffect, useRef } from 'react';

export default function VideoModal({ isOpen, onClose }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch((err) => {
        console.warn('Autoplay notice:', err);
      });
    } else if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

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
          maxWidth: '860px',
          width: '100%',
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
        <video
          ref={videoRef}
          id="modalVideo"
          src="/asset/SUNBLIX_vid.mp4"
          poster="/asset/SUNBLIX_thumbnail.png"
          controls
          playsInline
          preload="none"
          style={{ width: '100%', display: 'block', maxHeight: '80vh' }}
        />
      </div>
    </div>
  );
}
