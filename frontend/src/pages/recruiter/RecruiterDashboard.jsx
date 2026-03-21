import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import '../seeker/SeekerLayout.css';
import '../seeker/SeekerDashboard.css';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs/recruiter/my-jobs')
      .then(({ data }) => setJobs(data.jobs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalApps = jobs.reduce((s, j) => s + (j.applicationsCount || 0), 0);
  const openJobs = jobs.filter(j => j.status === 'open').length;

  const chartData = jobs.slice(0, 6).map(j => ({
    name: j.title.length > 14 ? j.title.slice(0, 14) + '…' : j.title,
    applicants: j.applicationsCount || 0,
  }));

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" /></div>;

  const isApproved = user?.isApproved;

  return (
    <div>
      <div className="page-header">
        <div className="page-header__eyebrow">Recruiter Portal</div>
        <h1 className="page-header__title">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="page-header__subtitle">Manage your job postings and candidates</p>
        {!isApproved && (
          <div style={{ marginTop: 16, padding: '14px 18px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, fontSize: 14, color: '#f59e0b', display: 'flex', gap: 10, alignItems: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Your account is pending admin approval. You can explore but cannot post jobs yet.
          </div>
        )}
      </div>
      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: 28 }}>
          {[
            { icon: '📋', label: 'Total Jobs Posted', value: jobs.length },
            { icon: '✅', label: 'Open Positions', value: openJobs },
            { icon: '👥', label: 'Total Applicants', value: totalApps },
            { icon: '🏢', label: 'Company', value: user?.company ? 'Active' : 'Not Set' },
          ].map((s, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-card__icon">{s.icon}</div>
              <div className="stat-card__value" style={{ fontSize: typeof s.value === 'string' ? 22 : undefined }}>{s.value}</div>
              <div className="stat-card__label">{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          {/* Chart */}
          <div className="dash-card">
            <div className="section-header">
              <h3 className="section-title">Applicants per Job</h3>
              <Link to="/recruiter/jobs" className="link-sm">View all jobs</Link>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <XAxis dataKey="name" tick={{ fill: '#525252', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#525252', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 8, fontSize: 13 }}
                    labelStyle={{ color: '#fff' }}
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  />
                  <Bar dataKey="applicants" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={i % 2 === 0 ? '#fff' : '#404040'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-state__icon">📊</div>
                <p style={{ color: '#404040', fontSize: 14 }}>Post jobs to see applicant data</p>
                <Link to="/recruiter/post-job" className="btn btn-primary btn-sm">Post First Job</Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="dash-card">
              <h3 className="section-title" style={{ marginBottom: 14 }}>Quick Actions</h3>
              <div className="quick-actions">
                {[
                  { to: '/recruiter/post-job', icon: '➕', label: 'Post New Job', desc: 'Create a job listing' },
                  { to: '/recruiter/jobs', icon: '📋', label: 'Manage Jobs', desc: `${jobs.length} total posted` },
                  { to: '/recruiter/company', icon: '🏢', label: 'Company Profile', desc: user?.company ? 'Update details' : 'Set up profile' },
                ].map((a, i) => (
                  <Link key={i} to={a.to} className="quick-action-item">
                    <span className="qa-icon">{a.icon}</span>
                    <div>
                      <div className="qa-label">{a.label}</div>
                      <div className="qa-desc">{a.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent jobs */}
            <div className="dash-card" style={{ flex: 1 }}>
              <h3 className="section-title" style={{ marginBottom: 14 }}>Recent Posts</h3>
              {jobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#404040', fontSize: 14 }}>No jobs posted yet</div>
              ) : (
                <div className="app-list">
                  {jobs.slice(0, 4).map(job => (
                    <Link key={job._id} to={`/recruiter/jobs/${job._id}/applicants`} className="app-item" style={{ textDecoration: 'none' }}>
                      <div className="app-item__info">
                        <div className="app-item__title">{job.title}</div>
                        <div className="app-item__company">{job.applicationsCount || 0} applicants · {job.location}</div>
                      </div>
                      <span className={`badge ${job.status === 'open' ? 'badge-success' : 'badge-outline'}`}>{job.status}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
