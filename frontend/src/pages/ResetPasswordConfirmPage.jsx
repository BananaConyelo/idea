import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api';

export default function ResetPasswordConfirmPage() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');
  const [form, setForm] = useState({ new_password: '', new_password2: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!uid || !token) {
      setError('Invalid or missing password reset link.');
      return;
    }

    if (!form.new_password || !form.new_password2) {
      setError('Please fill in both password fields.');
      return;
    }

    if (form.new_password !== form.new_password2) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/password-reset-confirm/', {
        uid,
        token,
        new_password: form.new_password,
        new_password2: form.new_password2,
      });
      setSuccess('Your password has been reset. You can now log in.');
      setForm({ new_password: '', new_password2: '' });
    } catch (err) {
      const data = err.response?.data;
      setError(data?.detail || data?.new_password?.[0] || 'Unable to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__logo">
          <div className="auth-card__logo-icon">🔑</div>
          <h1>Reset your password</h1>
          <p>Enter a new password for your account.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type="password"
              className="form-control"
              placeholder="New password"
              value={form.new_password}
              onChange={e => setForm({ ...form, new_password: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="new-password2">Confirm new password</label>
            <input
              id="new-password2"
              type="password"
              className="form-control"
              placeholder="Confirm new password"
              value={form.new_password2}
              onChange={e => setForm({ ...form, new_password2: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>

        <div className="auth-card__divider" style={{ marginTop: '20px' }}>
          Remembered your password? <Link to="/login" style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
