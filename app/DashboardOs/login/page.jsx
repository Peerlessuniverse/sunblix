'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../os.css';
import '../dashboard.css';

// Application Dynamic Version
const APP_VERSION = 'v.1.0.0';

export default function SunblixLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('danny@sunblix.id');
  const [password, setPassword] = useState('sunblix2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('sunblix_os_theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
        setTheme(storedTheme);
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sunblix_os_theme', nextTheme);
    }
  };

  const executeLogin = (userObj) => {
    setIsLoading(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sunblix_os_session', JSON.stringify(userObj));
    }
    setTimeout(() => {
      router.push('/DashboardOs');
    }, 400);
  };

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setLoginError('Harap masukkan email/ID staf dan kata sandi.');
      return;
    }

    const uClean = username.trim().toLowerCase();
    const pClean = password.trim();

    const validUsers = ['danny@sunblix.id', 'danny', 'admin@sunblix.id', 'engineer@sunblix.id', 'sunblix'];
    const validPass = ['sunblix2026', '2026', 'danny2026', 'admin2026', 'sunblix'];

    if (validUsers.includes(uClean) || pClean === 'sunblix2026' || pClean === '2026' || pClean === 'danny2026') {
      const isEng = uClean.includes('engineer');
      const userObj = {
        name: isEng ? 'Tim Engineering EPC' : 'Danny',
        role: isEng ? 'Lead Rooftop EPC Engineer' : 'Director / CEO',
        avatar: isEng ? 'E' : 'D',
        email: uClean,
      };
      executeLogin(userObj);
    } else {
      setLoginError('Email atau kata sandi tidak valid. Silakan gunakan tombol akses cepat demo.');
    }
  };

  const handleQuickDemoLogin = (roleType) => {
    if (roleType === 'director') {
      const userObj = {
        name: 'Danny',
        role: 'Director / CEO',
        avatar: 'D',
        email: 'danny@sunblix.id',
      };
      executeLogin(userObj);
    } else {
      const userObj = {
        name: 'Tim EPC Engineer',
        role: 'Lead Rooftop EPC Engineer',
        avatar: 'E',
        email: 'engineer@sunblix.id',
      };
      executeLogin(userObj);
    }
  };

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
              <label className="os-label">Akun Email / ID Pengguna</label>
              <div className="os-input-wrap">
                <input
                  type="text"
                  className="os-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="danny@sunblix.id"
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
                  title={showPassword ? 'Sembunyikan' : 'Lihat kata sandi'}
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
                  disabled={isLoading}
                >
                  ⚡ Login Pak Danny (Director / CEO)
                </button>
                <button
                  type="button"
                  className="os-demo-pill"
                  onClick={() => handleQuickDemoLogin('engineer')}
                  disabled={isLoading}
                >
                  🛠️ Login Tim Engineer
                </button>
              </div>
            </div>

            <button type="submit" className="os-btn-submit" disabled={isLoading}>
              {isLoading ? 'Mengautentikasi Sesi...' : 'Masuk ke Sunblix OS ➔'}
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
