import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lightbulb } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResetSent(false);
    if (!forgotEmail) {
      setError('Please enter your email address to reset your password.');
      return;
    }

    try {
      await api.post('/auth/password-reset/', { email: forgotEmail });
      setResetSent(true);
    } catch (err) {
      setError(err.response?.data?.email?.[0] || 'Unable to send reset email. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__logo">
          <div className="auth-card__logo-icon"><Lightbulb size={28} /></div>
          <h1>Welcome back</h1>
          <p>Sign in to your IdeaValidator account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">Username</label>
            <input
              id="login-username"
              className="form-control"
              placeholder="Enter your username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button id="login-submit" type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <button
            type="button"
            className="btn btn-link"
            style={{ marginTop: '12px', width: '100%', textAlign: 'center' }}
            onClick={() => navigate('/reset-password')}
          >
            Forgot password?
          </button>
        </form>

        <div className="auth-card__divider" style={{ marginTop: '20px' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}
