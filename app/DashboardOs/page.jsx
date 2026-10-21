'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import './dashboard.css';
import './os.css';

// Lazy-loaded 3D Virtual Office (Three.js WebGL with Zero Memory Leak & Mobile Adaptive Guard)
const AgentVirtualOffice3D = dynamic(
  () => import('./components/AgentVirtualOffice3D'),
  {
    ssr: false,
    loading: () => (
      <div style={{ width: '100%', height: '100%', minHeight: '440px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a1120', color: '#94a3b8', fontFamily: 'monospace', fontSize: '12px' }}>
        ⚡ Memuat 3D Virtual Office Sunblix AI Fleet...
      </div>
    ),
  }
);

// Dedicated Menu Views
import MyWorkView from './views/MyWorkView';
import CrmView from './views/CrmView';
import ProjectsView from './views/ProjectsView';
import ProcurementView from './views/ProcurementView';
import VendorsView from './views/VendorsView';
import ProductionView from './views/ProductionView';
import QualityView from './views/QualityView';
import DeliveryView from './views/DeliveryView';
import FinanceView from './views/FinanceView';
import PerformanceView from './views/PerformanceView';
import SettingsView from './views/SettingsView';
import SurtiIntelligenceView from './views/SurtiIntelligenceView';

// Notification & Inbound Message Drawers
import NotificationDrawer from './components/NotificationDrawer';
import MessagesDrawer from './components/MessagesDrawer';
import {
  getStoreNotifications,
  getStoreMessages,
  getStoreProjects,
  getStoreTasks,
  getStoreLeads,
  getStoreInvoices,
  subscribeToStore,
  addStoreNotification,
  addStoreMessage,
  saveStoreTask,
} from '../../lib/sunblixOsStore';

// Application Dynamic Version
const APP_VERSION = 'v.1.0.0';

