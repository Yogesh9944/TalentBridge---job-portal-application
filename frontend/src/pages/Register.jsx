import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();

  const roleFromUrl = searchParams.get('role') || 'seeker';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: roleFromUrl,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Handle Submit (NO FORM SUBMIT)
  const handleRegister = async () => {
    console.log("🔥 BUTTON CLICKED");

    if (!formData.name || !formData.email || !formData.password) {
      toast.error('All fields are required');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setIsLoading(true);

      const response = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role
      );

      console.log("✅ API RESPONSE:", response);

      if (response.user.role === 'recruiter') {
        toast.success('Account created! Awaiting approval.');
        navigate('/recruiter');
      } else {
        toast.success(`Welcome ${response.user.name}!`);
        navigate('/seeker');
      }

    } catch (error) {
      console.error("❌ ERROR:", error);
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* ✅ FIX: Prevent click blocking */}
      <div className="auth-grid" style={{ pointerEvents: 'none' }} />
      <div className="auth-noise" style={{ pointerEvents: 'none' }} />

      <div className="auth-container">
        <Link to="/" className="auth-back">
          ← Back to Home
        </Link>

        <div className="auth-card">
          <h1 className="auth-title">Create Account</h1>

          {/* Role Selector */}
          <div className="role-selector">
            <button
              type="button"
              className={formData.role === 'seeker' ? 'active' : ''}
              onClick={() => setFormData({ ...formData, role: 'seeker' })}
            >
              Job Seeker
            </button>

            <button
              type="button"
              className={formData.role === 'recruiter' ? 'active' : ''}
              onClick={() => setFormData({ ...formData, role: 'recruiter' })}
            >
              Recruiter
            </button>
          </div>

          {/* FORM (DIV BASED) */}
          <div className="auth-form">

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="input-base"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="input-base"
            />

            <div className="input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="input-base"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <button
              type="button"
              onClick={handleRegister}
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>

          </div>

          <p>
            Already have an account?{' '}
            <Link to={`/login?role=${formData.role}`}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
