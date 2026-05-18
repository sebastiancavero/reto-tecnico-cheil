'use client';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

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

        .dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #060e1e 0%, #0a1628 50%, #0d1e38 100%);
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
          display: flex;
          flex-direction: column;
        }

        /* ── Navbar ── */
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 2.5rem;
          border-bottom: 1px solid var(--border);
          background: rgba(10, 22, 40, 0.8);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        /* Cheil logo — black on white pill */
        .cheil-logo {
          background: #ffffff;
          border-radius: 6px;
          padding: 0.3rem 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cheil-logo svg {
          height: 22px;
          width: auto;
          display: block;
        }

        .nav-divider {
          width: 1px;
          height: 28px;
          background: var(--border);
        }

        .nav-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--text-muted);
        }

        .logout-btn {
          background: transparent;
          border: 1px solid rgba(224, 85, 85, 0.35);
          color: #e07070;
          padding: 0.45rem 1.1rem;
          border-radius: 6px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        .logout-btn:hover {
          background: rgba(224, 85, 85, 0.12);
          border-color: var(--danger);
          color: #ff9a9a;
        }

        /* ── Hero ── */
        .hero {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 1.5rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        /* subtle grid overlay */
        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(200,169,110,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,169,110,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        /* glowing orb */
        .hero::after {
          content: '';
          position: absolute;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 300px;
          background: radial-gradient(ellipse, rgba(200,169,110,0.07) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-eyebrow {
          font-size: 0.72rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: var(--accent);
          margin-bottom: 1.25rem;
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .hero-eyebrow::before,
        .hero-eyebrow::after {
          content: '';
          width: 40px;
          height: 1px;
          background: var(--accent);
          opacity: 0.5;
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 700;
          color: var(--text);
          line-height: 1.15;
          margin-bottom: 0.75rem;
          position: relative;
        }

        .hero-title span {
          color: var(--accent);
        }

        .hero-subtitle {
          font-size: 1rem;
          color: var(--text-muted);
          font-weight: 300;
          margin-bottom: 3.5rem;
          position: relative;
          max-width: 420px;
        }

        /* ── Cards ── */
        .cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          max-width: 640px;
          width: 100%;
          position: relative;
        }

        @media (max-width: 720px) {
          .cards-grid { grid-template-columns: 1fr !important; max-width: 340px; }
        }

        .module-card {
          background: var(--navy-mid);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 2rem 1.75rem;
          cursor: pointer;
          transition: transform 0.22s, border-color 0.22s, box-shadow 0.22s;
          text-align: left;
          position: relative;
          overflow: hidden;
        }

        .module-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          opacity: 0;
          transition: opacity 0.22s;
        }

        .module-card:hover {
          transform: translateY(-4px);
          border-color: rgba(200, 169, 110, 0.45);
          box-shadow: 0 20px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(200,169,110,0.1);
        }

        .module-card:hover::before { opacity: 1; }

        .card-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          background: rgba(200, 169, 110, 0.1);
          border: 1px solid rgba(200, 169, 110, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          margin-bottom: 1.25rem;
        }

        .card-label {
          font-size: 0.68rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--accent);
          margin-bottom: 0.4rem;
        }

        .card-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem;
          color: var(--text);
          margin-bottom: 0.5rem;
        }

        .card-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .card-arrow {
          position: absolute;
          bottom: 1.5rem;
          right: 1.5rem;
          color: var(--accent);
          opacity: 0;
          transition: opacity 0.2s, transform 0.2s;
          font-size: 1.1rem;
        }

        .module-card:hover .card-arrow {
          opacity: 1;
          transform: translateX(3px);
        }

        /* ── Footer ── */
        .footer {
          padding: 1.5rem 2.5rem;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        @media (max-width: 520px) {
          .footer { flex-direction: column; gap: 0.4rem; text-align: center; padding: 1rem; }
        }
      `}</style>

      <div className="dashboard">

        {/* Navbar */}
        <nav className="navbar">
          <div className="navbar-left">
            {/* Cheil logo — reconstructed as inline SVG text */}
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
            <div className="nav-divider" />
            <span className="nav-title">Reto Técnico</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </nav>

        {/* Hero */}
        <main className="hero">
          <p className="hero-eyebrow">Panel de Control</p>
          <h1 className="hero-title">
            Reto Técnico<br /><span>Cheil</span>
          </h1>
          <p className="hero-subtitle">
            Gestiona el catálogo de productos y categorías desde un solo lugar.
          </p>

          <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: '960px' }}>
            <div className="module-card" onClick={() => router.push('/dashboard/categories')}>
              <div className="card-icon">🏷️</div>
              <p className="card-label">Módulo</p>
              <h2 className="card-name">Categorías</h2>
              <p className="card-desc">Crear, editar y eliminar categorías del catálogo.</p>
              <span className="card-arrow">→</span>
            </div>

            <div className="module-card" onClick={() => router.push('/dashboard/products')}>
              <div className="card-icon">📦</div>
              <p className="card-label">Módulo</p>
              <h2 className="card-name">Productos</h2>
              <p className="card-desc">Administrar el inventario con imágenes y precios.</p>
              <span className="card-arrow">→</span>
            </div>

            <div className="module-card" onClick={() => router.push('/dashboard/invoices')}>
              <div className="card-icon">🧾</div>
              <p className="card-label">Módulo</p>
              <h2 className="card-name">Boletas</h2>
              <p className="card-desc">Generar boletas de venta y descargar PDF.</p>
              <span className="card-arrow">→</span>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="footer">
          <span>© 2026 Cheil Worldwide — Reto Técnico Full Stack</span>
          <span>AWS · NestJS · Next.js · SQL Server</span>
        </footer>

      </div>
    </>
  );
}
