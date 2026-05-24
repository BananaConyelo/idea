import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Lightbulb, Lock, Unlock } from 'lucide-react';

const CATEGORIES = ['tech','health','finance','education','environment','social','entertainment','ecommerce','other'];

export default function EditIdeaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ title: '', description: '', category: 'tech', is_public: true });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        const { data } = await api.get(`/ideas/${id}/`);
        if (data.owner?.username !== user?.username) {
          navigate(`/ideas/${id}`, { replace: true });
          return;
        }
        setForm({
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'tech',
          is_public: data.is_public ?? true,
        });
      } catch (err) {
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchIdea();
  }, [id, navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      await api.patch(`/ideas/${id}/`, form);
      navigate(`/ideas/${id}`);
    } catch (err) {
      setErrors(err.response?.data || {});
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '680px', paddingTop: '40px' }}>
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Lightbulb size={24} color="var(--accent-light)" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Edit Idea</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Update your idea and save your changes to the community.</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="idea-title">Idea Title *</label>
              <input
                id="idea-title"
                className="form-control"
                placeholder="A catchy, descriptive title..."
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                maxLength={200}
                required
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="idea-desc">Description *</label>
              <textarea
                id="idea-desc"
                className="form-control"
                placeholder="Describe your startup idea in detail. What problem does it solve? Who is the target audience? What makes it unique?"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={7}
                required
              />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="idea-category">Category *</label>
              <select
                id="idea-category"
                className="form-control"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Visibility</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  id="visibility-public"
                  className={`btn ${form.is_public ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setForm({ ...form, is_public: true })}
                >
                  <Unlock size={15} /> Public
                </button>
                <button
                  type="button"
                  id="visibility-private"
                  className={`btn ${!form.is_public ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setForm({ ...form, is_public: false })}
                >
                  <Lock size={15} /> Private
                </button>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                {form.is_public ? 'Your idea will be visible to everyone.' : 'Only you can see this idea.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button id="edit-idea-submit" type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1 }}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(`/ideas/${id}`)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
