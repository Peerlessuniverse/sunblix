'use client';

import React, { useState } from 'react';

/**
 * Format inline text: Strips raw asterisks **...** and renders as <strong>, *...* as <em>
 * and ensures NO raw asterisks leak to the UI.
 */
export function formatInlineText(text) {
  if (!text) return null;

  // Split by bold (**text**), italic (*text*), and raw URLs — without this,
  // a link SURTI sends (katalog PDF, link kalkulator, dsb.) renders as
  // plain unclickable text instead of an actual <a href>.
  const parts = text.split(/(\*\*[^*]+?\*\*|\*[^*]+?\*|https?:\/\/[^\s)\]}>,]+)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={i} className="gemini-bold">
          {part.slice(2, -2).replace(/\*\*/g, '')}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2 && !part.startsWith('**')) {
      return (
        <em key={i} className="gemini-italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (/^https?:\/\//.test(part)) {
      // Trailing punctuation (., ), dll.) that belongs to the sentence, not
      // the URL, often ends up glued on — trim it off the link itself.
      const trailingMatch = part.match(/[).,;:!?]+$/);
      const trailing = trailingMatch ? trailingMatch[0] : '';
      const url = trailing ? part.slice(0, -trailing.length) : part;
      return (
        <React.Fragment key={i}>
          <a href={url} target="_blank" rel="noopener noreferrer" className="gemini-link">
            {url}
          </a>
          {trailing}
        </React.Fragment>
      );
    }
    // Clean any accidental stray double asterisks
    const cleanPlain = part.replace(/\*\*/g, '');
    return cleanPlain;
  });
}

/**
 * Clean string of all markdown markers for headings and titles
 */
