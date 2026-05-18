'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

interface InvoiceItem {
  id: number;
  productName: string;
  productCategory: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
}

interface Invoice {
  id: number;
  number: string;
  total: string;
  notes: string | null;
  createdAt: string;
  customer: { id: number; name: string; email: string; phone?: string };
  issuedBy: { id: number; username: string };
  items: InvoiceItem[];
}

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data);
    } catch {
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const handleDownload = async (id: number, number: string) => {
    setDownloading(id);
    try {
      const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `boleta-${number}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Error al descargar PDF');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root {
          --navy: #0a1628; --navy-mid: #0f2040; --accent: #c8a96e;
          --text: #e8edf5; --text-muted: #8a9ab5; --border: rgba(200,169,110,0.2);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a1628; }
        .page { min-height: 100vh; background: linear-gradient(135deg,#060e1e,#0a1628,#0d1e38); font-family: 'DM Sans',sans-serif; color: var(--text); }
        .navbar { display:flex; justify-content:space-between; align-items:center; padding:1.25rem 2.5rem; border-bottom:1px solid var(--border); background:rgba(10,22,40,0.8); backdrop-filter:blur(12px); position:sticky; top:0; z-index:10; }
        .navbar-left { display:flex; align-items:center; gap:1.25rem; }
        .cheil-logo { background:#fff; border-radius:6px; padding:0.3rem 0.75rem; }
        .cheil-logo svg { height:22px; width:auto; display:block; }
        .nav-divider { width:1px; height:28px; background:var(--border); }
        .nav-title { font-size:0.8rem; font-weight:500; text-transform:uppercase; letter-spacing:0.15em; color:var(--text-muted); }
        .back-btn { background:transparent; border:1px solid var(--border); color:var(--text-muted); padding:0.45rem 1.1rem; border-radius:6px; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:0.85rem; transition:all 0.2s; }
        .back-btn:hover { border-color:var(--accent); color:var(--accent); }
        .content { max-width:1100px; margin:0 auto; padding:2.5rem 1.5rem; }
        .page-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:2rem; }
        .page-title { font-family:'Playfair Display',serif; font-size:2rem; color:var(--text); }
        .page-title span { color:var(--accent); }
        .new-btn { background:linear-gradient(135deg,#c8a96e,#a8863e); color:#0a1628; padding:0.6rem 1.4rem; border:none; border-radius:8px; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:0.9rem; font-weight:600; transition:opacity 0.2s; }
        .new-btn:hover { opacity:0.85; }
        .table-wrap { background:var(--navy-mid); border:1px solid var(--border); border-radius:14px; overflow:hidden; }
        table { width:100%; border-collapse:collapse; }
        thead { background:rgba(200,169,110,0.07); }
        th { padding:1rem 1.25rem; text-align:left; font-size:0.72rem; font-weight:600; text-transform:uppercase; letter-spacing:0.12em; color:var(--accent); border-bottom:1px solid var(--border); }
        td { padding:1rem 1.25rem; font-size:0.88rem; border-bottom:1px solid rgba(200,169,110,0.07); color:var(--text); vertical-align:middle; }
        tr:last-child td { border-bottom:none; }
        tr:hover td { background:rgba(200,169,110,0.03); }
        .badge { display:inline-block; padding:0.2rem 0.6rem; border-radius:20px; font-size:0.75rem; font-weight:500; }
        .badge-gold { background:rgba(200,169,110,0.15); color:var(--accent); border:1px solid rgba(200,169,110,0.25); }
        .download-btn { background:transparent; border:1px solid var(--border); color:var(--text-muted); padding:0.35rem 0.9rem; border-radius:6px; cursor:pointer; font-size:0.8rem; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
        .download-btn:hover { border-color:var(--accent); color:var(--accent); }
        .download-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .empty { text-align:center; padding:4rem; color:var(--text-muted); }
        .empty-icon { font-size:3rem; margin-bottom:1rem; }
        .loading { text-align:center; padding:4rem; color:var(--text-muted); }
        @media (max-width:640px) { .navbar { padding:1rem 1.25rem; } .nav-title { display:none; } .content { padding:1.5rem 1rem; } .page-header { flex-direction:column; gap:1rem; align-items:flex-start; } }
      `}</style>

      <div className="page">
        <nav className="navbar">
          <div className="navbar-left">
            <div className="cheil-logo">
              <svg viewBox="0 0 80 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="2" y="22" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="24" fill="#0a0a0a" letterSpacing="-1">Cheil</text>
              </svg>
            </div>
            <div className="nav-divider" />
            <span className="nav-title">Boletas</span>
          </div>
          <button className="back-btn" onClick={() => router.push('/dashboard')}>← Volver</button>
        </nav>

        <div className="content">
          <div className="page-header">
            <h1 className="page-title">Boletas de <span>Venta</span></h1>
            <button className="new-btn" onClick={() => router.push('/dashboard/invoices/new')}>+ Nueva Boleta</button>
          </div>

          <div className="table-wrap">
            {loading ? (
              <div className="loading">Cargando boletas...</div>
            ) : invoices.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">🧾</div>
                <p>No hay boletas registradas</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>N° Boleta</th>
                    <th>Cliente</th>
                    <th>Emitido por</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Fecha</th>
                    <th>PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td><span className="badge badge-gold">{inv.number}</span></td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{inv.customer.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.customer.email}</div>
                      </td>
                      <td>{inv.issuedBy.username}</td>
                      <td>{inv.items.length} producto{inv.items.length !== 1 ? 's' : ''}</td>
                      <td style={{ color: 'var(--accent)', fontWeight: 600 }}>S/ {Number(inv.total).toFixed(2)}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{new Date(inv.createdAt).toLocaleDateString('es-PE')}</td>
                      <td>
                        <button
                          className="download-btn"
                          disabled={downloading === inv.id}
                          onClick={() => handleDownload(inv.id, inv.number)}
                        >
                          {downloading === inv.id ? '...' : '⬇ PDF'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}