import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const TICKER_ITEMS = [
  'React Developer', 'UI/UX Designer', 'Data Scientist', 'Product Manager',
  'Backend Engineer', 'DevOps Engineer', 'Mobile Developer', 'ML Engineer',
  'Full Stack Dev', 'Cloud Architect', 'QA Engineer', 'Blockchain Dev',
];

const STATS = [
  { value: '10K+', label: 'Active Jobs' },
  { value: '50K+', label: 'Job Seekers' },
  { value: '2K+', label: 'Companies' },
  { value: '95%', label: 'Match Rate' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  return (
    <div className="landing">
      {/* Noise texture overlay */}
      <div className="landing__noise" />

      {/* Grid pattern */}
      <div className="landing__grid" />

      {/* Header */}
      <header className="landing__header">
        <div className="landing__header-inner">
          <div className="landing__logo">
            <span className="logo-mark">TB</span>
            <span className="logo-text">TalentBridge</span>
          </div>
          <div className="landing__header-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>Sign In</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Get Started</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={`landing__hero ${mounted ? 'mounted' : ''}`}>
        <div className="hero__eyebrow">
          <span className="eyebrow-dot" />
          <span>AI-Powered Resume Matching</span>
        </div>

        <h1 className="hero__title">
          Where Talent<br />
          Meets <span className="hero__title-outline">Opportunity</span>
        </h1>

        <p className="hero__subtitle">
          The intelligent job portal that analyzes your resume,<br />
          scores your fit, and connects you with your ideal role.
        </p>

        {/* Ticker */}
        <div className="hero__ticker">
          <div className="ticker__track">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="ticker__item">
                <span className="ticker__dot" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className={`landing__stats ${mounted ? 'mounted' : ''}`}>
        {STATS.map((s, i) => (
          <div key={i} className="stat-item" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ===== DUAL PORTAL CARDS ===== */}
      <section className={`landing__portals ${mounted ? 'mounted' : ''}`}>
        <div className="portals__label">Choose your path</div>

        <div className="portals__grid">
          {/* Job Seeker Card */}
          <div
            className={`portal-card portal-card--seeker ${hoveredCard === 'seeker' ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredCard('seeker')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="portal-card__glow portal-card__glow--left" />

            <div className="portal-card__icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            <div className="portal-card__content">
              <h2 className="portal-card__title">Job Seeker</h2>
              <p className="portal-card__desc">
                Discover opportunities, upload your resume, and let our AI match you with roles that fit your skills perfectly.
              </p>
              <ul className="portal-card__features">
                <li><span className="feature-check">✓</span> AI Resume Analysis</li>
                <li><span className="feature-check">✓</span> Smart Skill Matching</li>
                <li><span className="feature-check">✓</span> Application Tracking</li>
                <li><span className="feature-check">✓</span> Job Alerts</li>
              </ul>
            </div>

            <div className="portal-card__actions">
              <button
                className="portal-btn portal-btn--primary"
                onClick={() => navigate('/login?role=seeker')}
              >
                Login as Seeker
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <button
                className="portal-btn portal-btn--ghost"
                onClick={() => navigate('/register?role=seeker')}
              >
                Register as New User
              </button>
            </div>

            <div className="portal-card__tag">For Candidates</div>
          </div>

          {/* Divider */}
          <div className="portals__divider">
            <div className="divider-line" />
            <div className="divider-or">OR</div>
            <div className="divider-line" />
          </div>

          {/* Recruiter Card */}
          <div
            className={`portal-card portal-card--recruiter ${hoveredCard === 'recruiter' ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredCard('recruiter')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="portal-card__glow portal-card__glow--right" />

            <div className="portal-card__icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>

            <div className="portal-card__content">
              <h2 className="portal-card__title">Recruiter</h2>
              <p className="portal-card__desc">
                Post jobs, review AI-analyzed applications, and find the best-fit candidates ranked by skill match scores.
              </p>
              <ul className="portal-card__features">
                <li><span className="feature-check">✓</span> Job Posting System</li>
                <li><span className="feature-check">✓</span> Candidate Analytics</li>
                <li><span className="feature-check">✓</span> Resume Screening</li>
                <li><span className="feature-check">✓</span> Hiring Dashboard</li>
              </ul>
            </div>

            <div className="portal-card__actions">
              <button
                className="portal-btn portal-btn--white"
                onClick={() => navigate('/login?role=recruiter')}
              >
                Login as Recruiter
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <button
                className="portal-btn portal-btn--ghost-white"
                onClick={() => navigate('/register?role=recruiter')}
              >
                Register as Recruiter
              </button>
            </div>

            <div className="portal-card__tag portal-card__tag--white">For Companies</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing__features">
        <h2 className="features__title">Why TalentBridge?</h2>
        <div className="features__grid">
          {[
            { icon: '🧠', title: 'AI Resume Analyzer', desc: 'Upload your PDF resume and instantly get a skill match score against any job posting.' },
            { icon: '🎯', title: 'Precision Matching', desc: 'Our engine compares job requirements vs your extracted skills to surface the best matches.' },
            { icon: '📊', title: 'Live Dashboards', desc: 'Both seekers and recruiters get real-time dashboards with actionable insights.' },
            { icon: '🔒', title: 'Secure & Private', desc: 'JWT auth, bcrypt hashing, role-based access. Your data is always protected.' },
          ].map((f, i) => (
            <div key={i} className="feature-item" style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="feature-item__icon">{f.icon}</div>
              <h3 className="feature-item__title">{f.title}</h3>
              <p className="feature-item__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing__footer">
        <div className="landing__logo">
          <span className="logo-mark">TB</span>
          <span className="logo-text">TalentBridge</span>
        </div>
        <p className="footer__copy">© 2024 TalentBridge. Built with React + Node + MongoDB.</p>
      </footer>
    </div>
  );
}
