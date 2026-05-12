import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (form.password !== form.password2) {
      setErrors({ password2: 'Passwords do not match.' });
      return;
    }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.password2);
      navigate('/');
    } catch (err) {
      const data = err.response?.data || {};
      setErrors(data);
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label className="form-label" htmlFor={`reg-${key}`}>{label}</label>
      <input
        id={`reg-${key}`}
        type={type}
        className="form-control"
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        required
      />
      {errors[key] && <span className="form-error">{Array.isArray(errors[key]) ? errors[key][0] : errors[key]}</span>}
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__logo">
          <div className="auth-card__logo-icon">✨</div>
          <h1>Create account</h1>
          <p>Join thousands of innovators on IdeaValidator</p>
        </div>

        {errors.non_field_errors && <div className="alert alert-error">{errors.non_field_errors}</div>}

        <form onSubmit={handleSubmit}>
          {field('username', 'Username', 'text', 'Choose a username')}
          {field('email', 'Email', 'email', 'your@email.com')}
          {field('password', 'Password', 'password', 'Create a strong password')}
          {field('password2', 'Confirm Password', 'password', 'Repeat your password')}

          <button id="register-submit" type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-card__divider" style={{ marginTop: '20px' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
