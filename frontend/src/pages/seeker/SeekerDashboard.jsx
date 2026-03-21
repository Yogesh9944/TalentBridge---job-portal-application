import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import './SeekerLayout.css';
import './SeekerDashboard.css';

const STATUS_CONFIG = {
  applied: { label: 'Applied', color: '#3b82f6' },
  under_review: { label: 'Under Review', color: '#f59e0b' },
  shortlisted: { label: 'Shortlisted', color: '#8b5cf6' },
  rejected: { label: 'Rejected', color: '#ef4444' },
  selected: { label: 'Selected 🎉', color: '#22c55e' },
};

export default function SeekerDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, jobsRes] = await Promise.all([
          api.get('/applications/my'),
          api.get('/jobs?limit=5&sort=-createdAt'),
        ]);
        setApplications(appsRes.data.applications || []);
        setRecentJobs(jobsRes.data.jobs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statsData = [
    { label: 'Total Applied', value: applications.length, icon: '📤' },
    { label: 'Shortlisted', value: applications.filter(a => a.status === 'shortlisted').length, icon: '⭐' },
    { label: 'Under Review', value: applications.filter(a => a.status === 'under_review').length, icon: '🔍' },
    { label: 'Selected', value: applications.filter(a => a.status === 'selected').length, icon: '🎉' },
  ];

  const resumeComplete = !!(user?.resume?.url);
  const profileScore = [
    user?.name, user?.title, user?.bio, user?.skills?.length,
    user?.education?.length, resumeComplete,
  ].filter(Boolean).length;
  const profilePct = Math.round((profileScore / 6) * 100);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-header__eyebrow">Job Seeker Portal</div>
        <h1 className="page-header__title">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="page-header__subtitle">Here's what's happening with your job search</p>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: 28 }}>
          {statsData.map((s, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-card__icon" style={{ background: 'rgba(255,255,255,0.05)' }}>{s.icon}</div>
              <div className="stat-card__value">{s.value}</div>
              <div className="stat-card__label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid">
          {/* Left column */}
          <div className="dashboard-col">
            {/* Profile completeness */}
            <div className="dash-card">
              <div className="section-header">
                <h3 className="section-title">Profile Strength</h3>
                <span className="badge badge-outline">{profilePct}%</span>
              </div>
              <div className="profile-bar">
                <div className="profile-bar__fill" style={{ width: `${profilePct}%` }} />
              </div>
              <div className="profile-checklist">
                {[
                  { label: 'Full Name', done: !!user?.name },
                  { label: 'Job Title', done: !!user?.title },
                  { label: 'Bio / Summary', done: !!user?.bio },
                  { label: 'Skills added', done: !!(user?.skills?.length) },
                  { label: 'Education', done: !!(user?.education?.length) },
                  { label: 'Resume uploaded', done: resumeComplete },
                ].map((item, i) => (
                  <div key={i} className="checklist-item">
                    <div className={`checklist-dot ${item.done ? 'done' : ''}`}>
                      {item.done ? '✓' : ''}
                    </div>
                    <span style={{ color: item.done ? '#a3a3a3' : '#404040', textDecoration: item.done ? 'line-through' : 'none' }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              <Link to="/seeker/profile" className="btn btn-secondary btn-sm" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
                Complete Profile
              </Link>
            </div>

            {/* Quick actions */}
            <div className="dash-card">
              <h3 className="section-title" style={{ marginBottom: 16 }}>Quick Actions</h3>
              <div className="quick-actions">
                {[
                  { to: '/seeker/jobs', icon: '🔍', label: 'Browse Jobs', desc: 'Explore all open positions' },
                  { to: '/seeker/analyzer', icon: '🧠', label: 'Analyze Resume', desc: 'Get your match score' },
                  { to: '/seeker/applications', icon: '📋', label: 'Track Applications', desc: 'Monitor your progress' },
                  { to: '/seeker/saved', icon: '🔖', label: 'Saved Jobs', desc: `${user?.savedJobs?.length || 0} saved` },
                ].map((a, i) => (
                  <Link key={i} to={a.to} className="quick-action-item">
                    <span className="qa-icon">{a.icon}</span>
                    <div>
                      <div className="qa-label">{a.label}</div>
                      <div className="qa-desc">{a.desc}</div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto', color: '#404040', flexShrink: 0 }}>
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="dashboard-col">
            {/* Recent Applications */}
            <div className="dash-card">
              <div className="section-header">
                <h3 className="section-title">Recent Applications</h3>
                <Link to="/seeker/applications" className="link-sm">View all</Link>
              </div>
              {applications.length === 0 ? (
                <div className="empty-state" style={{ padding: '40px 0' }}>
                  <div className="empty-state__icon">📭</div>
                  <p className="empty-state__title">No applications yet</p>
                  <Link to="/seeker/jobs" className="btn btn-primary btn-sm">Browse Jobs</Link>
                </div>
              ) : (
                <div className="app-list">
                  {applications.slice(0, 5).map(app => (
                    <div key={app._id} className="app-item">
                      <div className="app-item__logo">
                        {app.job?.company?.logo?.url ? (
                          <img src={app.job.company.logo.url} alt="" />
                        ) : (
                          <span>{app.job?.company?.name?.charAt(0) || '?'}</span>
                        )}
                      </div>
                      <div className="app-item__info">
                        <div className="app-item__title">{app.job?.title || 'Unknown Job'}</div>
                        <div className="app-item__company">{app.job?.company?.name}</div>
                      </div>
                      <div className="app-item__right">
                        <span className="status-pill" style={{ background: `${STATUS_CONFIG[app.status]?.color}18`, color: STATUS_CONFIG[app.status]?.color, borderColor: `${STATUS_CONFIG[app.status]?.color}40` }}>
                          {STATUS_CONFIG[app.status]?.label}
                        </span>
                        {app.analysis?.matchScore > 0 && (
                          <div className="score-mini">{app.analysis.matchScore}% match</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Latest Jobs */}
            <div className="dash-card">
              <div className="section-header">
                <h3 className="section-title">Latest Openings</h3>
                <Link to="/seeker/jobs" className="link-sm">View all</Link>
              </div>
              <div className="app-list">
                {recentJobs.map(job => (
                  <Link key={job._id} to={`/seeker/jobs/${job._id}`} className="app-item" style={{ textDecoration: 'none' }}>
                    <div className="app-item__logo">
                      {job.company?.logo?.url ? (
                        <img src={job.company.logo.url} alt="" />
                      ) : (
                        <span>{job.company?.name?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <div className="app-item__info">
                      <div className="app-item__title">{job.title}</div>
                      <div className="app-item__company">{job.company?.name} · {job.location}</div>
                    </div>
                    <div className="app-item__right">
                      <span className="badge badge-outline">{job.jobType}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
