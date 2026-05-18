'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

interface Category {
  id: number;
  name: string;
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch {
      router.push('/');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, { name });
      } else {
        await api.post('/categories', { name });
      }
      setName('');
      setEditingId(null);
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch {
      setError('Error al eliminar');
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

        .page {
          min-height: 100vh;
          background: linear-gradient(135deg, #060e1e 0%, #0a1628 50%, #0d1e38 100%);
          padding: 2rem 1rem;
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
        }

        .container { max-width: 760px; margin: 0 auto; }

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

        .form-row {
          display: flex;
          gap: 0.75rem;
        }

        .form-input {
          flex: 1;
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
        .form-input:focus { border-color: var(--accent); }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--accent), #b8944a);
          color: #0a1628;
        }
        .btn-primary:hover { filter: brightness(1.1); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-secondary {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
        }
        .btn-secondary:hover { border-color: var(--text-muted); color: var(--text); }

        @media (max-width: 520px) {
          .form-row { flex-direction: column; }
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

        .id-badge {
          background: rgba(255,255,255,0.05);
          color: var(--text-muted);
          padding: 0.2rem 0.65rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-family: monospace;
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
      `}</style>

      <div className="page">
        <div className="container">

          <div className="header">
            <h1>Gestión de Categorías</h1>
            <button className="back-btn" onClick={() => router.push('/dashboard')}>
              ← Dashboard
            </button>
          </div>

          <div className="card">
            <h2 className="card-title">{editingId ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Nombre de la categoría"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  required
                  maxLength={100}
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => { setEditingId(null); setName(''); }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id}>
                      <td><span className="id-badge">#{cat.id}</span></td>
                      <td style={{ fontWeight: 500 }}>{cat.name}</td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-edit" onClick={() => handleEdit(cat)}>Editar</button>
                          <button className="btn-delete" onClick={() => handleDelete(cat.id)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={3}>
                        <div className="empty-state">No hay categorías registradas</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
