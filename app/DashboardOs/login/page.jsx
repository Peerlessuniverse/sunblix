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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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

    // Akun resmi staf Sunblix dengan validasi ketat (Email & Password harus cocok)
    const STAFF_ACCOUNTS = [
      {
        ids: ['danny@sunblix.id', 'danny'],
        passwords: ['sunblix2026', 'danny2026'],
        user: {
          name: 'Danny',
          role: 'Director / CEO',
          avatar: 'D',
          email: 'danny@sunblix.id',
        },
      },
      {
        ids: ['engineer@sunblix.id', 'engineer'],
        passwords: ['sunblix2026', 'engineer2026'],
        user: {
          name: 'Tim Engineering EPC',
          role: 'Lead Rooftop EPC Engineer',
          avatar: 'E',
          email: 'engineer@sunblix.id',
        },
      },
      {
        ids: ['warsa@sunblix.id', 'warsa'],
        passwords: ['sunblix2026', 'warsa2026'],
        user: {
          name: 'Warsa',
          role: 'Account Executive',
          avatar: 'W',
          email: 'warsa@sunblix.id',
        },
      },
      {
        ids: ['admin@sunblix.id', 'admin', 'sunblix'],
        passwords: ['sunblix2026', 'admin2026'],
        user: {
          name: 'Administrator',
          role: 'Operations & IT Admin',
          avatar: 'A',
          email: 'admin@sunblix.id',
        },
      },
    ];

    const matched = STAFF_ACCOUNTS.find(
      (acc) => acc.ids.includes(uClean) && acc.passwords.includes(pClean)
    );

    if (matched) {
      setLoginError('');
      executeLogin(matched.user);
    } else {
      setLoginError('ID Staf atau kata sandi tidak valid. Akses ditolak.');
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
                  placeholder="nama@sunblix.id"
                  required
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
                  placeholder="Masukkan kata sandi..."
                  required
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
              <div style={{ color: '#f87171', fontSize: '12.5px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '10px 14px', borderRadius: '8px' }}>
                ⚠️ {loginError}
              </div>
            )}

            <button type="submit" className="os-btn-submit" disabled={isLoading} style={{ marginTop: '8px' }}>
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
