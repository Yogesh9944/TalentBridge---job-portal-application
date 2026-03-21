import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const defaultRole = searchParams.get('role') || 'seeker';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: defaultRole
  });

  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const data = await register(
        form.name,
        form.email,
        form.password,
        form.role
      );

      if (data.user.role === 'recruiter') {
        toast.success('Account created! Awaiting admin approval.');
        navigate('/recruiter');
      } else {
        toast.success(`Welcome to TalentBridge, ${data.user.name}!`);
        navigate('/seeker');
      }

    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      
      {/* 🔥 FIX: Prevent overlay blocking clicks */}
      <div className="auth-grid" style={{ pointerEvents: 'none' }} />
      <div className="auth-noise" style={{ pointerEvents: 'none' }} />

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

          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">
            Join thousands of professionals on TalentBridge
          </p>

          {/* Role Selector */}
          <div className="role-selector">
            <button
              type="button"
              className={`role-selector__btn ${form.role === 'seeker' ? 'active' : ''}`}
              onClick={() => setForm({ ...form, role: 'seeker' })}
            >
              Job Seeker
            </button>

            <button
              type="button"
              className={`role-selector__btn ${form.role === 'recruiter' ? 'active' : ''}`}
              onClick={() => setForm({ ...form, role: 'recruiter' })}
            >
              Recruiter
            </button>
          </div>

          {form.role === 'recruiter' && (
            <div className="auth-notice">
              Recruiter accounts require admin approval before posting jobs.
            </div>
          )}

          {/* ✅ FORM */}
          <form onSubmit={handleSubmit} className="auth-form">
            
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="input-base"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="input-base"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-base"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />

                <button
                  type="button"
                  className="input-eye"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to={`/login?role=${form.role}`}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
