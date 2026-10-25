'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import './surti.css';
import SurtiSphPreviewModal from './components/SurtiSphPreviewModal';
import SurtiGeminiMessageRenderer from './components/SurtiGeminiMessageRenderer';
import { updateLeadStage, addStoreNotification, saveStoreTask } from '../../lib/sunblixOsStore';

export default function SurtiCustomerPage() {
  const [messages, setMessages] = useState([]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Stable per-browser customer id so records persist across reloads & devices
  // (previously random per mount — every refresh created a brand-new customer)
  const [customerId] = useState(() => {
    if (typeof window === 'undefined') return 'customer-web-ssr';
    try {
      let id = localStorage.getItem('surti_customer_id');
      if (!id) {
        id = 'customer-web-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        localStorage.setItem('surti_customer_id', id);
      }
      return id;
    } catch {
      return 'customer-web-anon';
    }
  });
  const [theme, setTheme] = useState('light');
  const [previewSph, setPreviewSph] = useState(null);
  const [activeLead, setActiveLead] = useState(null);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);

  // Load incoming lead from web popup quote form & load saved theme & chat history
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('surti_theme');
      if (savedTheme) {
        setTheme(savedTheme);
      }

      // 1. Restore chat history from localStorage
      try {
        const savedHistory = localStorage.getItem('surti_chat_history');
        if (savedHistory) {
          const parsed = JSON.parse(savedHistory);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch (e) {
        console.warn('Failed to parse saved chat history:', e);
      }
      setIsHistoryLoaded(true);

      // Pre-warm Web Speech Synthesis voices list
      if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }

      // 2. Check if user came from Get Quote popup
      const pendingRaw = localStorage.getItem('sunblix_pending_quote_surti');
      if (pendingRaw) {
        try {
          const lead = JSON.parse(pendingRaw);
          setActiveLead(lead);
          localStorage.removeItem('sunblix_pending_quote_surti');

          const greetingContent =
            `Halo Bapak/Ibu ${lead.name}! 👋 Senang sekali dapat menyapa Anda.\n\n` +
            `Saya SURTI, Sunblix Utility Resources Technical Intelligence PT SUNBLIX ENERGI INDONESIA.\n` +
            `Data permohonan penawaran resmi yang Anda masukkan melalui website telah kami terima:\n\n` +
            `• 👤 **Nama Lengkap:** ${lead.name}\n` +
            `• 📱 **Nomor WhatsApp:** ${lead.whatsapp}\n` +
            `• ✉️ **Alamat Email:** ${lead.email}\n` +
            `• 📍 **Lokasi Properti:** ${lead.city}\n` +
            `• ⚡ **Tagihan Listrik PLN:** ${lead.monthlyBill} / bulan\n` +
            `• 🔌 **Daya Listrik PLN:** ${lead.plnPower}\n` +
            `• 📦 **Paket Usulan:** ${lead.systemRecommendation} (${lead.kwp} kWp)\n` +
            (lead.notes ? `• 📝 **Catatan Kebutuhan:** ${lead.notes}\n\n` : `\n`) +
            `Sebelum kita melanjutkan, mohon izinkan saya mengonfirmasi kebenarannya: **Apakah seluruh data isian di atas sudah benar?**`;

          setMessages([
            {
              id: 'msg-quote-welcome',
              role: 'assistant',
              content: greetingContent,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              quickActions: [],
            },
          ]);
        } catch (e) {
          console.error('Failed to parse pending quote lead:', e);
        }
      }
    }
  }, []);

  // Save chat history to localStorage whenever messages update
  useEffect(() => {
    if (isHistoryLoaded && typeof window !== 'undefined') {
      try {
        if (messages.length > 0) {
          localStorage.setItem('surti_chat_history', JSON.stringify(messages));
        } else {
          localStorage.removeItem('surti_chat_history');
        }
      } catch (err) {
        console.warn('Failed to save chat history:', err);
      }
    }
  }, [messages, isHistoryLoaded]);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Handle new chat session
  const handleNewChat = () => {
    stopSpeaking();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('surti_chat_history');
    }
    setMessages([]);
  };

  const chatSessions = [
    { id: 'session-1', title: 'Kalkulasi Surya Rumah 3 Juta', time: 'Hari ini', action: 'Rumah tinggal dengan tagihan listrik sekitar 3 juta per bulan' },
    { id: 'session-2', title: 'Simulasi Solar Ruko Bisnis', time: 'Kemarin', action: 'Ruko bisnis komersial dengan tagihan sekitar 6 juta' },
    { id: 'session-3', title: 'Draf SPH Industri 3-Fasa', time: '7 hari lalu', action: 'Kebutuhan industri 3-fasa untuk pabrik' },
  ];

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('surti_theme', next);
      }
      return next;
    });
  };

  // Two-Way Voice State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('idle'); // 'idle' | 'listening' | 'speaking' | 'processing'
  const [isContinuousVoice, setIsContinuousVoice] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Setup Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'id-ID';
        recognition.interimResults = false;

        recognition.onstart = () => {
          setVoiceStatus('listening');
        };

        recognition.onresult = (event) => {
          const spokenText = event.results[0][0].transcript;
          setVoiceStatus('processing');
          handleSendMessage(spokenText, true);
        };

        recognition.onerror = (event) => {
          console.warn('[SURTI Voice] Recognition error:', event.error);
          setVoiceStatus('idle');
          setIsVoiceActive(false);
        };

        recognition.onend = () => {
          if (voiceStatus === 'listening') {
            setVoiceStatus('idle');
            setIsVoiceActive(false);
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Stop speech synthesis immediately
  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMsgId(null);
    setVoiceStatus('idle');
  };

  // Helper to pick best natural Indonesian female voice
  const getBestIndonesianFemaleVoice = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;

    // Helper to identify and strictly exclude male voices
    const isMaleVoice = (v) => {
      const n = (v.name || '').toLowerCase();
      return n.includes('andika') || n.includes('male') || n.includes('pria') || n.includes('david') || n.includes('guy') || n.includes('stefan') || n.includes('george') || n.includes('mark');
    };

    // Priority 1: Google Bahasa Indonesia (official Indonesian female voice in Chrome) or Microsoft Gadis Online (Natural) in Edge
    const topFemaleId = voices.find((v) => {
      const isId = v.lang.startsWith('id') || v.lang.includes('ID') || (v.lang.toLowerCase && v.lang.toLowerCase().includes('indonesia'));
      const name = (v.name || '').toLowerCase();
      const isFemaleIndo = name.includes('google bahasa indonesia') || name.includes('gadis') || name.includes('female') || name.includes('wanita') || name.includes('putri') || name.includes('indah') || name.includes('siti');
      return isId && isFemaleIndo && !isMaleVoice(v);
    });
    if (topFemaleId) return topFemaleId;

    // Priority 2: Any Indonesian voice that is NOT male
    const nonMaleId = voices.find((v) => {
      const isId = v.lang.startsWith('id') || v.lang.includes('ID') || (v.lang.toLowerCase && v.lang.toLowerCase().includes('indonesia'));
      return isId && !isMaleVoice(v);
    });
    if (nonMaleId) return nonMaleId;

    // Priority 3: Malay female voice (natural Austronesian female voice)
    const msFemale = voices.find((v) => {
      const isMs = v.lang.startsWith('ms') || (v.lang.toLowerCase && v.lang.toLowerCase().includes('malay'));
      const name = (v.name || '').toLowerCase();
      return isMs && !isMaleVoice(v) && (name.includes('yasmin') || name.includes('female') || name.includes('wanita'));
    });
    if (msFemale) return msFemale;

    // Priority 4: Natural female voice fallback
    return voices.find((v) => {
      const name = (v.name || '').toLowerCase();
      return (name.includes('natural') || name.includes('female') || name.includes('zira') || name.includes('jenny') || name.includes('aria')) && !isMaleVoice(v);
    }) || null;
  };

  // Text-To-Speech (TTS) Speak with toggle play/stop support
  const toggleSpeak = (msgId, text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // IF CLICKED WHILE THIS MESSAGE IS CURRENTLY PLAYING -> STOP IT!
    if (speakingMsgId === msgId) {
      stopSpeaking();
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    // Clean text thoroughly for natural spoken Indonesian
    const cleanText = text
      .replace(/[*#_`~]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[•\-\*›►]/g, ' ')
      .replace(/[📋⚡🔋🏠💡🤝📷📄👤📱✉️📍🔌📦📝⚠️📌✓✏️👋🚀😊]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'id-ID';

    const bestVoice = getBestIndonesianFemaleVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    // Set natural warm female tone
    utterance.rate = 1.0;
    utterance.pitch = 1.1; // Warm and clear feminine tone for SURTI

    utterance.onstart = () => {
      setSpeakingMsgId(msgId);
      setVoiceStatus('speaking');
    };

    utterance.onend = () => {
      setSpeakingMsgId(null);
      setVoiceStatus('idle');
      if (isContinuousVoice) {
        setTimeout(() => startListening(), 600);
      }
    };

    utterance.onerror = (e) => {
      console.warn('TTS error:', e);
      setSpeakingMsgId(null);
      setVoiceStatus('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        stopSpeaking();
        recognitionRef.current.start();
        setIsVoiceActive(true);
      } catch (err) {
        console.warn('Voice start warning:', err);
      }
    } else {
      alert('Browser Anda belum mendukung input suara Web Speech API. Silakan gunakan browser berbasis Chromium (Google Chrome, Edge) atau gunakan input teks.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsVoiceActive(false);
    }
    stopSpeaking();
  };

  const toggleVoice = () => {
    if (voiceStatus === 'listening' || voiceStatus === 'speaking') {
      stopListening();
    } else {
      startListening();
    }
  };

  // Send message
  const handleSendMessage = async (textToSend = null, spoken = false) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const startTime = Date.now();
      const response = await fetch('/api/surti/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          message: query,
          conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
          customerData: activeLead || {},
        }),
      });

      const data = await response.json();

      // Enforce 2.2 - 2.5 seconds natural thinking & typing delay before answering
      const elapsed = Date.now() - startTime;
      const targetDelay = 2300; // 2.3 seconds
      if (elapsed < targetDelay) {
        await new Promise((resolve) => setTimeout(resolve, targetDelay - elapsed));
      }

      if (data.success) {
        // Automatically sync lead qualification into central Sunblix OS Store
        if (data.data?.type === 'intake_survey_confirmed' || (activeLead?.quoteCode && (data.data?.stage === 'Warm Lead' || data.data?.type === 'survey_request'))) {
          const leadName = data.data?.lead?.name || activeLead?.name || 'Pelanggan Baru';
          const leadCity = data.data?.survey?.siteAddress || activeLead?.city || 'Jakarta';
          const leadPhone = data.data?.lead?.phone || activeLead?.whatsapp || '';

          if (activeLead?.quoteCode) {
            updateLeadStage(activeLead.quoteCode, 'Warm Lead');
          }
          saveStoreTask({
            title: `Survei Teknis: ${leadName}`,
            category: 'survey',
            priority: 'high',
            dueDate: '2 Hari Kerja',
            desc: `Survei atap teknis & SLD untuk sistem Hybrid. Kontak: ${leadPhone}. Alamat: ${leadCity}`,
          });
          addStoreNotification({
            title: `Survei Disepakati (Warm Lead): ${leadName}`,
            desc: `Klien di ${leadCity.slice(0, 35)} mengonfirmasi formulir teknis & menyepakati survei lokasi.`,
            category: 'survey',
            targetNav: 'crm',
            icon: '📐',
          });
        } else if (activeLead?.quoteCode) {
          if (data.data?.stage === 'Cold Lead' || data.data?.action === 'mark_cold_lead') {
            updateLeadStage(activeLead.quoteCode, 'Cold Lead');
            addStoreNotification({
              title: `Lead Ditandai Cold Lead: ${activeLead.name}`,
              desc: `Klien menunda jadwal survei teknis (${activeLead.city}). Status CRM: Cold Lead (Nurturing).`,
              category: 'crm',
              targetNav: 'crm',
              icon: '❄️',
            });
          } else if (data.data?.agent === 'Omni' || data.data?.type === 'lead_verified_by_omni') {
            addStoreNotification({
              title: `Agent OMNI Mencatat Data Terverifikasi`,
              desc: `Data ${activeLead.name} (${activeLead.city}) telah dikonfirmasi dan dimasukkan ke CRM untuk kualifikasi.`,
              category: 'crm',
              targetNav: 'crm',
              icon: '💬',
            });
          }
        }

        const assistantMsg = {
          id: `msg-ast-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          data: data.data,
          quickActions: data.quickActions,
          mode: data.mode,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setIsLoading(false);

        // Speak reply if voice was used or requested
        if (spoken || isVoiceActive || isContinuousVoice) {
          toggleSpeak(assistantMsg.id, data.reply);
        }

        // Automatic Proactive Follow-up after "Baik terima kasih, mohon ditunggu sebentar.."
        if (data.data?.type === 'lead_verified_by_omni') {
          setIsLoading(true);
          const custName = activeLead?.name || 'Bapak/Ibu';
          const billStr = activeLead?.monthlyBill || 'Rp 2.500.000';
          const sysPkg = activeLead?.systemRecommendation ? `${activeLead.systemRecommendation} (${activeLead.kwp || '4.68'} kWp)` : 'SUNBLIX 4.68 Hybrid (4.68 kWp)';
          const savingsStr = activeLead?.estSavings ? `Rp ${Number(activeLead.estSavings).toLocaleString('id-ID')}` : 'Rp 1.850.000';
          const cityStr = activeLead?.city || 'kota Anda';

          const followUpContent = `Terima kasih sudah menunggu, Bpk/Ibu ${custName}!\n` +
            `Berdasarkan tagihan listrik Anda sebesar ${billStr}/bulan, sistem merekomendasikan paket ${sysPkg} dengan potensi penghematan hingga ${savingsStr}/bulan.\n\n` +
            `Selanjutnya agar desain tata letak panel di wilayah Anda di ${cityStr} dapat presisi, kami menyediakan layanan Survei Lokasi Teknis.\n\n` +
            `Apakah Bpk/Ibu berkenan jika kami jadwalkan survei teknis terlebih dahulu? Hari apa yang kira-kira paling nyaman untuk Anda?`;

          setTimeout(() => {
            setIsLoading(false);
            const followUpMsg = {
              id: `msg-followup-${Date.now()}`,
              role: 'assistant',
              content: followUpContent,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              quickActions: [],
            };
            setMessages((prev) => [...prev, followUpMsg]);
            if (spoken || isVoiceActive || isContinuousVoice) {
              toggleSpeak(followUpMsg.id, followUpContent);
            }
          }, 2400);
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'assistant',
          content: 'Maaf, terjadi kendala koneksi ke server. Anda tetap dapat melanjutkan tanya jawab.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };



  return (
    <div className={`surti-app ${theme === 'light' ? 'theme-light' : 'theme-dark'} ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="surti-ambient" />

      {/* MOBILE BACKDROP */}
      {sidebarOpen && (
        <div className="surti-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* LEFT SIDEBAR (CHATGPT / GEMINI STYLE) */}
      <aside className="surti-sidebar">
        <div className="surti-sidebar-top">
          <div className="surti-sidebar-brand">
            <Link href="/" aria-label="Kembali ke Beranda SUNBLIX" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <img src="/asset/surti_logo.png" alt="SURTI AI" className="surti-sidebar-logo" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 800, fontSize: '1.02rem', letterSpacing: '0.02em', color: 'var(--sbx-text-main)', lineHeight: 1.15 }}>SURTI AI</span>
                <span style={{ fontSize: '0.62rem', color: 'var(--sbx-text-muted)', letterSpacing: '0.04em' }}>SUNBLIX INTELLIGENCE</span>
              </div>
            </Link>
            <button
              type="button"
              className="surti-sidebar-close-btn"
              onClick={() => setSidebarOpen(false)}
              aria-label="Tutup Bilah Samping"
            >
              ✕
            </button>
          </div>

          <button
            type="button"
            className="surti-new-chat-btn"
            onClick={() => {
              handleNewChat();
              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                setSidebarOpen(false);
              }
            }}
          >
            <span>＋</span>
            <span>Obrolan Baru</span>
          </button>
        </div>

        {/* SIDEBAR SESSIONS LIST */}
        <div className="surti-sidebar-sessions">
          <div className="surti-sidebar-label">Riwayat & Sesi Terkini</div>
          {chatSessions.map((s) => (
            <button
              key={s.id}
              type="button"
              className="surti-session-item"
              onClick={() => {
                handleSendMessage(s.action);
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  setSidebarOpen(false);
                }
              }}
            >
              <span className="surti-session-icon">💬</span>
              <div className="surti-session-text">
                <span className="surti-session-title">{s.title}</span>
                <span className="surti-session-time">{s.time}</span>
              </div>
            </button>
          ))}

          <div className="surti-sidebar-label" style={{ marginTop: '16px' }}>Kalkulasi Cepat</div>
          <button
            type="button"
            className="surti-session-item"
            onClick={() => handleSendMessage('Tolong hitungkan kapasitas panel surya untuk tagihan saya')}
          >
            <span className="surti-session-icon">⚡</span>
            <div className="surti-session-text">
              <span className="surti-session-title">Simulasi Daya Listrik</span>
            </div>
          </button>
          <button
            type="button"
            className="surti-session-item"
            onClick={() => handleSendMessage('Tolong buatkan draf SPH resmi untuk atap saya')}
          >
            <span className="surti-session-icon">📄</span>
            <div className="surti-session-text">
              <span className="surti-session-title">Draf Dokumen SPH</span>
            </div>
          </button>
        </div>

        {/* BOTTOM LEFT: SUNBLIX BRAND & HOME NAVIGATION */}
        <div className="surti-sidebar-bottom">
          <div className="surti-customer-badge">
            <span className="surti-pulse-dot" />
            <div className="surti-customer-badge-info">
              <span className="surti-customer-badge-title">Konsultasi Pelanggan</span>
              <span className="surti-customer-badge-sub">Didukung AI Deterministik</span>
            </div>
          </div>
          <Link href="/" className="surti-sidebar-home-link" title="Kembali ke Beranda Utama SUNBLIX">
            <span>🏠</span>
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <div className="surti-main-area">
        {/* CHATGPT / GEMINI MINIMALIST HEADER */}
        <header className="surti-header">
          <div className="surti-header-left">
            <button
              type="button"
              className="surti-sidebar-toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? 'Sembunyikan Bilah Samping' : 'Tampilkan Bilah Samping'}
              aria-label="Toggle Bilah Samping"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </button>

            <div className="surti-model-badge">
              <img src="/asset/surti_logo.png" alt="SURTI" style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
              <span className="surti-pulse-dot" />
              <span>SURTI 1.0</span>
              <span className="surti-model-arrow">▾</span>
            </div>
          </div>

          <div className="surti-header-actions">
            {/* ICON-ONLY MODE TOGGLE */}
            <button
              type="button"
              className="surti-icon-btn"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Mode Gelap' : 'Mode Terang Eco'}
              aria-label="Ganti Tema Tampilan"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <button
              type="button"
              className="surti-icon-btn"
              onClick={handleNewChat}
              title="Obrolan Baru"
              aria-label="Obrolan Baru"
            >
              ＋
            </button>
          </div>
        </header>

      {/* CHAT CONTAINER */}
      <main className="surti-chat-container">
        {messages.length === 0 ? (
          <div className="gemini-empty-hero">
            <div className="gemini-hero-avatar-wrap">
              <img src="/asset/surti_logo.png" alt="SURTI AI" className="gemini-hero-avatar" />
            </div>
            <h1 className="gemini-hero-title">
              Halo, ada yang bisa saya bantu hari ini?
            </h1>
            <p className="gemini-hero-subtitle">
              Saya SURTI, Sunblix Utility Resources Technical Intelligence PT SUNBLIX ENERGI INDONESIA.
            </p>

            <div className="gemini-suggestion-grid">
              <button
                type="button"
                className="gemini-suggestion-card"
                onClick={() => handleSendMessage('Rumah tinggal dengan daya PLN 3500 VA dan tagihan sekitar 2-3 juta per bulan, berapa estimasi panel surya yang dibutuhkan?')}
              >
                <span className="gemini-suggestion-icon">🏠</span>
                <div className="gemini-suggestion-text">
                  <strong>Simulasi Rumah Tinggal</strong>
                  <span>Estimasi paket & penghematan tagihan bulanan</span>
                </div>
              </button>

              <button
                type="button"
                className="gemini-suggestion-card"
                onClick={() => handleSendMessage('Saya ingin konsultasi sistem hybrid dengan baterai cadangan agar kulkas dan AC tetap menyala saat listrik padam')}
              >
                <span className="gemini-suggestion-icon">🔋</span>
                <div className="gemini-suggestion-text">
                  <strong>Sistem Hybrid & Backup Baterai</strong>
                  <span>Proteksi mati lampu untuk peralatan prioritas</span>
                </div>
              </button>

              <button
                type="button"
                className="gemini-suggestion-card"
                onClick={() => handleSendMessage('Tolong buatkan draf SPH resmi untuk rencana pemasangan PLTS')}
              >
                <span className="gemini-suggestion-icon">📄</span>
                <div className="gemini-suggestion-text">
                  <strong>Draf Penawaran Harga (SPH)</strong>
                  <span>Rincian spesifikasi teknis dan estimasi investasi</span>
                </div>
              </button>

              <button
                type="button"
                className="gemini-suggestion-card"
                onClick={() => handleSendMessage('Bagaimana cara mengajukan survei teknis lokasi atap rumah saya?')}
              >
                <span className="gemini-suggestion-icon">📍</span>
                <div className="gemini-suggestion-text">
                  <strong>Jadwalkan Survei Lokasi</strong>
                  <span>Inspeksi fisik atap dan jalur kabel oleh engineer</span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="surti-messages-list">
          {messages.map((msg) => (
            <article
              key={msg.id}
              className={`surti-message ${msg.role === 'assistant' ? 'surti-message-assistant' : 'surti-message-user'}`}
            >
              <div className="surti-msg-avatar" style={{ overflow: 'hidden', padding: 0 }}>
                {msg.role === 'assistant' ? (
                  <img src="/asset/surti_logo.png" alt="SURTI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  'Anda'
                )}
              </div>

              <div className="surti-msg-bubble">
                <SurtiGeminiMessageRenderer
                  content={msg.content}
                  data={msg.data}
                  role={msg.role}
                  onActionClick={handleSendMessage}
                  onSpeak={() => toggleSpeak(msg.id, msg.content)}
                  isSpeaking={speakingMsgId === msg.id}
                />

                {/* PAYLOAD: SOLAR CALCULATION CARD */}
                {msg.data?.type === 'solar_calculation' && (
                  <div className="surti-payload-card">
                    <div className="surti-card-header">
                      <span className="surti-card-badge">Paket Brosur: {msg.data.calculation.packageName}</span>
                      <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Katalog Resmi 2026</span>
                    </div>

                    <div className="surti-card-grid">
                      <div className="surti-card-metric">
                        <span className="surti-metric-label">Kapasitas Sistem Rekomendasi</span>
                        <span className="surti-metric-val highlight">{msg.data.calculation.kwp} kWp</span>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {msg.data.calculation.panelCount} Modul ({msg.data.calculation.panelModel || 'LONGI 585 Wp'})
                        </div>
                      </div>

                      <div className="surti-card-metric">
                        <span className="surti-metric-label">Estimasi Penghematan Bulanan</span>
                        <span className="surti-metric-val highlight">
                          Rp {Number(msg.data.calculation.estimatedMonthlySavings).toLocaleString('id-ID')}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#10b981' }}>
                          Memotong hingga ~{msg.data.calculation.savingsPercentage}% tagihan
                        </div>
                      </div>

                      <div className="surti-card-metric">
                        <span className="surti-metric-label">Inverter Cerdas</span>
                        <span className="surti-metric-val" style={{ fontSize: '0.85rem' }}>
                          {msg.data.calculation.inverter}
                        </span>
                      </div>

                      <div className="surti-card-metric">
                        <span className="surti-metric-label">Periode Balik Modal (BEP)</span>
                        <span className="surti-metric-val highlight">
                          ~{msg.data.calculation.paybackPeriodYears} Tahun
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="surti-action-chip"
                        onClick={() => handleSendMessage('Tolong buatkan draf SPH resmi untuk paket ini')}
                      >
                        📄 Susun Draf SPH Resmi
                      </button>
                      <button
                        type="button"
                        className="surti-action-chip"
                        onClick={() => handleSendMessage('Saya ingin jadwalkan survei lokasi atap')}
                      >
                        📍 Jadwalkan Survei Atap
                      </button>
                    </div>
                  </div>
                )}

                {/* PAYLOAD: DRAFT SPH CARD */}
                {msg.data?.type === 'sph_draft' && (
                  <div className="surti-payload-card" style={{ borderColor: '#f59e0b' }}>
                    <div className="surti-card-header">
                      <span className="surti-card-badge" style={{ color: '#f59e0b' }}>
                        Draf Surat Penawaran Harga (SPH)
                      </span>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '2px 8px', borderRadius: '4px' }}>
                        Draft Demo
                      </span>
                    </div>

                    <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>
                      Nomor Dokumen: <strong>{msg.data.sph.sphNumber}</strong>
                    </p>

                    <div className="surti-card-grid">
                      <div className="surti-card-metric">
                        <span className="surti-metric-label">Kapasitas PV</span>
                        <span className="surti-metric-val">{msg.data.sph.technicalSpecs.kwp} kWp</span>
                      </div>
                      <div className="surti-card-metric">
                        <span className="surti-metric-label">Total Investasi (DPP + PPN)</span>
                        <span className="surti-metric-val highlight">
                          Rp {Number(msg.data.sph.commercial.totalInclPpn).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setPreviewSph(msg.data.sph)}
                        className="surti-action-chip"
                        style={{
                          background: '#003b7a',
                          color: '#ffffff',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 16px',
                          fontSize: '0.85rem',
                        }}
                      >
                        <span>📄</span>
                        <span>Lihat Pratinjau Dokumen SPH Resmi (4 Hal) ➔</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* QUICK ACTION BUTTONS */}
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="surti-quick-actions">
                    {msg.quickActions.map((qa, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="surti-action-chip"
                        onClick={() => {
                          if (qa.action === 'view_sph' || qa.sphId) {
                            if (qa.sph) {
                              setPreviewSph(qa.sph);
                            } else if (msg.data?.sph) {
                              setPreviewSph(msg.data.sph);
                            } else if (qa.sphId) {
                              fetch(`/api/surti/sph?id=${qa.sphId}`)
                                .then((res) => res.json())
                                .then((d) => {
                                  if (d.success && d.sph) setPreviewSph(d.sph);
                                });
                            }
                          } else if (qa.action && qa.action.startsWith('http')) {
                            window.open(qa.action, '_blank');
                          } else {
                            handleSendMessage(qa.action || qa.label);
                          }
                        }}
                      >
                        {qa.label}
                      </button>
                    ))}
                  </div>
                )}

                <span className="surti-msg-time">{msg.timestamp}</span>
              </div>
            </article>
          ))}

          {isLoading && (
            <div className="surti-message surti-message-assistant" aria-live="polite">
              <div className="surti-msg-avatar" style={{ overflow: 'hidden', padding: 0 }}>
                <img src="/asset/surti_logo.png" alt="SURTI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="surti-msg-bubble" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 18px' }}>
                <span style={{ color: '#0284c7', fontSize: '13.5px', fontWeight: 600 }}>SURTI sedang mengetik</span>
                <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0284c7', opacity: 0.8 }}></span>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0284c7', opacity: 0.8 }}></span>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0284c7', opacity: 0.8 }}></span>
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </main>

      {/* INPUT BAR */}
      <div className="surti-input-wrapper">
        <form
          className="surti-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            type="text"
            className="surti-input-field"
            placeholder="Tanyakan estimasi tagihan, jumlah panel, atau buat draf SPH..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="surti-send-btn"
            disabled={isLoading || !inputMessage.trim()}
            title="Kirim Pesan"
            aria-label="Kirim pesan"
          >
            ➤
          </button>
          <button
            type="button"
            className={`surti-mic-btn ${voiceStatus === 'listening' ? 'is-listening' : ''}`}
            onClick={toggleVoice}
            title={voiceStatus === 'listening' ? 'Stop Bicara' : 'Bicara dengan Suara'}
            aria-label="Bicara dengan Suara"
          >
            {voiceStatus === 'listening' ? '⏹️' : '🎤'}
          </button>
        </form>
      </div>
    </div>

      {/* IN-CHAT OFFICIAL SPH DOCUMENT PREVIEW MODAL (READ-ONLY) */}
      {previewSph && (
        <SurtiSphPreviewModal
          sph={previewSph}
          onClose={() => setPreviewSph(null)}
        />
      )}
    </div>
  );
}
