'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

interface Product {
  id: number;
  name: string;
  price: string;
  category: { name: string };
}

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/products?page=1&limit=100').then((res) => setProducts(res.data.data)).catch(() => router.push('/'));
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) return prev.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId: product.id, name: product.name, price: Number(product.price), quantity: 1 }];
    });
  };

  const updateQty = (productId: number, qty: number) => {
    if (qty < 1) return removeFromCart(productId);
    setCart((prev) => prev.map((i) => i.productId === productId ? { ...i, quantity: qty } : i));
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const total = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const handleSubmit = async () => {
    setError('');
    if (!customer.name || !customer.email) return setError('Nombre y email del cliente son requeridos');
    if (cart.length === 0) return setError('Agrega al menos un producto');
    setLoading(true);
    try {
      const customerRes = await api.post('/customers', customer);
      await api.post('/invoices', {
        customerId: customerRes.data.id,
        issuedById: 1,
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        notes,
      });
      alert('¡Boleta generada y enviada por email!');
      router.push('/dashboard/invoices');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al generar la boleta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root { --navy:#0a1628; --navy-mid:#0f2040; --accent:#c8a96e; --text:#e8edf5; --text-muted:#8a9ab5; --border:rgba(200,169,110,0.2); }
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#0a1628; }
        .page { min-height:100vh; background:linear-gradient(135deg,#060e1e,#0a1628,#0d1e38); font-family:'DM Sans',sans-serif; color:var(--text); }
        .navbar { display:flex; justify-content:space-between; align-items:center; padding:1.25rem 2.5rem; border-bottom:1px solid var(--border); background:rgba(10,22,40,0.8); backdrop-filter:blur(12px); position:sticky; top:0; z-index:10; }
        .navbar-left { display:flex; align-items:center; gap:1.25rem; }
        .cheil-logo { background:#fff; border-radius:6px; padding:0.3rem 0.75rem; }
        .cheil-logo svg { height:22px; width:auto; display:block; }
        .nav-divider { width:1px; height:28px; background:var(--border); }
        .nav-title { font-size:0.8rem; font-weight:500; text-transform:uppercase; letter-spacing:0.15em; color:var(--text-muted); }
        .back-btn { background:transparent; border:1px solid var(--border); color:var(--text-muted); padding:0.45rem 1.1rem; border-radius:6px; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:0.85rem; transition:all 0.2s; }
        .back-btn:hover { border-color:var(--accent); color:var(--accent); }
        .content { max-width:1100px; margin:0 auto; padding:2.5rem 1.5rem; }
        .page-title { font-family:'Playfair Display',serif; font-size:2rem; color:var(--text); margin-bottom:2rem; }
        .page-title span { color:var(--accent); }
        .layout { display:grid; grid-template-columns:1fr 380px; gap:1.5rem; }
        @media (max-width:860px) { .layout { grid-template-columns:1fr; } }
        .card { background:var(--navy-mid); border:1px solid var(--border); border-radius:14px; padding:1.75rem; margin-bottom:1.5rem; }
        .card-title { font-family:'Playfair Display',serif; font-size:1.1rem; color:var(--text); margin-bottom:1.25rem; padding-bottom:0.75rem; border-bottom:1px solid var(--border); }
        .field { margin-bottom:1rem; }
        label { display:block; font-size:0.72rem; font-weight:600; text-transform:uppercase; letter-spacing:0.12em; color:var(--accent); margin-bottom:0.4rem; }
        input, textarea { width:100%; background:rgba(255,255,255,0.04); border:1px solid var(--border); border-radius:8px; padding:0.65rem 0.9rem; color:var(--text); font-family:'DM Sans',sans-serif; font-size:0.9rem; outline:none; transition:border-color 0.2s; }
        input:focus, textarea:focus { border-color:var(--accent); }
        .products-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:1rem; }
        .product-card { background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:10px; padding:1rem; cursor:pointer; transition:all 0.2s; }
        .product-card:hover { border-color:var(--accent); background:rgba(200,169,110,0.05); }
        .product-name { font-weight:500; font-size:0.9rem; margin-bottom:0.25rem; }
        .product-cat { font-size:0.75rem; color:var(--text-muted); margin-bottom:0.5rem; }
        .product-price { color:var(--accent); font-weight:600; font-size:0.95rem; }
        .add-btn { width:100%; margin-top:0.75rem; background:rgba(200,169,110,0.1); border:1px solid rgba(200,169,110,0.25); color:var(--accent); padding:0.4rem; border-radius:6px; cursor:pointer; font-size:0.8rem; transition:all 0.2s; }
        .add-btn:hover { background:rgba(200,169,110,0.2); }
        .cart-item { display:flex; justify-content:space-between; align-items:center; padding:0.75rem 0; border-bottom:1px solid rgba(200,169,110,0.07); }
        .cart-item:last-child { border-bottom:none; }
        .cart-name { font-size:0.85rem; font-weight:500; }
        .cart-price { font-size:0.75rem; color:var(--text-muted); }
        .qty-controls { display:flex; align-items:center; gap:0.5rem; }
        .qty-btn { background:rgba(255,255,255,0.06); border:1px solid var(--border); color:var(--text); width:26px; height:26px; border-radius:5px; cursor:pointer; font-size:0.9rem; display:flex; align-items:center; justify-content:center; }
        .qty-num { font-size:0.85rem; min-width:20px; text-align:center; }
        .remove-btn { background:transparent; border:none; color:#e07070; cursor:pointer; font-size:0.85rem; margin-left:0.5rem; }
        .total-row { display:flex; justify-content:space-between; align-items:center; padding:1rem 0 0; margin-top:0.5rem; border-top:1px solid var(--border); }
        .total-label { font-size:0.85rem; color:var(--text-muted); }
        .total-amount { font-family:'Playfair Display',serif; font-size:1.5rem; color:var(--accent); }
        .submit-btn { width:100%; background:linear-gradient(135deg,#c8a96e,#a8863e); color:#0a1628; padding:0.85rem; border:none; border-radius:8px; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:1rem; font-weight:700; transition:opacity 0.2s; margin-top:1rem; }
        .submit-btn:hover { opacity:0.88; }
        .submit-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .error { background:rgba(224,85,85,0.1); border:1px solid rgba(224,85,85,0.3); color:#ff9a9a; padding:0.75rem 1rem; border-radius:8px; font-size:0.85rem; margin-bottom:1rem; }
        .empty-cart { text-align:center; padding:2rem; color:var(--text-muted); font-size:0.85rem; }
        @media (max-width:640px) { .navbar { padding:1rem 1.25rem; } .nav-title { display:none; } .content { padding:1.5rem 1rem; } }
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
            <span className="nav-title">Nueva Boleta</span>
          </div>
          <button className="back-btn" onClick={() => router.push('/dashboard/invoices')}>← Volver</button>
        </nav>

        <div className="content">
          <h1 className="page-title">Nueva <span>Boleta</span></h1>

          {error && <div className="error">{error}</div>}

          <div className="layout">
            <div>
              <div className="card">
                <h2 className="card-title">Datos del Cliente</h2>
                <div className="field">
                  <label>Nombre *</label>
                  <input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Juan Pérez" />
                </div>
                <div className="field">
                  <label>Email *</label>
                  <input type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} placeholder="juan@email.com" />
                </div>
                <div className="field">
                  <label>Teléfono</label>
                  <input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="999 999 999" />
                </div>
                <div className="field">
                  <label>Notas</label>
                  <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observaciones opcionales..." />
                </div>
              </div>

              <div className="card">
                <h2 className="card-title">Seleccionar Productos</h2>
                <div className="products-grid">
                  {products.map((p) => (
                    <div className="product-card" key={p.id}>
                      <div className="product-name">{p.name}</div>
                      <div className="product-cat">{p.category.name}</div>
                      <div className="product-price">S/ {Number(p.price).toFixed(2)}</div>
                      <button className="add-btn" onClick={() => addToCart(p)}>+ Agregar</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="card" style={{ position: 'sticky', top: '90px' }}>
                <h2 className="card-title">Resumen</h2>
                {cart.length === 0 ? (
                  <div className="empty-cart">🛒 Sin productos aún</div>
                ) : (
                  cart.map((item) => (
                    <div className="cart-item" key={item.productId}>
                      <div>
                        <div className="cart-name">{item.name}</div>
                        <div className="cart-price">S/ {item.price.toFixed(2)} c/u</div>
                      </div>
                      <div className="qty-controls">
                        <button className="qty-btn" onClick={() => updateQty(item.productId, item.quantity - 1)}>−</button>
                        <span className="qty-num">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQty(item.productId, item.quantity + 1)}>+</button>
                        <button className="remove-btn" onClick={() => removeFromCart(item.productId)}>✕</button>
                      </div>
                    </div>
                  ))
                )}
                <div className="total-row">
                  <span className="total-label">Total</span>
                  <span className="total-amount">S/ {total.toFixed(2)}</span>
                </div>
                <button className="submit-btn" disabled={loading} onClick={handleSubmit}>
                  {loading ? 'Generando...' : '🧾 Generar Boleta'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}