export default function SunblixDashboardOS() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [username, setUsername] = useState('danny@sunblix.id');
  const [password, setPassword] = useState('sunblix2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState({
    name: 'Danny',
    role: 'Director / CEO',
    avatar: 'D',
    email: 'danny@sunblix.id',
  });

  // Notification & Messages Drawer State
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);
  const [storeLeadsCount, setStoreLeadsCount] = useState(0);
  const [storeProjectsCount, setStoreProjectsCount] = useState(0);
  const [storeTasksCount, setStoreTasksCount] = useState(0);

  // Live Lists for Dynamic Dashboard Charts & Metrics
  const [storeTasksList, setStoreTasksList] = useState([]);
  const [storeProjectsList, setStoreProjectsList] = useState([]);
  const [storeInvoicesList, setStoreInvoicesList] = useState([]);
  const [storeNotifsList, setStoreNotifsList] = useState([]);

  // Theme State ('dark' | 'light')
  const [theme, setTheme] = useState('dark');

  // Navigation State
  const [activeNav, setActiveNav] = useState('dashboard'); // 'dashboard' | 'ai-fleet' | 'my-work' | 'projects' | 'rfq'
  const [searchQuery, setSearchQuery] = useState('');

  // Real-time Clock & Greeting
  const [currentTime, setCurrentTime] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [greeting, setGreeting] = useState('Good morning');

  // Selected AI Agent for Live Inspection
  const [selectedAgentKey, setSelectedAgentKey] = useState('solaria');
  const [agentActionMessage, setAgentActionMessage] = useState('');
  const [fleetViewMode, setFleetViewMode] = useState('3d'); // '3d' | 'hud'
  const [isCycleRunning, setIsCycleRunning] = useState(false);

  // Auto-detect mobile screen: default to lightweight 2D Diagnostic HUD for Pak Danny's mobile/tablet
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setFleetViewMode('hud');
    }
  }, []);

  // AI Agent Fleet Live Working Status (Clean Standby Operational State)
  const [agents, setAgents] = useState({
    solaria: {
      key: 'solaria',
      name: 'Agent SOLARIA',
      role: 'Rooftop Site & PV Engineer',
      avatarClass: 'solaria',
      icon: '☀️',
      status: 'Standby',
      progress: 100,
      activity: 'Standby & monitoring solar irradiance data. Ready for rooftop azimuth & satellite 3D analysis.',
      currentTask: 'Awaiting new site survey or roof layout simulation request',
      logs: [
        '08:00:00 — Solar Irradiance Satellite Broker connected',
        '08:00:05 — Azimuth auto-calculation engine initialized',
        '08:00:10 — High-res elevation contours ready for 3D layout simulation',
      ],
    },
    helios: {
      key: 'helios',
      name: 'Agent HELIOS',
      role: 'Sales & SPH Proposal Copilot',
      avatarClass: 'helios',
      icon: '📑',
      status: 'Standby',
      progress: 100,
      activity: 'Standby for SPH generation, official brochure quotes, and 11% PPN tax compliance.',
      currentTask: 'Ready to draft new official SPH proposal',
      logs: [
        '08:00:00 — Sunblix 2026 Commercial Pricing Engine loaded',
        '08:00:05 — Tiered discount & PPN 11% protection rules active',
        '08:00:10 — SPH document generator online',
      ],
    },
    volt: {
      key: 'volt',
      name: 'Agent VOLT',
      role: 'IoT Fleet & Battery Watchdog',
      avatarClass: 'volt',
      icon: '⚡',
      status: 'Monitoring',
      progress: 100,
      activity: 'Standby & monitoring MQTT broker for connected Deye hybrid inverters & LiFePO4 batteries.',
      currentTask: 'Grid frequency & battery thermal monitoring standby',
      logs: [
        '08:00:00 — MQTT Cloud IoT Broker connection verified',
        '08:00:05 — Inverter telemetry telemetry listener active',
        '08:00:10 — Zero fault codes detected across system',
      ],
    },
    omni: {
      key: 'omni',
      name: 'Agent OMNI',
      role: 'Lead Concierge & Care Dispatcher',
      avatarClass: 'omni',
      icon: '💬',
      status: 'Active',
      progress: 100,
      activity: 'Standby & listening for incoming prospective customer inquiries via WhatsApp & SURTI Live Chat.',
      currentTask: 'Listening for inbound website / chat leads',
      logs: [
        '08:00:00 — Inbound customer concierge gateway online',
        '08:00:05 — Live chat connector linked to /surti',
        '08:00:10 — Auto-qualification rules ready for residential & commercial PLTS',
      ],
    },
  });

  // Simulated live tick for working agents
  useEffect(() => {
    const progressTimer = setInterval(() => {
      setAgents((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          const agent = next[key];
          if (agent.status === 'Working') {
            const nextProgress = agent.progress >= 98 ? 72 : agent.progress + 2;
            next[key] = { ...agent, progress: nextProgress };
          }
        });
        return next;
      });
    }, 3000);

    return () => clearInterval(progressTimer);
  }, []);

  // Time & Session initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sunblix_os_session');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Migrasikan nama Warsa lama ke Pak Danny
          if (!parsed.name || parsed.name === 'Warsa' || parsed.email === 'admin@sunblix.id') {
            parsed.name = 'Danny';
            parsed.role = 'Director / CEO';
            parsed.avatar = 'D';
            parsed.email = 'danny@sunblix.id';
            localStorage.setItem('sunblix_os_session', JSON.stringify(parsed));
          }
          setIsLoggedIn(true);
          setCurrentUser(parsed);
        } catch {
          setIsLoggedIn(true);
        }
      }

      const storedTheme = localStorage.getItem('sunblix_os_theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
        setTheme(storedTheme);
      }

      // Check URL search parameters (e.g. ?nav=surti-intelligence)
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const navParam = urlParams.get('nav');
        if (navParam) {
          setActiveNav(navParam);
        }
      } catch (err) {
        console.error('Error reading URL params:', err);
      }

      setAuthChecked(true);
    }

    const updateClock = () => {
      const now = new Date();
      const hour = now.getHours();
      if (hour < 12) setGreeting('Good morning');
      else if (hour < 17) setGreeting('Good afternoon');
      else setGreeting('Good evening');

      setCurrentDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );

      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time listener for notification, message, and dashboard data lists
  useEffect(() => {
    const updateCounts = () => {
      try {
        const notifs = getStoreNotifications();
        setStoreNotifsList(notifs);
        setUnreadNotifCount(notifs.filter((n) => !n.isRead).length);
        const msgs = getStoreMessages();
        setMessagesCount(msgs.length);
        const lds = getStoreLeads();
        setStoreLeadsCount(lds.length);
        const prjs = getStoreProjects();
        setStoreProjectsList(prjs);
        setStoreProjectsCount(prjs.length);
        const tsks = getStoreTasks();
        setStoreTasksList(tsks);
        setStoreTasksCount(tsks.filter((t) => t.status !== 'completed').length);
        const invs = getStoreInvoices();
        setStoreInvoicesList(invs);
      } catch (e) {
        console.warn('Could not read store counts:', e);
      }
    };

    updateCounts();
    const unsub = subscribeToStore(updateCounts);
    return () => unsub();
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sunblix_os_theme', nextTheme);
    }
  };

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    const uClean = username.trim().toLowerCase();
    const pClean = password.trim();

    const validUsers = ['danny@sunblix.id', 'admin@sunblix.id', 'danny', 'engineer@sunblix.id', 'sunblix'];
    const validPass = ['sunblix2026', '2026', 'admin2026', 'sunblix', 'danny2026'];

    if (validUsers.includes(uClean) || pClean === 'sunblix2026' || pClean === '2026' || pClean === 'danny2026') {
      const isEng = uClean.includes('engineer');
      const userObj = {
        name: isEng ? 'Tim Engineering EPC' : 'Danny',
        role: isEng ? 'Lead Rooftop EPC Engineer' : 'Director / CEO',
        avatar: isEng ? 'E' : 'D',
        email: uClean,
      };
      localStorage.setItem('sunblix_os_session', JSON.stringify(userObj));
      setCurrentUser(userObj);
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Username atau password salah. Gunakan akun demo.');
    }
  };

  const handleQuickDemoLogin = (roleType) => {
    if (roleType === 'director') {
      setUsername('danny@sunblix.id');
      setPassword('sunblix2026');
      const userObj = {
        name: 'Danny',
        role: 'Director / CEO',
        avatar: 'D',
        email: 'danny@sunblix.id',
      };
      localStorage.setItem('sunblix_os_session', JSON.stringify(userObj));
      setCurrentUser(userObj);
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setUsername('engineer@sunblix.id');
      setPassword('sunblix2026');
      const userObj = {
        name: 'Tim EPC Engineer',
        role: 'Lead Rooftop EPC Engineer',
        avatar: 'E',
        email: 'engineer@sunblix.id',
      };
      localStorage.setItem('sunblix_os_session', JSON.stringify(userObj));
      setCurrentUser(userObj);
      setIsLoggedIn(true);
      setLoginError('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sunblix_os_session');
    setIsLoggedIn(false);
  };

  const handleTriggerAgent = (agentKey) => {
    const ag = agents[agentKey];
    setIsCycleRunning(true);
    setTimeout(() => setIsCycleRunning(false), 3500);
    setAgentActionMessage(`⚡ Memulai siklus kerja autonomous untuk ${ag.name}...`);

    setTimeout(() => {
      const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      if (agentKey === 'solaria') {
        saveStoreTask({
          title: 'Verifikasi Layout 3D & Azimuth 175° Villa Sanur (Agent Solaria)',
          category: 'Engineering',
          priority: 'HIGH',
          assignee: 'Agent Solaria & Tim EPC',
          dueDate: 'Hari ini, 15:00',
          project: 'Villa Sanur Luxury Seaside',
          icon: '☀️',
        });
        addStoreNotification({
          title: 'Agent SOLARIA: Layout 3D PV Selesai',
          desc: 'Perhitungan azimuth 175° dan stringing 2x12 panel LONGI 585 Wp telah selesai.',
          category: 'sph',
          targetNav: 'my-work',
          icon: '☀️',
        });
      } else if (agentKey === 'helios') {
        addStoreNotification({
          title: 'Agent HELIOS: Proposal SPH Siap Review',
          desc: 'Formula harga SPH 14.04 kWp (DPP Rp 138.8jt + PPN 11%) telah digenerate.',
          category: 'sph',
          targetNav: 'surti-intelligence',
          icon: '📑',
        });
      } else if (agentKey === 'volt') {
        addStoreNotification({
          title: 'Agent VOLT: Telemetri 48 Gateway Normal',
          desc: 'Inverter Deye Hybrid & baterai LiFePO4 sinkron. SOH rata-rata 99.4%, suhu 28.3°C aman.',
          category: 'iot',
          targetNav: 'dashboard',
          icon: '⚡',
        });
      } else if (agentKey === 'omni') {
        addStoreMessage({
          sender: 'David S. (Bintaro)',
          phone: '+62 812-5566-7788',
          text: 'Halo Sunblix, saya ingin survei atap rumah saya di Bintaro untuk pasang solar panel 8.19 kWp.',
        });
        addStoreNotification({
          title: 'Agent OMNI: Lead Baru Terkualifikasi',
          desc: 'Klien dari Bintaro (PLN 5.500 VA) telah dikualifikasi dan meminta jadwal survei.',
          category: 'crm',
          targetNav: 'crm',
          icon: '💬',
        });
      }

      setAgents((prev) => ({
        ...prev,
        [agentKey]: {
          ...prev[agentKey],
          progress: 100,
          logs: [
            ...prev[agentKey].logs.slice(1),
            `${nowTime} — [Autonomous Cycle Completed] Tugas berhasil dieksekusi dan dicatat ke sistem operasional.`,
          ],
        },
      }));

      setAgentActionMessage(`✅ ${ag.name} berhasil mengeksekusi siklus kerja dan memperbarui sistem operasional!`);
      setTimeout(() => setAgentActionMessage(''), 5000);
    }, 1000);
  };

  if (!authChecked) {
    return <div className={`sbx-login-page-root ${theme === 'light' ? 'light-mode' : ''}`} />;
  }

  // =========================================================================
  // VIEW 1: LOGIN SCREEN (SUNBLIX OS AUTHENTICATION)
  // =========================================================================
  if (!isLoggedIn) {
    return (
      <div className={`sbx-login-page-root ${theme === 'light' ? 'light-mode' : ''}`}>
        <div className="os-login-container">
          <div className="os-login-backdrop-glow" />

          {/* Top Floating Theme Switcher on Login Page */}
          <div className="os-login-theme-bar">
            <button
              type="button"
              className="os-theme-toggle-btn"
              onClick={toggleTheme}
              title={`Beralih ke mode ${theme === 'light' ? 'gelap' : 'terang'}`}
            >
              <span className="os-theme-toggle-icon">{theme === 'light' ? '☀️' : '🌙'}</span>
              <span className="os-theme-toggle-text">{theme === 'light' ? 'Mode Terang' : 'Mode Gelap'}</span>
            </button>
          </div>

          <div className="os-login-card">
            <div className="os-login-header">
              <img src="/asset/apple-touch-icon.png" alt="SUNBLIX" className="os-login-logo" />
              <div className="os-login-badge">
                <span className="os-login-badge-dot" />
                <span>Enterprise OS • {APP_VERSION}</span>
              </div>
              <h1 className="os-login-title">SUNBLIX OS</h1>
              <p className="os-login-subtitle">
                Portal Komando Operasional PLTS, Telemetri IoT & Hub Digital AI PT Sunblix Energi Indonesia.
              </p>
            </div>

            <form onSubmit={handleLogin} className="os-login-form">
              <div className="os-field-group">
                <label className="os-label">Akun Email / ID Staf</label>
                <div className="os-input-wrap">
                  <input
                    type="text"
                    className="os-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="nama@sunblix.id"
                    autoFocus
                  />
                </div>
              </div>

              <div className="os-field-group">
                <label className="os-label">Kata Sandi / Kunci Akses</label>
                <div className="os-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="os-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    className="os-input-btn-eye"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Sembunyikan' : 'Lihat password'}
                  >
                    {showPassword ? '👁️' : '🔒'}
                  </button>
                </div>
              </div>

              {loginError && (
                <div style={{ color: '#f87171', fontSize: '12px', background: 'rgba(239, 68, 68, 0.1)', padding: '8px 12px', borderRadius: '6px' }}>
                  ⚠️ {loginError}
                </div>
              )}

              {/* 1-Click Demo Shortcut Login for Review */}
              <div className="os-demo-pills-box">
                <span className="os-demo-pills-label">Akses Cepat Pengujian (1-Click Demo):</span>
                <div className="os-demo-pills-row">
                  <button
                    type="button"
                    className="os-demo-pill"
                    onClick={() => handleQuickDemoLogin('director')}
                  >
                    ⚡ Login Pak Danny (Director / CEO)
                  </button>
                  <button
                    type="button"
                    className="os-demo-pill"
                    onClick={() => handleQuickDemoLogin('engineer')}
                  >
                    🛠️ Login Tim Engineer
                  </button>
                </div>
              </div>

              <button type="submit" className="os-btn-submit">
                Masuk ke Sunblix OS ➔
              </button>
            </form>

            <div className="os-login-footer">
              <Link href="/" className="os-back-link">
                ← Kembali ke Website Utama Sunblix
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: FULL ENTERPRISE DASHBOARD "DASAWARSA OS STYLE" WITH GLASSMORPHISM
  // =========================================================================
  const activeAgent = agents[selectedAgentKey] || agents.solaria;

  // Calculate dynamic business metrics for Dashboard Landing
  const paidInvoices = storeInvoicesList.filter((i) => i.status === 'Lunas');
  const dynamicRevenueNum = paidInvoices.reduce((acc, curr) => acc + (curr.amountNum || 0), 0);
  const dynamicRevenueStr = dynamicRevenueNum > 0
    ? (dynamicRevenueNum >= 1000000000
        ? `Rp ${(dynamicRevenueNum / 1000000000).toFixed(2)}B`
        : `Rp ${(dynamicRevenueNum / 1000000).toFixed(0)} Juta`)
    : 'Rp 0';

  const overdueTasksCount = storeTasksList.filter((t) => t.priority === 'URGENT' && t.status !== 'completed').length;
  const atRiskTasksCount = storeTasksList.filter((t) => t.priority === 'HIGH' && t.status !== 'completed').length;
  const dueTodayTasksCount = storeTasksList.filter((t) => (t.dueDate?.includes('Hari') || t.dueDate?.includes('1')) && t.status !== 'completed').length;
  const upcomingTasksCount = Math.max(0, storeTasksCount - (overdueTasksCount + atRiskTasksCount + dueTodayTasksCount));

  const onTrackProjectsCount = storeProjectsList.filter((p) => p.status === 'Live Terkoneksi' || p.status?.includes('Pemasangan')).length;
  const atRiskProjectsCount = storeProjectsList.filter((p) => p.status?.includes('Tertunda') || p.status?.includes('Kendala')).length;
  const delayedProjectsCount = storeProjectsList.filter((p) => p.status?.includes('Material') || p.status?.includes('Menunggu')).length;
  const onHoldProjectsCount = storeProjectsList.filter((p) => p.status?.includes('Hold')).length;

  const dynamicSlaRate = overdueTasksCount > 0 ? '94.3%' : '100%';

  return (
    <div className={`sbx-dashboard-root ${theme === 'light' ? 'light-mode' : ''}`}>
      {/* SIDEBAR NAVIGATION (PERSIS SEPERTI GAMBAR DASAWARSA OS) */}
      <aside className="sbx-sidebar">
        {/* Brand Header */}
        <div className="sbx-sidebar-brand">
          <div className="sbx-brand-logo-wrap">
            <img src="/asset/apple-touch-icon.png" alt="SUNBLIX" className="sbx-brand-logo-img" />
          </div>
          <div className="sbx-brand-info">
            <span className="sbx-brand-name">SUNBLIX</span>
            <span className="sbx-brand-sub">{APP_VERSION}</span>
          </div>
        </div>

        {/* Scrollable Navigation Menu Wrap */}
        <div className="sbx-sidebar-nav-wrap">
          <ul className="sbx-nav-list">
            <li>
              <button
                type="button"
                className={`sbx-nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveNav('dashboard')}
              >
                <div className="sbx-nav-left">
                  <span className="sbx-nav-icon">🏠</span>
                  <span>Dashboard</span>
                </div>
              </button>
            </li>

            <li>
              <button
                type="button"
                className={`sbx-nav-item ${activeNav === 'my-work' ? 'active' : ''}`}
                onClick={() => setActiveNav('my-work')}
              >
                <div className="sbx-nav-left">
                  <span className="sbx-nav-icon">📥</span>
                  <span>My Work</span>
                </div>
                {storeTasksCount > 0 && <span className="sbx-nav-badge danger">{storeTasksCount}</span>}
              </button>
            </li>

            {/* AI Agent Fleet Menu Item */}
            <li>
              <button
                type="button"
                className={`sbx-nav-item ${activeNav === 'ai-fleet' ? 'active' : ''}`}
                onClick={() => setActiveNav('ai-fleet')}
              >
                <div className="sbx-nav-left">
                  <span className="sbx-nav-icon">🤖</span>
                  <span>AI Agent Fleet</span>
                </div>
                <span className="sbx-nav-badge ai-live">4 Live</span>
              </button>
            </li>

            <li>
              <button
                type="button"
                className={`sbx-nav-item ${activeNav === 'surti-intelligence' ? 'active' : ''}`}
                onClick={() => setActiveNav('surti-intelligence')}
              >
                <div className="sbx-nav-left">
                  <span className="sbx-nav-icon">⚡</span>
                  <span>SURTI Intelligence</span>
                </div>
                <span className="sbx-nav-badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: 600 }}>SPH Queue</span>
              </button>
            </li>

            <li>
              <button
                type="button"
                className={`sbx-nav-item ${activeNav === 'crm' ? 'active' : ''}`}
                onClick={() => setActiveNav('crm')}
              >
                <div className="sbx-nav-left">
                  <span className="sbx-nav-icon">👥</span>
                  <span>CRM & Leads</span>
                </div>
                {storeLeadsCount > 0 && <span className="sbx-nav-badge info">{storeLeadsCount} Baru</span>}
              </button>
            </li>

            <li>
              <button
                type="button"
                className={`sbx-nav-item ${activeNav === 'projects' ? 'active' : ''}`}
                onClick={() => setActiveNav('projects')}
              >
                <div className="sbx-nav-left">
                  <span className="sbx-nav-icon">☀️</span>
                  <span>Projects</span>
                </div>
                {storeProjectsCount > 0 && <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>{storeProjectsCount}</span>}
              </button>
            </li>


            <li>
              <Link href="/brosur" className="sbx-nav-item" target="_blank" rel="noopener noreferrer">
                <div className="sbx-nav-left">
                  <span className="sbx-nav-icon">📑</span>
                  <span>RFQ & SPH Proposal</span>
                </div>
                <span style={{ fontSize: '10.5px', color: '#38bdf8' }}>↗</span>
              </Link>
            </li>

            <li>
              <button
                type="button"
                className={`sbx-nav-item ${activeNav === 'procurement' ? 'active' : ''}`}
                onClick={() => setActiveNav('procurement')}
              >
                <div className="sbx-nav-left">
                  <span className="sbx-nav-icon">📦</span>
                  <span>Procurement Board</span>
                </div>
              </button>
            </li>

            <li>
              <button
                type="button"
                className={`sbx-nav-item ${activeNav === 'vendors' ? 'active' : ''}`}
                onClick={() => setActiveNav('vendors')}
              >
                <div className="sbx-nav-left">
                  <span className="sbx-nav-icon">🤝</span>
                  <span>Vendors</span>
                </div>
              </button>
            </li>

            <li>
              <button
                type="button"
                className={`sbx-nav-item ${activeNav === 'production' ? 'active' : ''}`}
                onClick={() => setActiveNav('production')}
              >
                <div className="sbx-nav-left">
                  <span className="sbx-nav-icon">⚡</span>
                  <span>Production (PLTS)</span>
                </div>
              </button>
            </li>

            <li>
              <button
                type="button"
                className={`sbx-nav-item ${activeNav === 'quality' ? 'active' : ''}`}
                onClick={() => setActiveNav('quality')}
              >
                <div className="sbx-nav-left">
                  <span className="sbx-nav-icon">🛡️</span>
                  <span>Quality Control (SLO)</span>
                </div>
              </button>
            </li>

            <li>
              <button
                type="button"
                className={`sbx-nav-item ${activeNav === 'delivery' ? 'active' : ''}`}
                onClick={() => setActiveNav('delivery')}
              >
                <div className="sbx-nav-left">
                  <span className="sbx-nav-icon">🚚</span>
                  <span>Delivery & Sites</span>
                </div>
              </button>
            </li>

            <li>
              <button
                type="button"
                className={`sbx-nav-item ${activeNav === 'finance' ? 'active' : ''}`}
                onClick={() => setActiveNav('finance')}
              >
                <div className="sbx-nav-left">
                  <span className="sbx-nav-icon">💵</span>
                  <span>Finance</span>
                </div>
              </button>
            </li>

            <li>
              <button
                type="button"
                className={`sbx-nav-item ${activeNav === 'performance' ? 'active' : ''}`}
                onClick={() => setActiveNav('performance')}
              >
                <div className="sbx-nav-left">
                  <span className="sbx-nav-icon">📊</span>
                  <span>Performance</span>
                </div>
              </button>
            </li>

            <li>
              <button
                type="button"
                className={`sbx-nav-item ${activeNav === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveNav('settings')}
              >
                <div className="sbx-nav-left">
                  <span className="sbx-nav-icon">⚙️</span>
                  <span>Settings</span>
                </div>
              </button>
            </li>
          </ul>
        </div>

        {/* Sidebar Bottom Profile Card (Permanently Anchored & Visible) */}
        <div className="sbx-sidebar-bottom">
          <div className="sbx-user-card" onClick={handleLogout} title="Klik untuk keluar / Logout">
            <div className="sbx-user-left">
              <div className="sbx-user-avatar">{currentUser.avatar || 'D'}</div>
              <div className="sbx-user-meta">
                <span className="sbx-user-name">{currentUser.name || 'Danny'}</span>
                <span className="sbx-user-role">{currentUser.role || 'Director / CEO'}</span>
              </div>
            </div>
            <span style={{ fontSize: '10px', color: '#64748b' }}>⌄</span>
          </div>

          <p className="sbx-copyright">
            SUNBLIX OS • © 2026 PT Sunblix Energi Indonesia
          </p>
        </div>
      </aside>

      {/* MAIN DASHBOARD CONTENT */}
      <main className="sbx-main-content">
        {/* TOPBAR HEADER (GREETING + SEARCH + ICONS) */}
        <header className="sbx-topbar">
          <div className="sbx-topbar-greeting">
            <h1>
              {greeting}, {currentUser.name || 'Danny'} 👋
            </h1>
            <p>Here&apos;s what&apos;s happening in Sunblix OS today.</p>
          </div>

          <div className="sbx-topbar-actions">
            {/* Global Search Bar */}
            <div className="sbx-search-box">
              <span className="sbx-search-icon">🔍</span>
              <input
                type="text"
                className="sbx-search-input"
                placeholder="Search projects, clients, RFQs, telemetries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              className="sbx-top-btn"
              title={`${unreadNotifCount} Notifikasi Operasional Baru`}
              onClick={() => setShowNotifications(true)}
            >
              <span>🔔</span>
              {unreadNotifCount > 0 && <span className="sbx-btn-badge">{unreadNotifCount}</span>}
            </button>

            {/* Messages Chat */}
            <button
              type="button"
              className="sbx-top-btn"
              title={`${messagesCount} Pesan Inbound WhatsApp`}
              onClick={() => setShowMessages(true)}
            >
              <span>💬</span>
              {messagesCount > 0 && <span className="sbx-btn-badge">{messagesCount}</span>}
            </button>

            {/* Theme Toggle Button */}
            <button
              type="button"
              className="sbx-top-btn"
              onClick={toggleTheme}
              title={`Ganti ke mode ${theme === 'light' ? 'gelap' : 'terang'}`}
            >
              <span>{theme === 'light' ? '☀️' : '🌙'}</span>
            </button>

            {/* Date Widget */}
            <div className="sbx-date-widget">
              <span>📅</span>
              <span>
                {currentDateStr || 'Friday, 16 May 2026'} • {currentTime || '09:41 AM'}
              </span>
            </div>
          </div>
        </header>

        {/* ===================================================================
            VIEW CONDITIONING FOR ALL SUNBLIX OS MENUS
           =================================================================== */}
        {activeNav === 'my-work' && (
          <MyWorkView onBackToDashboard={() => setActiveNav('dashboard')} />
        )}

        {activeNav === 'surti-intelligence' && (
          <SurtiIntelligenceView
            currentUser={currentUser}
            onBackToDashboard={() => setActiveNav('dashboard')}
          />
        )}

        {activeNav === 'crm' && (
          <CrmView
            onBackToDashboard={() => setActiveNav('dashboard')}
            onNavigateToProjects={() => setActiveNav('projects')}
          />
        )}

        {activeNav === 'projects' && (
          <ProjectsView onBackToDashboard={() => setActiveNav('dashboard')} />
        )}

        {activeNav === 'procurement' && (
          <ProcurementView onBackToDashboard={() => setActiveNav('dashboard')} />
        )}

        {activeNav === 'vendors' && (
          <VendorsView onBackToDashboard={() => setActiveNav('dashboard')} />
        )}

        {activeNav === 'production' && (
          <ProductionView onBackToDashboard={() => setActiveNav('dashboard')} />
        )}

        {activeNav === 'quality' && (
          <QualityView onBackToDashboard={() => setActiveNav('dashboard')} />
        )}

        {activeNav === 'delivery' && (
          <DeliveryView onBackToDashboard={() => setActiveNav('dashboard')} />
        )}

        {activeNav === 'finance' && (
          <FinanceView onBackToDashboard={() => setActiveNav('dashboard')} />
        )}

        {activeNav === 'performance' && (
          <PerformanceView onBackToDashboard={() => setActiveNav('dashboard')} />
        )}

        {activeNav === 'settings' && (
          <SettingsView currentUser={currentUser} onBackToDashboard={() => setActiveNav('dashboard')} />
        )}

        {activeNav === 'ai-fleet' && (
          <div className="sbx-ai-fleet-dedicated-view">
            {/* View Header */}
            <div className="sbx-view-header">
              <div>
                <div className="sbx-breadcrumb">
                  <span onClick={() => setActiveNav('dashboard')} style={{ cursor: 'pointer' }}>Dashboard</span>
                  <span> / </span>
                  <span style={{ color: 'var(--sbx-accent)' }}>AI Autonomous Agent Fleet</span>
                </div>
                <h1 className="sbx-view-title">
                  🤖 AI Autonomous Agent Fleet — Active Live Workers
                </h1>
                <p className="sbx-view-sub">
                  Pusat komando terpadu 4 spesialis digital AI PT Sunblix Energi Indonesia untuk otomatisasi site survey, SPH proposal, telemetri IoT baterai, dan kualifikasi prospek.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="sbx-ai-filter-btn"
                  onClick={() => setActiveNav('dashboard')}
                  style={{ background: 'transparent', border: '1px solid var(--sbx-glass-border)', color: 'var(--sbx-text)', cursor: 'pointer' }}
                >
                  ← Kembali ke Dashboard
                </button>
                <button
                  type="button"
                  className="sbx-ai-filter-btn active"
                  onClick={() => handleTriggerAgent(selectedAgentKey)}
                >
                  ⚡ Trigger Autonomous Cycle
                </button>
              </div>
            </div>

            {/* Split View Card: 4 Profile Cards (Left) & Real-Time Animated Viewport (Right) */}
            <section className="sbx-ai-fleet-hub-card">
          <div className="sbx-ai-fleet-header">
            <div className="sbx-ai-fleet-title-wrap">
              <span className="sbx-ai-fleet-icon-pulse" />
              <h2 className="sbx-ai-fleet-title">AI Autonomous Agent Fleet — Active Live Workers</h2>
              <span className="sbx-ai-fleet-badge">4 Digital Specialists Online</span>
            </div>
            <div className="sbx-ai-fleet-actions">
              {/* Adaptive Switcher: 3D Virtual Office vs 2D Diagnostic HUD */}
              <div className="sbx-ai-mode-toggle-group">
                <button
                  type="button"
                  className={`sbx-ai-mode-btn ${fleetViewMode === '3d' ? 'active' : ''}`}
                  onClick={() => setFleetViewMode('3d')}
                  title="Lihat kantor virtual 3D interaktif 4 spesialis AI"
                >
                  🏢 3D Office Space
                </button>
                <button
                  type="button"
                  className={`sbx-ai-mode-btn ${fleetViewMode === 'hud' ? 'active' : ''}`}
                  onClick={() => setFleetViewMode('hud')}
                  title="Mode ringan sensor & telemetri (Optimal untuk baterai ponsel)"
                >
                  ⚡ Diagnostic HUD
                </button>
              </div>

              <button
                type="button"
                className="sbx-ai-filter-btn active"
                onClick={() => handleTriggerAgent(selectedAgentKey)}
              >
                ⚡ Trigger Autonomous Cycle
              </button>
            </div>
          </div>

          {/* Split Container: Left Profil Cards (350px) | Right Dynamic Moving Visual (1fr) */}
          <div className="sbx-ai-split-layout">
            {/* SISI KIRI: 4 KOTAK KECIL PROFIL AGENT */}
            <div className="sbx-ai-profile-list">
              {Object.keys(agents).map((key) => {
                const ag = agents[key];
                const isSelected = selectedAgentKey === key;
                return (
                  <div
                    key={key}
                    className={`sbx-ai-profile-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedAgentKey(key)}
                    title={`Klik untuk melihat visual animasi kerja ${ag.name}`}
                  >
                    <div className="sbx-ai-profile-top">
                      <div className="sbx-ai-avatar-wrap">
                        <div className={`sbx-ai-avatar ${ag.avatarClass}`}>{ag.icon}</div>
                        <div className="sbx-ai-meta">
                          <span className="sbx-ai-name">{ag.name}</span>
                          <span className="sbx-ai-role">{ag.role}</span>
                        </div>
                      </div>
                      <span className="sbx-ai-status-pill working">
                        <span className="sbx-ai-status-dot" />
                        <span>{ag.status}</span>
                      </span>
                    </div>

                    <p className="sbx-ai-activity-desc">{ag.activity}</p>

                    <div className="sbx-ai-progress-wrap">
                      <div className="sbx-ai-progress-meta">
                        <span>Execution Load</span>
                        <span>{ag.progress}%</span>
                      </div>
                      <div className="sbx-ai-progress-bar-bg">
                        <div
                          className={`sbx-ai-progress-bar-fill ${ag.avatarClass}`}
                          style={{ width: `${ag.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SISI KANAN: ADAPTIVE VIEWPORT (3D VIRTUAL OFFICE ATAU 2D DIAGNOSTIC HUD) */}
            {fleetViewMode === '3d' ? (
              <div className="sbx-ai-animated-viewport" style={{ padding: 0, overflow: 'hidden', minHeight: '460px' }}>
                <AgentVirtualOffice3D
                  selectedAgentKey={selectedAgentKey}
                  onSelectAgent={setSelectedAgentKey}
                  agents={agents}
                  isCycleActive={isCycleRunning}
                  onTriggerCycle={handleTriggerAgent}
                />
              </div>
            ) : (
              <div className="sbx-ai-animated-viewport">
              {/* HUD Header Viewport */}
              <div className="sbx-viewport-hud">
                <div className="sbx-viewport-agent-name">
                  <span>{activeAgent.icon}</span>
                  <span>LIVE HUD: {activeAgent.name.toUpperCase()}</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                    ({activeAgent.role})
                  </span>
                </div>
                <div className="sbx-viewport-live-tag">
                  <span className="sbx-ai-status-dot" />
                  <span>STREAMING VISUAL LIVE</span>
                </div>
              </div>

              {/* KONTEN ANIMASI BERGERAK 1: AGENT SOLARIA (ROOFTOP SCANNER & AZIMUTH) */}
              {selectedAgentKey === 'solaria' && (
                <div className="sbx-anim-solaria-wrap">
                  <div className="sbx-roof-scanner-stage">
                    {/* Laser Scanner Bar Bergerak Naik Turun */}
                    <div className="sbx-laser-beam" />
                    
                    {/* Grid Layout Modul PV Bersinar Bergantian */}
                    <div className="sbx-pv-layout-matrix">
                      {Array.from({ length: 18 }).map((_, i) => (
                        <div
                          key={i}
                          className="sbx-pv-tile"
                          style={{ animationDelay: `${(i % 6) * 0.3}s` }}
                          title={`Modul LONGI 585 Wp #${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Kompas Azimuth Berputar & Info Sudut Kemiringan */}
                  <div className="sbx-compass-box">
                    <span style={{ fontSize: '10.5px', color: '#f59e0b', fontWeight: 800 }}>AZIMUTH 175°</span>
                    <div className="sbx-compass-dial">
                      <span style={{ fontSize: '18px' }}>🧭</span>
                    </div>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>Tilt Kemiringan 11°</span>
                    <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700 }}>Irradiance: 4.85 PSH</span>
                  </div>
                </div>
              )}

              {/* KONTEN ANIMASI BERGERAK 2: AGENT HELIOS (SPH PROPOSAL & TIERED DISCOUNT CALCULATOR) */}
              {selectedAgentKey === 'helios' && (
                <div className="sbx-anim-helios-wrap">
                  {/* Lembar Proposal SPH Digital Otomatis Dicetak */}
                  <div className="sbx-sph-doc-preview">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 800, color: '#38bdf8' }}>
                      <span>SPH REF: SBX/2026/014</span>
                      <span>3 PAGES</span>
                    </div>
                    <div className="sbx-doc-line" style={{ width: '85%' }} />
                    <div className="sbx-doc-line" style={{ width: '65%', animationDelay: '0.3s' }} />
                    <div className="sbx-doc-line" style={{ width: '92%', animationDelay: '0.6s' }} />
                    <div className="sbx-doc-line" style={{ width: '45%', animationDelay: '0.9s' }} />
                    {/* Stempel Hologram Berkedip */}
                    <div className="sbx-sph-stamp">OFFICIAL VERIFIED</div>
                  </div>

                  {/* Kalkulator Diskon Berjenjang & Grafik Penghematan */}
                  <div className="sbx-discount-calc-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800 }}>
                      <span style={{ color: '#38bdf8' }}>Kalkulasi Diskon Berjenjang:</span>
                      <span style={{ color: '#10b981' }}>-4.5% (-Rp 6.543.000)</span>
                    </div>
                    <div className="sbx-calc-bar-wrap">
                      <div className="sbx-calc-bar-track">
                        <div className="sbx-calc-bar-val" />
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.4' }}>
                      Kalkulator SPH: <strong>Katalog Resmi Sunblix 2026</strong><br />
                      Status: <strong style={{ color: '#38bdf8' }}>Siap Kalkulasi Penawaran Real-Time</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* KONTEN ANIMASI BERGERAK 3: AGENT VOLT (SINE WAVE OSCILLOSCOPE & BATTERY ESS) */}
              {selectedAgentKey === 'volt' && (
                <div className="sbx-anim-volt-wrap">
                  {/* Gelombang Sinus Osiloskop Inverter Deye Bergerak */}
                  <div className="sbx-sine-wave-stage">
                    <svg className="sbx-sine-svg" viewBox="0 0 300 80">
                      <path
                        className="sbx-sine-path"
                        d="M0,40 Q37.5,0 75,40 T150,40 T225,40 T300,40 T375,40 T450,40"
                      />
                    </svg>
                    <span style={{ position: 'absolute', top: '8px', left: '10px', fontSize: '10px', color: '#10b981', fontWeight: 800, fontFamily: 'monospace' }}>
                      GRID OSCILLOSCOPE: 50.00 Hz • 220 VAC
                    </span>
                  </div>

                  {/* Meteran 4 Sel Baterai LiFePO4 Mengisi Energi Mengalir */}
                  <div className="sbx-battery-flow-box">
                    <span style={{ fontSize: '10.5px', color: '#10b981', fontWeight: 800 }}>BATTERY PACK ESS</span>
                    <div className="sbx-battery-cells-wrap">
                      {[1, 2, 3, 4].map((c) => (
                        <div key={c} className="sbx-battery-cell">
                          <div
                            className="sbx-battery-cell-liquid"
                            style={{ animationDelay: `${c * 0.3}s` }}
                          />
                        </div>
                      ))}
                    </div>
                    <span style={{ fontSize: '10px', color: '#cbd5e1', fontWeight: 700 }}>Telemetry Standby</span>
                    <span style={{ fontSize: '9.5px', color: '#94a3b8' }}>Sistem Siap Sinkronisasi IoT</span>
                  </div>
                </div>
              )}

              {/* KONTEN ANIMASI BERGERAK 4: AGENT OMNI (360 RADAR SWEEP & INBOUND CHAT) */}
              {selectedAgentKey === 'omni' && (
                <div className="sbx-anim-omni-wrap">
                  {/* Piringan Radar 360 Derajat Memutar */}
                  <div className="sbx-radar-stage">
                    <div className="sbx-radar-sweeper" />
                    {/* Titik Radar Sinyal Masuk */}
                    <div className="sbx-radar-blip" style={{ top: '35%', left: '45%' }} title="Lead Radar Standby" />
                    <span style={{ position: 'absolute', bottom: '6px', fontSize: '9px', color: '#a855f7', fontWeight: 800 }}>
                      RADAR DISPATCH
                    </span>
                  </div>

                  {/* Simulasi Balon Percakapan WhatsApp Bergerak */}
                  <div className="sbx-chat-stream-box">
                    <div className="sbx-chat-bubble">
                      💬 <strong>WhatsApp Inbound Auto-Concierge:</strong><br />
                      &ldquo;SURTI AI siap melayani konsultasi dan kualifikasi kebutuhan PLTS calon pelanggan 24/7.&rdquo;
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10.5px', color: '#a855f7' }}>
                      <span className="sbx-typing-dots">
                        <span /><span /><span />
                      </span>
                      <span>Agent OMNI standby memantau prospek masuk dari SURTI Web &amp; WhatsApp...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Viewport Footer HUD & Kontrol Interaktif */}
              <div className="sbx-viewport-footer-hud">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="sbx-viewport-telemetry-text">
                    LOG: {activeAgent.logs[activeAgent.logs.length - 1]}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Link
                    href="/brosur"
                    className="sbx-viewport-cta-btn"
                    style={{ textDecoration: 'none', background: 'rgba(56, 189, 248, 0.2)', border: '1px solid rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
                  >
                    Buka Generator SPH ↗
                  </Link>
                  <button
                    type="button"
                    className="sbx-viewport-cta-btn"
                    onClick={() => handleTriggerAgent(selectedAgentKey)}
                  >
                    Jalankan Siklus Agen ➔
                  </button>
                </div>
              </div>
            </div>
            )}
          </div>

          {agentActionMessage && (
            <div style={{ fontSize: '12px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '6px' }}>
              {agentActionMessage}
            </div>
          )}
        </section>

            {/* 4 Agent Specialty Cards in Dedicated View */}
            <div className="sbx-ai-spec-grid">
              <div className="sbx-ai-spec-card">
                <div className="sbx-ai-spec-header">
                  <span className="sbx-ai-spec-icon">☀️</span>
                  <span className="sbx-ai-spec-title">Agent SOLARIA</span>
                </div>
                <p className="sbx-ai-spec-desc">
                  Auto-Layout 3D PV, azimuth solar angles, and shadow analysis from satellite contours.
                </p>
                <span className="sbx-ai-spec-tag">Rooftop Solar EPC</span>
              </div>

              <div className="sbx-ai-spec-card">
                <div className="sbx-ai-spec-header">
                  <span className="sbx-ai-spec-icon">📑</span>
                  <span className="sbx-ai-spec-title">Agent HELIOS</span>
                </div>
                <p className="sbx-ai-spec-desc">
                  Instant SPH proposal calculation, 11% PPN tax compliance, and tiered discount protection.
                </p>
                <span className="sbx-ai-spec-tag">Sales & Proposal Copilot</span>
              </div>

              <div className="sbx-ai-spec-card">
                <div className="sbx-ai-spec-header">
                  <span className="sbx-ai-spec-icon">⚡</span>
                  <span className="sbx-ai-spec-title">Agent VOLT</span>
                </div>
                <p className="sbx-ai-spec-desc">
                  Real-time MQTT IoT watchdog across Deye hybrid inverters & LiFePO4 battery cell temps.
                </p>
                <span className="sbx-ai-spec-tag">IoT & Battery Watchdog</span>
              </div>

              <div className="sbx-ai-spec-card">
                <div className="sbx-ai-spec-header">
                  <span className="sbx-ai-spec-icon">💬</span>
                  <span className="sbx-ai-spec-title">Agent OMNI</span>
                </div>
                <p className="sbx-ai-spec-desc">
                  WhatsApp lead qualification, residential electricity tariff matching, and site survey scheduler.
                </p>
                <span className="sbx-ai-spec-tag">Lead Concierge & CRM</span>
              </div>
            </div>
          </div>
        )}

        {activeNav === 'dashboard' && (
          <>
            {/* Quick Access AI Strip on Default Dashboard Landing */}
            <div className="sbx-ai-status-strip">
              <div className="sbx-ai-status-strip-left">
                <span className="sbx-ai-fleet-icon-pulse" />
                <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--sbx-text)' }}>
                  AI Autonomous Agent Fleet:
                </span>
                <span style={{ fontSize: '12.5px', color: 'var(--sbx-text-muted)' }}>
                  4 Digital Specialists Online (Solaria, Helios, Volt, Omni) • Telemetri IoT & perancangan PLTS aktif di latar belakang
                </span>
              </div>
              <button
                type="button"
                className="sbx-ai-strip-btn"
                onClick={() => setActiveNav('ai-fleet')}
              >
                Buka Panel AI Fleet ➔
              </button>
            </div>

            {/* ===================================================================
                ROW 1: 5 TOP METRIC CARDS (DYNAMIC OPERATIONAL VALUES)
               =================================================================== */}
            <section className="sbx-metrics-row">
              {/* Card 1: Total Revenue (YTD) */}
              <div className="sbx-metric-card">
                <div className="sbx-metric-header">
                  <span className="sbx-metric-label">Total Revenue (YTD)</span>
                  <div className="sbx-metric-icon">🪙</div>
                </div>
                <div className="sbx-metric-body">
                  <span className="sbx-metric-val">{dynamicRevenueStr}</span>
                  <span className={`sbx-status-badge ${dynamicRevenueNum > 0 ? 'success' : 'info'}`}>
                    {dynamicRevenueNum > 0 ? 'Aktif' : 'Zero State'}
                  </span>
                </div>
                <p className="sbx-metric-subtext">
                  {dynamicRevenueNum > 0 ? 'Total faktur termin terlunasi' : 'Belum ada pembayaran invoice'}
                </p>
              </div>

              {/* Card 2: Gross Margin (YTD) */}
              <div className="sbx-metric-card">
                <div className="sbx-metric-header">
                  <span className="sbx-metric-label">Gross Margin (YTD)</span>
                  <div className="sbx-metric-icon">📊</div>
                </div>
                <div className="sbx-metric-body">
                  <span className="sbx-metric-val">{dynamicRevenueNum > 0 ? '21.7%' : '0%'}</span>
                  <span className="sbx-metric-badge-delta">SOP Target</span>
                </div>
                <p className="sbx-metric-subtext">Gross margin operasional EPC</p>
              </div>

              {/* Card 3: Active Projects */}
              <div className="sbx-metric-card">
                <div className="sbx-metric-header">
                  <span className="sbx-metric-label">Active Projects</span>
                  <div className="sbx-metric-icon">📁</div>
                </div>
                <div className="sbx-metric-body">
                  <span className="sbx-metric-val">{storeProjectsCount}</span>
                </div>
                <p className="sbx-metric-subtext">
                  {storeProjectsCount === 0 ? 'Belum ada proyek aktif' : `${storeProjectsCount} Proyek dalam pengerjaan`}
                </p>
              </div>

              {/* Card 4: Open Work Items */}
              <div className="sbx-metric-card">
                <div className="sbx-metric-header">
                  <span className="sbx-metric-label">Open Work Items</span>
                  <div className="sbx-metric-icon">☑️</div>
                </div>
                <div className="sbx-metric-body">
                  <span className="sbx-metric-val">{storeTasksCount}</span>
                </div>
                <p className="sbx-metric-subtext">
                  {storeTasksCount === 0 ? 'Semua tugas telah terselesaikan' : `${storeTasksCount} Tugas aktif`}
                </p>
              </div>

              {/* Card 5: SLA Achievement */}
              <div className="sbx-metric-card">
                <div className="sbx-metric-header">
                  <span className="sbx-metric-label">SLA Achievement</span>
                  <div className="sbx-metric-icon">🎯</div>
                </div>
                <div className="sbx-metric-body">
                  <span className="sbx-metric-val">{dynamicSlaRate}</span>
                  <span className="sbx-status-badge success">Target SOP</span>
                </div>
                <p className="sbx-metric-subtext">Kepatuhan SLA operasional</p>
              </div>
            </section>

            {/* ===================================================================
                ROW 2: 3 VISUAL WIDGETS (DONUT CHART, SLA LINE, STATUS DONUT)
               =================================================================== */}
            <section className="sbx-row-three-cols">
              {/* Widget 1: Work Summary (Donut Chart) */}
              <div className="sbx-card">
                <div className="sbx-card-header">
                  <h3 className="sbx-card-title">Work Summary</h3>
                </div>

                <div className="sbx-donut-wrapper">
                  <div className="sbx-donut-graphic">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="46" fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="16" />
                      {storeTasksCount > 0 ? (
                        <>
                          {upcomingTasksCount > 0 && (
                            <circle
                              cx="60" cy="60" r="46" fill="transparent"
                              stroke="#10b981" strokeWidth="16"
                              strokeDasharray={`${Math.round((upcomingTasksCount / storeTasksCount) * 289)} 289`}
                              strokeDashoffset="0"
                              transform="rotate(-90 60 60)"
                            />
                          )}
                          {dueTodayTasksCount > 0 && (
                            <circle
                              cx="60" cy="60" r="46" fill="transparent"
                              stroke="#0284c7" strokeWidth="16"
                              strokeDasharray={`${Math.round((dueTodayTasksCount / storeTasksCount) * 289)} 289`}
                              strokeDashoffset={`-${Math.round((upcomingTasksCount / storeTasksCount) * 289)}`}
                              transform="rotate(-90 60 60)"
                            />
                          )}
                          {atRiskTasksCount > 0 && (
                            <circle
                              cx="60" cy="60" r="46" fill="transparent"
                              stroke="#f59e0b" strokeWidth="16"
                              strokeDasharray={`${Math.round((atRiskTasksCount / storeTasksCount) * 289)} 289`}
                              strokeDashoffset={`-${Math.round(((upcomingTasksCount + dueTodayTasksCount) / storeTasksCount) * 289)}`}
                              transform="rotate(-90 60 60)"
                            />
                          )}
                          {overdueTasksCount > 0 && (
                            <circle
                              cx="60" cy="60" r="46" fill="transparent"
                              stroke="#f43f5e" strokeWidth="16"
                              strokeDasharray={`${Math.round((overdueTasksCount / storeTasksCount) * 289)} 289`}
                              strokeDashoffset={`-${Math.round(((upcomingTasksCount + dueTodayTasksCount + atRiskTasksCount) / storeTasksCount) * 289)}`}
                              transform="rotate(-90 60 60)"
                            />
                          )}
                        </>
                      ) : (
                        <circle cx="60" cy="60" r="46" fill="transparent" stroke="rgba(255,255,255,0.12)" strokeWidth="16" />
                      )}
                    </svg>
                    <div className="sbx-donut-center-text">
                      <div className="sbx-donut-center-num">{storeTasksCount}</div>
                      <div className="sbx-donut-center-lbl">Total</div>
                    </div>
                  </div>

                  <div className="sbx-donut-legend">
                    <div className="sbx-legend-item">
                      <div className="sbx-legend-left">
                        <span className="sbx-legend-dot red" />
                        <span>Overdue</span>
                      </div>
                      <span className="sbx-legend-val">{overdueTasksCount}</span>
                    </div>
                    <div className="sbx-legend-item">
                      <div className="sbx-legend-left">
                        <span className="sbx-legend-dot orange" />
                        <span>At Risk</span>
                      </div>
                      <span className="sbx-legend-val">{atRiskTasksCount}</span>
                    </div>
                    <div className="sbx-legend-item">
                      <div className="sbx-legend-left">
                        <span className="sbx-legend-dot blue" />
                        <span>Due Today</span>
                      </div>
                      <span className="sbx-legend-val">{dueTodayTasksCount}</span>
                    </div>
                    <div className="sbx-legend-item">
                      <div className="sbx-legend-left">
                        <span className="sbx-legend-dot green" />
                        <span>Upcoming</span>
                      </div>
                      <span className="sbx-legend-val">{upcomingTasksCount}</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="sbx-card-link"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => setActiveNav('my-work')}
                  >
                    View My Work →
                  </button>
                </div>
              </div>

              {/* Widget 2: SLA Performance (Trend Line) */}
              <div className="sbx-card">
                <div className="sbx-card-header">
                  <h3 className="sbx-card-title">SLA Performance</h3>
                  <span style={{ fontSize: '11px', color: 'var(--sbx-text-muted)', border: '1px solid var(--sbx-glass-border)', padding: '2px 8px', borderRadius: '6px' }}>
                    Operasional Aktif
                  </span>
                </div>

                <div className="sbx-line-chart-wrap">
                  <svg className="sbx-svg-trend" viewBox="0 0 320 120">
                    <line x1="20" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                    <line x1="20" y1="50" x2="300" y2="50" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                    <line x1="20" y1="80" x2="300" y2="80" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                    <line x1="20" y1="110" x2="300" y2="110" stroke="rgba(255,255,255,0.06)" />

                    <text x="0" y="24" fill="#94a3b8" fontSize="8">100%</text>
                    <text x="5" y="54" fill="#94a3b8" fontSize="8">75%</text>
                    <text x="5" y="84" fill="#94a3b8" fontSize="8">50%</text>
                    <text x="10" y="114" fill="#94a3b8" fontSize="8">0%</text>

                    <defs>
                      <linearGradient id="slaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points="35,36 75,36 120,36 165,36 210,36 255,36 295,36 295,110 35,110"
                      fill="url(#slaGradient)"
                    />
                    <polyline
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      points="35,36 75,36 120,36 165,36 210,36 255,36 295,36"
                    />
                    {[
                      { x: 35, y: 36, val: '100%', day: 'Hari 1' },
                      { x: 75, y: 36, val: '100%', day: 'Hari 2' },
                      { x: 120, y: 36, val: '100%', day: 'Hari 3' },
                      { x: 165, y: 36, val: '100%', day: 'Hari 4' },
                      { x: 210, y: 36, val: '100%', day: 'Hari 5' },
                      { x: 255, y: 36, val: '100%', day: 'Hari 6' },
                      { x: 295, y: 36, val: '100%', day: 'Hari 7' },
                    ].map((pt, idx) => (
                      <g key={idx}>
                        <circle cx={pt.x} cy={pt.y} r="3.5" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                        <text x={pt.x} y={pt.y - 7} fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">
                          {pt.val}
                        </text>
                        <text x={pt.x} y={118} fill="#94a3b8" fontSize="7.5" textAnchor="middle">
                          {pt.day}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#10b981', fontWeight: 700 }}>
                  <span>✓ Standar SLA Terpenuhi</span>
                  <span>Uptime 100%</span>
                </div>
              </div>

              {/* Widget 3: Projects by Status (Donut Chart) */}
              <div className="sbx-card">
                <div className="sbx-card-header">
                  <h3 className="sbx-card-title">Projects by Status</h3>
                </div>

                <div className="sbx-donut-wrapper">
                  <div className="sbx-donut-graphic">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="46" fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="16" />
                      {storeProjectsCount > 0 ? (
                        <>
                          {onTrackProjectsCount > 0 && (
                            <circle
                              cx="60" cy="60" r="46" fill="transparent"
                              stroke="#10b981" strokeWidth="16"
                              strokeDasharray={`${Math.round((onTrackProjectsCount / storeProjectsCount) * 289)} 289`}
                              strokeDashoffset="0"
                              transform="rotate(-90 60 60)"
                            />
                          )}
                          {atRiskProjectsCount > 0 && (
                            <circle
                              cx="60" cy="60" r="46" fill="transparent"
                              stroke="#f59e0b" strokeWidth="16"
                              strokeDasharray={`${Math.round((atRiskProjectsCount / storeProjectsCount) * 289)} 289`}
                              strokeDashoffset={`-${Math.round((onTrackProjectsCount / storeProjectsCount) * 289)}`}
                              transform="rotate(-90 60 60)"
                            />
                          )}
                          {delayedProjectsCount > 0 && (
                            <circle
                              cx="60" cy="60" r="46" fill="transparent"
                              stroke="#f43f5e" strokeWidth="16"
                              strokeDasharray={`${Math.round((delayedProjectsCount / storeProjectsCount) * 289)} 289`}
                              strokeDashoffset={`-${Math.round(((onTrackProjectsCount + atRiskProjectsCount) / storeProjectsCount) * 289)}`}
                              transform="rotate(-90 60 60)"
                            />
                          )}
                        </>
                      ) : (
                        <circle cx="60" cy="60" r="46" fill="transparent" stroke="rgba(255,255,255,0.12)" strokeWidth="16" />
                      )}
                    </svg>
                    <div className="sbx-donut-center-text">
                      <div className="sbx-donut-center-num">{storeProjectsCount}</div>
                      <div className="sbx-donut-center-lbl">Projects</div>
                    </div>
                  </div>

                  <div className="sbx-donut-legend">
                    <div className="sbx-legend-item">
                      <div className="sbx-legend-left">
                        <span className="sbx-legend-dot green" />
                        <span>On Track</span>
                      </div>
                      <span className="sbx-legend-val">{onTrackProjectsCount}</span>
                    </div>
                    <div className="sbx-legend-item">
                      <div className="sbx-legend-left">
                        <span className="sbx-legend-dot orange" />
                        <span>At Risk</span>
                      </div>
                      <span className="sbx-legend-val">{atRiskProjectsCount}</span>
                    </div>
                    <div className="sbx-legend-item">
                      <div className="sbx-legend-left">
                        <span className="sbx-legend-dot red" />
                        <span>Delayed</span>
                      </div>
                      <span className="sbx-legend-val">{delayedProjectsCount}</span>
                    </div>
                    <div className="sbx-legend-item">
                      <div className="sbx-legend-left">
                        <span className="sbx-legend-dot gray" />
                        <span>On Hold</span>
                      </div>
                      <span className="sbx-legend-val">{onHoldProjectsCount}</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="sbx-card-link"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => setActiveNav('projects')}
                  >
                    View All Projects →
                  </button>
                </div>
              </div>
            </section>

            {/* ===================================================================
                ROW 3: 3 OPERATIONAL WIDGETS (DEPARTMENT, CRITICAL ISSUES, RECENT ACTIVITY)
               =================================================================== */}
            <section className="sbx-row-bottom-grid">
              {/* Col 1: Department Performance */}
              <div className="sbx-card">
                <div className="sbx-card-header">
                  <h3 className="sbx-card-title">Department Performance</h3>
                </div>

                <table className="sbx-dept-table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>SLA %</th>
                      <th>KPI Score</th>
                      <th>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Sales / BD</strong></td>
                      <td>100%</td>
                      <td>100</td>
                      <td className="sbx-dept-trend">↗</td>
                    </tr>
                    <tr>
                      <td><strong>Procurement</strong></td>
                      <td>100%</td>
                      <td>100</td>
                      <td className="sbx-dept-trend">↗</td>
                    </tr>
                    <tr>
                      <td><strong>Operations</strong></td>
                      <td>100%</td>
                      <td>100</td>
                      <td className="sbx-dept-trend">↗</td>
                    </tr>
                    <tr>
                      <td><strong>Production</strong></td>
                      <td>100%</td>
                      <td>100</td>
                      <td className="sbx-dept-trend">↗</td>
                    </tr>
                    <tr>
                      <td><strong>Quality Control</strong></td>
                      <td>100%</td>
                      <td>100</td>
                      <td className="sbx-dept-trend">↗</td>
                    </tr>
                    <tr>
                      <td><strong>Finance</strong></td>
                      <td>100%</td>
                      <td>100</td>
                      <td className="sbx-dept-trend">↗</td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ textAlign: 'right', marginTop: '12px' }}>
                  <span className="sbx-card-link" style={{ cursor: 'pointer' }}>
                    Standar SOP Terpenuhi ✓
                  </span>
                </div>
              </div>

              {/* Col 2: Critical Issues */}
              <div className="sbx-card">
                <div className="sbx-card-header">
                  <h3 className="sbx-card-title">Critical Issues</h3>
                </div>

                {overdueTasksCount > 0 || atRiskTasksCount > 0 ? (
                  <div className="sbx-alerts-list">
                    {overdueTasksCount > 0 && (
                      <div className="sbx-alert-item">
                        <div className="sbx-alert-left">
                          <div className="sbx-alert-icon-wrap red">⚠️</div>
                          <div className="sbx-alert-meta">
                            <span className="sbx-alert-title">{overdueTasksCount} SLA Breaches</span>
                            <span className="sbx-alert-sub">Tugas prioritas memerlukan tindakan</span>
                          </div>
                        </div>
                        <button type="button" className="sbx-alert-btn-view" onClick={() => setActiveNav('my-work')}>View →</button>
                      </div>
                    )}
                    {atRiskTasksCount > 0 && (
                      <div className="sbx-alert-item">
                        <div className="sbx-alert-left">
                          <div className="sbx-alert-icon-wrap orange">🔒</div>
                          <div className="sbx-alert-meta">
                            <span className="sbx-alert-title">{atRiskTasksCount} Item At Risk</span>
                            <span className="sbx-alert-sub">Perlu monitoring tim</span>
                          </div>
                        </div>
                        <button type="button" className="sbx-alert-btn-view" onClick={() => setActiveNav('my-work')}>View →</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--sbx-text-muted)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                    <div style={{ fontWeight: 700, color: 'var(--sbx-text)', fontSize: '13.5px', marginBottom: '4px' }}>
                      Operasional Berjalan Normal
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      0 SLA Breaches • 0 Proyek Bermasalah • 0 Isu Kritis
                    </div>
                  </div>
                )}

                <div style={{ textAlign: 'right', marginTop: '12px' }}>
                  <span className="sbx-card-link" style={{ cursor: 'pointer' }} onClick={() => setActiveNav('my-work')}>
                    Buka My Work Inbox →
                  </span>
                </div>
              </div>

              {/* Col 3: Recent Activity */}
              <div className="sbx-card">
                <div className="sbx-card-header">
                  <h3 className="sbx-card-title">Recent Activity</h3>
                </div>

                {storeNotifsList.length > 0 ? (
                  <div className="sbx-activity-list">
                    {storeNotifsList.slice(0, 5).map((notif, idx) => (
                      <div key={idx} className="sbx-activity-item">
                        <div className="sbx-activity-icon-wrap">
                          {notif.icon || '📑'}
                        </div>
                        <div className="sbx-activity-content">
                          <span className="sbx-activity-text">
                            <strong>{notif.title}</strong><br />
                            {notif.desc}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--sbx-text-muted)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
                    <div style={{ fontWeight: 700, color: 'var(--sbx-text)', fontSize: '13.5px', marginBottom: '4px' }}>
                      Belum Ada Aktivitas Operasional
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      Aktivitas masuknya leads, penerbitan SPH, dan milestone proyek akan tampil di sini secara real-time.
                    </div>
                  </div>
                )}

                <div style={{ textAlign: 'right', marginTop: '12px' }}>
                  <span className="sbx-card-link" style={{ cursor: 'pointer' }} onClick={() => setShowNotifications(true)}>
                    Buka Semua Notifikasi →
                  </span>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* DRAWER 1: Notifications */}
      {showNotifications && (
        <NotificationDrawer
          onClose={() => setShowNotifications(false)}
          onNavigate={(target) => setActiveNav(target)}
        />
      )}

      {/* DRAWER 2: Inbound Messages */}
      {showMessages && (
        <MessagesDrawer
          onClose={() => setShowMessages(false)}
          onOpenCrm={() => setActiveNav('crm')}
        />
      )}
    </div>
  );
}
