'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  categoryId: number;
  imageUrl?: string;
  category: Category;
}

interface Pagination {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ProductsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
  });

  const fetchProducts = async (p = page) => {
    try {
      const res = await api.get(`/products?page=${p}&limit=5`);
      setPagination(res.data);
    } catch {
      router.push('/');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        categoryId: parseInt(form.categoryId),
      };

      let productId = editingId;

      if (editingId) {
        await api.put(`/products/${editingId}`, data);
      } else {
        const res = await api.post('/products', data);
        productId = res.data.id;
      }

      if (imageFile && productId) {
        const formData = new FormData();
        formData.append('file', imageFile);
        await api.post(`/products/${productId}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setForm({ name: '', description: '', price: '', stock: '', categoryId: '' });
      setEditingId(null);
      setImageFile(null);
      setImagePreview(null);
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: String(product.stock),
      categoryId: String(product.categoryId),
    });
    setImagePreview(product.imageUrl || null);
    setImageFile(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch {
      setError('Error al eliminar');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ name: '', description: '', price: '', stock: '', categoryId: '' });
    setImageFile(null);
    setImagePreview(null);
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

        .page {
          min-height: 100vh;
          background: linear-gradient(135deg, #060e1e 0%, #0a1628 50%, #0d1e38 100%);
          padding: 2rem 1rem;
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
        }

        .container { max-width: 1100px; margin: 0 auto; }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .header h1 {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          color: var(--accent);
        }

        .back-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
          padding: 0.5rem 1.25rem;
          border-radius: 6px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .back-btn:hover { border-color: var(--accent); color: var(--accent); }

        .card {
          background: var(--navy-mid);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          color: var(--accent);
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border);
        }

        .error-msg {
          background: rgba(224, 85, 85, 0.1);
          border: 1px solid rgba(224, 85, 85, 0.3);
          color: #ff8a8a;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          margin-bottom: 1.25rem;
          font-size: 0.875rem;
        }

        /* Desktop: image LEFT, fields RIGHT */
        .form-body {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
        }

        /* ── Image panel ── */
        .image-panel {
          flex: 0 0 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.6rem;
        }

        .image-square {
          width: 200px;
          height: 200px;
          border-radius: 10px;
          border: 2px dashed var(--border);
          overflow: hidden;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          background: var(--navy-light);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 0.5rem;
          position: relative;
        }

        .image-square:hover { border-color: var(--accent); }

        .image-square img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .img-overlay {
          position: absolute;
          inset: 0;
          background: rgba(10, 22, 40, 0.72);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .image-square:hover .img-overlay { opacity: 1; }

        .img-overlay-icon { font-size: 1.6rem; }
        .img-overlay-text { color: var(--accent); font-size: 0.78rem; font-weight: 500; }

        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          pointer-events: none;
        }
        .upload-icon { font-size: 2rem; opacity: 0.5; }
        .upload-label { color: var(--accent); font-size: 0.82rem; font-weight: 500; }
        .upload-sub { color: var(--text-muted); font-size: 0.74rem; }

        .change-hint { color: var(--text-muted); font-size: 0.72rem; text-align: center; }

        /* ── Fields panel ── */
        .fields-panel {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .col-span-2 { grid-column: 1 / -1; }

        .form-input, .form-select {
          width: 100%;
          background: var(--navy-light);
          border: 1px solid var(--border);
          color: var(--text);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          transition: border-color 0.2s;
          outline: none;
        }
        .form-input::placeholder { color: var(--text-muted); }
        .form-input:focus, .form-select:focus { border-color: var(--accent); }
        .form-select option { background: var(--navy-mid); }

        .btn-row { display: flex; gap: 0.75rem; grid-column: 1 / -1; }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        .btn-primary {
          background: linear-gradient(135deg, var(--accent), #b8944a);
          color: #0a1628;
          flex: 1;
        }
        .btn-primary:hover { filter: brightness(1.1); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-secondary {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
        }
        .btn-secondary:hover { border-color: var(--text-muted); color: var(--text); }

        /* Mobile: fields on top, image square below */
        @media (max-width: 640px) {
          .form-body { flex-direction: column-reverse; gap: 1.25rem; }

          .image-panel { flex: none; width: 100%; }

          .image-square {
            width: 100%;
            max-width: 100%;
            height: 0;
            padding-bottom: 100%; /* keeps it square */
            position: relative;
          }

          .image-square img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
          }

          .img-overlay { position: absolute; inset: 0; }

          .upload-placeholder {
            position: absolute;
            inset: 0;
            justify-content: center;
          }

          .fields-panel { grid-template-columns: 1fr; width: 100%; }
          .header h1 { font-size: 1.5rem; }
          .card { padding: 1.25rem; }
        }

        /* Table */
        .table-wrapper { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        thead tr { background: var(--navy-light); }
        th {
          padding: 1rem 1.25rem;
          text-align: left;
          font-size: 0.73rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--accent);
        }
        td {
          padding: 1rem 1.25rem;
          border-top: 1px solid var(--border);
          font-size: 0.9rem;
          vertical-align: middle;
        }

        .product-img {
          width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid var(--border);
          display: block;
        }
        .no-img {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          background: var(--navy-light);
          border: 1px dashed var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }
        .price-badge {
          background: rgba(200, 169, 110, 0.1);
          color: var(--accent);
          padding: 0.2rem 0.65rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          white-space: nowrap;
        }
        .cat-badge {
          background: rgba(255,255,255,0.05);
          color: var(--text-muted);
          padding: 0.2rem 0.65rem;
          border-radius: 20px;
          font-size: 0.8rem;
          white-space: nowrap;
        }
        .action-btns { display: flex; gap: 0.5rem; }
        .btn-edit {
          background: rgba(200, 169, 110, 0.1);
          border: 1px solid rgba(200, 169, 110, 0.3);
          color: var(--accent);
          padding: 0.35rem 0.85rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .btn-edit:hover { background: rgba(200, 169, 110, 0.2); }
        .btn-delete {
          background: rgba(224, 85, 85, 0.08);
          border: 1px solid rgba(224, 85, 85, 0.25);
          color: var(--danger);
          padding: 0.35rem 0.85rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .btn-delete:hover { background: rgba(224, 85, 85, 0.18); }
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .pagination {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          padding: 1.5rem;
          border-top: 1px solid var(--border);
        }
        .page-btn {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .page-btn:hover { border-color: var(--accent); color: var(--accent); }
        .page-btn.active {
          background: var(--accent);
          border-color: var(--accent);
          color: #0a1628;
          font-weight: 600;
        }
      `}</style>

      <div className="page">
        <div className="container">

          <div className="header">
            <h1>Gestión de Productos</h1>
            <button className="back-btn" onClick={() => router.push('/dashboard')}>
              ← Dashboard
            </button>
          </div>

          <div className="card">
            <h2 className="card-title">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-body">

                {/* LEFT: image square */}
                <div className="image-panel">
                  <div className="image-square" onClick={() => fileInputRef.current?.click()}>
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="preview" />
                        <div className="img-overlay">
                          <span className="img-overlay-icon">📷</span>
                          <span className="img-overlay-text">Cambiar imagen</span>
                        </div>
                      </>
                    ) : (
                      <div className="upload-placeholder">
                        <span className="upload-icon">📷</span>
                        <span className="upload-label">Subir imagen</span>
                        <span className="upload-sub">opcional</span>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageChange}
                    />
                  </div>
                  {imagePreview && <p className="change-hint">Click para cambiar</p>}
                </div>

                {/* RIGHT: fields */}
                <div className="fields-panel">
                  <input
                    type="text"
                    placeholder="Nombre del producto"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="form-input col-span-2"
                    required
                    maxLength={255}
                  />
                  <input
                    type="text"
                    placeholder="Descripción"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="form-input col-span-2"
                    maxLength={500}
                  />
                  <input
                    type="number"
                    placeholder="Precio"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="form-input"
                    required
                    min={0}
                    step={0.01}
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="form-input"
                    required
                    min={0}
                  />
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="form-select col-span-2"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>

                  <div className="btn-row">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Producto'}
                    </button>
                    {editingId && (
                      <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </form>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Categoría</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagination?.data.map((product) => (
                    <tr key={product.id}>
                      <td>
                        {product.imageUrl
                          ? <img src={product.imageUrl} alt={product.name} className="product-img" />
                          : <div className="no-img">📦</div>
                        }
                      </td>
                      <td style={{ fontWeight: 500 }}>{product.name}</td>
                      <td><span className="price-badge">${product.price}</span></td>
                      <td>{product.stock}</td>
                      <td><span className="cat-badge">{product.category.name}</span></td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-edit" onClick={() => handleEdit(product)}>Editar</button>
                          <button className="btn-delete" onClick={() => handleDelete(product.id)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pagination?.data.length === 0 && (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-state">No hay productos registrados</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {pagination && pagination.totalPages > 1 && (
              <div className="pagination">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`page-btn ${page === p ? 'active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
