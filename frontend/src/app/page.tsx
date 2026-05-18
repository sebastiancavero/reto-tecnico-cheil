'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', res.data.access_token);
      router.push('/dashboard');
    } catch {
      setError('Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --navy: #0a1628;
          --navy-mid: #0f2040;
          --navy-light: #162d52;
          --accent: #c8a96e;
          --text: #e8edf5;
          --text-muted: #8a9ab5;
          --border: rgba(200, 169, 110, 0.2);
          --danger: #e05555;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #060e1e 0%, #0a1628 50%, #0d1e38 100%);
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          position: relative;
          overflow: hidden;
        }

        /* Grid overlay */
        .login-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(200,169,110,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,169,110,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        /* Glow orb */
        .login-page::after {
          content: '';
          position: absolute;
          top: 30%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 500px;
          height: 300px;
          background: radial-gradient(ellipse, rgba(200,169,110,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .login-box {
          background: var(--navy-mid);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 2.75rem 2.5rem;
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 1;
        }

        /* gold top line */
        .login-box::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          border-radius: 2px;
        }

        /* Brand top */
        .brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2.25rem;
        }

        .cheil-logo {
          background: #ffffff;
          border-radius: 7px;
          padding: 0.35rem 0.9rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .cheil-logo svg { height: 24px; width: auto; display: block; }

        .brand-subtitle {
          font-size: 0.7rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--text-muted);
        }

        .login-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          color: var(--text);
          text-align: center;
          margin-bottom: 0.4rem;
        }

        .login-sub {
          font-size: 0.82rem;
          color: var(--text-muted);
          text-align: center;
          margin-bottom: 2rem;
        }

        .error-msg {
          background: rgba(224, 85, 85, 0.1);
          border: 1px solid rgba(224, 85, 85, 0.3);
          color: #ff8a8a;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1.25rem;
          font-size: 0.85rem;
          text-align: center;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .field label {
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
        }

        .form-input {
          width: 100%;
          background: var(--navy-light);
          border: 1px solid var(--border);
          color: var(--text);
          padding: 0.8rem 1rem;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          transition: border-color 0.2s;
          outline: none;
        }
        .form-input::placeholder { color: var(--text-muted); }
        .form-input:focus { border-color: var(--accent); }

        .submit-btn {
          margin-top: 0.5rem;
          width: 100%;
          padding: 0.85rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          background: linear-gradient(135deg, var(--accent), #b8944a);
          color: #0a1628;
          letter-spacing: 0.04em;
          transition: filter 0.2s, transform 0.1s;
        }
        .submit-btn:hover { filter: brightness(1.1); }
        .submit-btn:active { transform: scale(0.99); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .footer-note {
          margin-top: 2rem;
          text-align: center;
          font-size: 0.72rem;
          color: var(--text-muted);
          opacity: 0.7;
        }

        @media (max-width: 480px) {
          .login-box { padding: 2rem 1.5rem; }
        }
      `}</style>

      <div className="login-page">
        <div className="login-box">

          <div className="brand">
            <div className="cheil-logo">
              <svg viewBox="0 0 80 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text
                  x="2" y="22"
                  fontFamily="Arial Black, Arial, sans-serif"
                  fontWeight="900"
                  fontSize="24"
                  fill="#0a0a0a"
                  letterSpacing="-1"
                >Cheil</text>
              </svg>
            </div>
            <span className="brand-subtitle">Reto Técnico Full Stack</span>
          </div>

          <h1 className="login-title">Bienvenido</h1>
          <p className="login-sub">Ingresa tus credenciales para continuar</p>

          {error && <div className="error-msg">{error}</div>}

          <form className="form" onSubmit={handleLogin}>
            <div className="field">
              <label>Usuario</label>
              <input
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                required
                autoComplete="username"
              />
            </div>
            <div className="field">
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>

          <p className="footer-note">© 2026 Cheil Worldwide</p>
        </div>
      </div>
    </>
  );
}