function cleanHeadingText(text) {
  if (!text) return '';
  return text
    .replace(/^[📋⚡🔋🏠💡🤝📷•\-\*#\s]+/, '')
    .replace(/[*#:\s]+$/, '')
    .replace(/\*\*/g, '')
    .trim();
}

/**
 * Main Gemini-style message renderer
 */
export default function SurtiGeminiMessageRenderer({
  content = '',
  data = null,
  role = 'assistant',
  onActionClick = null,
  onSpeak = null,
  isSpeaking = false,
}) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'like' | 'dislike' | null

  const handleCopy = () => {
    // Strip markdown formatting for clean clipboard copy
    const cleanText = content
      .replace(/\*\*/g, '')
      .replace(/### /g, '')
      .replace(/## /g, '')
      .replace(/^[•\-\*]\s+/gm, '• ');
    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // If user message, render as clean bubble
  if (role === 'user') {
    return (
      <div className="gemini-user-text">
        {content}
      </div>
    );
  }

  // Parse structured blocks from assistant message
  const lines = content.split('\n');
  const renderedElements = [];
  let currentGroup = null; // for collecting grouped section cards
  let currentCardLines = [];

  const flushGroupCard = () => {
    if (currentGroup && currentCardLines.length > 0) {
      renderedElements.push(
        <div key={`group-${renderedElements.length}`} className="gemini-info-card">
          <div className="gemini-card-header-pill">
            <span className="gemini-card-icon">{currentGroup.icon}</span>
            <span className="gemini-card-title">{currentGroup.title}</span>
          </div>
          <div className="gemini-card-body">
            {currentCardLines.map((line, idx) => {
              const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
              if (!cleanLine) return null;

              // Check if line is key: value
              const colonIndex = cleanLine.indexOf(':');
              if (colonIndex > 0 && colonIndex < cleanLine.length - 1) {
                const rawKey = cleanHeadingText(cleanLine.substring(0, colonIndex));
                const rawVal = cleanLine.substring(colonIndex + 1).trim();
                return (
                  <div key={idx} className="gemini-card-row">
                    <span className="gemini-row-label">{rawKey}</span>
                    <span className="gemini-row-val">{formatInlineText(rawVal)}</span>
                  </div>
                );
              }

              return (
                <div key={idx} className="gemini-card-bullet">
                  <span className="gemini-bullet-dot">›</span>
                  <span>{formatInlineText(cleanLine)}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
      currentGroup = null;
      currentCardLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Skip empty lines between cards
    if (!trimmed) {
      continue;
    }

    // Ignore raw ASCII separator lines like ──────────────
    if (/^[─\-_=]{3,}$/.test(trimmed)) {
      flushGroupCard();
      continue;
    }

    // Detect Grouped Section Headers (A. DATA CUSTOMER, B. KELISTRIKAN, C. KEBUTUHAN, D. ATAP)
    const isSectionA = /(?:A\.\s*DATA\s*CUSTOMER)/i.test(trimmed);
    const isSectionB = /(?:B\.\s*KELISTRIKAN|B\.\s*LISTRIK)/i.test(trimmed);
    const isSectionC = /(?:C\.\s*KEBUTUHAN)/i.test(trimmed);
    const isSectionD = /(?:D\.\s*ATAP)/i.test(trimmed);

    if (isSectionA || isSectionB || isSectionC || isSectionD) {
      flushGroupCard();
      let icon = '📋';
      let title = cleanHeadingText(trimmed);
      if (isSectionA) icon = '📋';
      if (isSectionB) icon = '⚡';
      if (isSectionC) icon = '🔋';
      if (isSectionD) icon = '🏠';

      currentGroup = { icon, title };
      continue;
    }

    // If currently inside a section group card and line starts with bullet • or - or *
    if (currentGroup && (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('* '))) {
      currentCardLines.push(trimmed);
      continue;
    }

    // If section ends with normal text, flush card
    if (currentGroup) {
      flushGroupCard();
    }

    // Detect Analysis Header (✨ Analisis & Rekomendasi Konsultan)
    if (/ANALISIS\s*(&|DAN)?\s*REKOMENDASI/i.test(trimmed) || /ANALISIS\s*KONSULTAN/i.test(trimmed)) {
      renderedElements.push(
        <div key={`analysis-header-${i}`} className="gemini-section-banner">
          <span className="gemini-banner-sparkle">✨</span>
          <span className="gemini-banner-text">
            {cleanHeadingText(trimmed) || 'Analisis & Rekomendasi Konsultan PLTS SUNBLIX'}
          </span>
        </div>
      );
      continue;
    }

    // Detect Photo Checklist Header
    if (/SIAPKAN\s*FOTO/i.test(trimmed) || /FOTO\s*PENDUKUNG/i.test(trimmed)) {
      renderedElements.push(
        <div key={`photo-header-${i}`} className="gemini-photo-header">
          <span className="gemini-photo-icon">📷</span>
          <span>{cleanHeadingText(trimmed) || 'Mohon Siapkan Foto Pendukung (Bila Berkenan)'}</span>
        </div>
      );
      continue;
    }

    // Detect Confirmation Box Header
    if (/KONFIRMASI\s*PENJADWALAN/i.test(trimmed) || /KONFIRMASI\s*SURVEI/i.test(trimmed)) {
      renderedElements.push(
        <div key={`confirm-header-${i}`} className="gemini-confirm-header">
          <span className="gemini-confirm-icon">🤝</span>
          <span>{cleanHeadingText(trimmed) || 'Konfirmasi Penjadwalan Survei Teknis'}</span>
        </div>
      );
      continue;
    }

    // Detect Confirmation Callout Text (e.g. "Apakah seluruh rangkuman data..." or "Jika sudah fix...")
    if (/sudah\s*fix\s*dan\s*sesuai/i.test(trimmed) || /balas\s*["“']?ya,\s*sudah\s*fix/i.test(trimmed)) {
      renderedElements.push(
        <div key={`confirm-callout-${i}`} className="gemini-confirm-callout">
          <p className="gemini-callout-text">{formatInlineText(trimmed)}</p>
          {onActionClick && (
            <div className="gemini-callout-actions">
              <button
                type="button"
                className="gemini-btn-primary"
                onClick={() => onActionClick('Ya, sudah fix, jadwalkan survei')}
              >
                ✓ Ya, Sudah Fix (Jadwalkan Survei)
              </button>
              <button
                type="button"
                className="gemini-btn-secondary"
                onClick={() => onActionClick('Ada data yang ingin saya revisi')}
              >
                ✏️ Revisi Data
              </button>
            </div>
          )}
        </div>
      );
      continue;
    }

    // Numbered List Items (1. Rekomendasi Kapasitas..., 2. Inverter...)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      const num = numMatch[1];
      const itemText = numMatch[2];
      renderedElements.push(
        <div key={`num-${i}`} className="gemini-numbered-item">
          <span className="gemini-num-badge">{num}</span>
          <div className="gemini-num-content">
            {formatInlineText(itemText)}
          </div>
        </div>
      );
      continue;
    }

    // Bullet Items (• ...)
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('* ')) {
      const bulletText = trimmed.replace(/^[•\-\*]\s*/, '');
      renderedElements.push(
        <div key={`bullet-${i}`} className="gemini-list-item">
          <span className="gemini-bullet-symbol">•</span>
          <div className="gemini-bullet-content">
            {formatInlineText(bulletText)}
          </div>
        </div>
      );
      continue;
    }

    // Markdown Headers (### / ##)
    if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
      const headerText = trimmed.replace(/^#+\s*/, '');
      renderedElements.push(
        <h4 key={`h-${i}`} className="gemini-subheading">
          {formatInlineText(headerText)}
        </h4>
      );
      continue;
    }

    // Standard conversational paragraph
    renderedElements.push(
      <p key={`p-${i}`} className="gemini-paragraph">
        {formatInlineText(trimmed)}
      </p>
    );
  }

  // Flush any remaining card
  flushGroupCard();

  return (
    <div className="gemini-message-body">
      {/* Content Stream */}
      <div className="gemini-content-flow">
        {renderedElements}
      </div>

      {/* GEMINI ACTION TOOLBAR */}
      <div className="gemini-action-toolbar">
        <div className="gemini-toolbar-left">
          <button
            type="button"
            className={`gemini-tool-btn ${copied ? 'active' : ''}`}
            onClick={handleCopy}
            title="Salin jawaban lengkap"
          >
            {copied ? '✓ Tersalin' : '📋 Salin'}
          </button>

          {onSpeak && (
            <button
              type="button"
              className={`gemini-tool-btn ${isSpeaking ? 'speaking' : ''}`}
              onClick={() => onSpeak(content)}
              title={isSpeaking ? 'Hentikan suara' : 'Dengarkan jawaban'}
            >
              {isSpeaking ? '⏹ Hentikan' : '🔊 Dengarkan'}
            </button>
          )}

          <button
            type="button"
            className={`gemini-tool-btn ${feedback === 'like' ? 'active-like' : ''}`}
            onClick={() => setFeedback(feedback === 'like' ? null : 'like')}
            title="Jawaban membantu"
          >
            👍
          </button>
          <button
            type="button"
            className={`gemini-tool-btn ${feedback === 'dislike' ? 'active-dislike' : ''}`}
            onClick={() => setFeedback(feedback === 'dislike' ? null : 'dislike')}
            title="Jawaban kurang membantu"
          >
            👎
          </button>
        </div>

        <div className="gemini-toolbar-right">
          <span className="gemini-badge-sparkle">✨ SURTI AI Solar Intelligence</span>
        </div>
      </div>
    </div>
  );
}
