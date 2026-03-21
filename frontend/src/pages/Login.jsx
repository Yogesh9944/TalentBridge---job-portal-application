import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const defaultRole = searchParams.get('role') || 'seeker';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'recruiter') navigate('/recruiter');
      else navigate('/seeker');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-grid" />
      <div className="auth-noise" />

      <div className="auth-container">
        <Link to="/" className="auth-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to home
        </Link>

        <div className="auth-card animate-scaleIn">
          <div className="auth-logo">
            <span className="logo-mark">TB</span>
            <span className="logo-text">TalentBridge</span>
          </div>

          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">
            Sign in to your {defaultRole === 'recruiter' ? 'recruiter' : 'job seeker'} account
          </p>

          <div className="auth-role-tabs">
            <Link to="/login?role=seeker" className={`role-tab ${defaultRole === 'seeker' ? 'active' : ''}`}>
              Job Seeker
            </Link>
            <Link to="/login?role=recruiter" className={`role-tab ${defaultRole === 'recruiter' ? 'active' : ''}`}>
              Recruiter
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="input-base"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-base"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" className="input-eye" onClick={() => setShowPass(!showPass)}>
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" style={{ marginTop: 8 }} disabled={loading}>
              {loading ? <><span className="spinner dark" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to={`/register?role=${defaultRole}`}>Create one free</Link>
          </p>

          {/* Demo credentials hint */}
          <div className="auth-demo">
            <p>Demo Admin: <code>admin@tb.com</code> / <code>admin123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
