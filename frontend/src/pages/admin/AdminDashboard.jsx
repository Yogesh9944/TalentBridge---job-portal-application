import { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, LineChart, Line, CartesianGrid,
} from 'recharts';
import '../seeker/SeekerLayout.css';
import './AdminDashboard.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const STATUS_COLORS = {
  applied: '#3b82f6',
  under_review: '#f59e0b',
  shortlisted: '#8b5cf6',
  rejected: '#ef4444',
  selected: '#22c55e',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <div className="spinner" />
    </div>
  );

  const monthlyData = stats?.monthlyUsers?.map(m => ({
    name: MONTHS[(m._id.month - 1)],
    users: m.count,
  })) || [];

  const topSkills = stats?.topSkills?.slice(0, 8) || [];
  const appStats = stats?.appStats || [];

  const pieData = appStats.map(a => ({
    name: a._id?.replace('_', ' '),
    value: a.count,
    color: STATUS_COLORS[a._id] || '#525252',
  }));

  const bigStats = [
    { icon: '👥', label: 'Total Users', value: stats?.totalUsers ?? 0, sub: `${stats?.seekers ?? 0} seekers · ${stats?.recruiters ?? 0} recruiters` },
    { icon: '📋', label: 'Jobs Posted', value: stats?.totalJobs ?? 0, sub: `${stats?.openJobs ?? 0} currently open` },
    { icon: '📤', label: 'Applications', value: stats?.totalApplications ?? 0, sub: 'All time' },
    { icon: '🏢', label: 'Companies', value: stats?.totalCompanies ?? 0, sub: 'Registered' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#111', border: '1px solid #333', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
        <div style={{ color: '#a3a3a3', marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: '#fff', fontWeight: 600 }}>{p.name}: {p.value}</div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header__eyebrow">Admin Console</div>
        <h1 className="page-header__title">Platform Analytics</h1>
        <p className="page-header__subtitle">Real-time overview of TalentBridge activity</p>
        {stats?.pendingRecruiters > 0 && (
          <div className="admin-alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span><strong>{stats.pendingRecruiters}</strong> recruiter account{stats.pendingRecruiters > 1 ? 's' : ''} awaiting approval</span>
            <a href="/admin/users" style={{ color: '#f59e0b', fontWeight: 600, marginLeft: 4 }}>Review →</a>
          </div>
        )}
      </div>

      <div className="page-body">
        {/* Big stat cards */}
        <div className="stats-grid" style={{ marginBottom: 28 }}>
          {bigStats.map((s, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-card__icon" style={{ fontSize: 22, background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>{s.icon}</div>
              <div className="stat-card__value">{s.value.toLocaleString()}</div>
              <div className="stat-card__label">{s.label}</div>
              <div style={{ fontSize: 12, color: '#404040', marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="admin-charts-row">
          {/* Monthly registrations */}
          <div className="admin-chart-card" style={{ flex: 2 }}>
            <div className="section-header" style={{ marginBottom: 20 }}>
              <h3 className="section-title">User Registrations</h3>
              <span style={{ fontSize: 12, color: '#404040' }}>Last 6 months</span>
            </div>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: '#525252', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#525252', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="users" stroke="#fff" strokeWidth={2.5} dot={{ fill: '#fff', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: '40px 0', minHeight: 220 }}>
                <div className="empty-state__icon">📈</div>
                <p style={{ color: '#404040', fontSize: 14 }}>No registration data yet</p>
              </div>
            )}
          </div>

          {/* Application status pie */}
          <div className="admin-chart-card" style={{ flex: 1 }}>
            <div className="section-header" style={{ marginBottom: 20 }}>
              <h3 className="section-title">Application Status</h3>
            </div>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 8, fontSize: 12 }}
                    formatter={(val, name) => [val, name]}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(val) => <span style={{ color: '#737373', fontSize: 11, textTransform: 'capitalize' }}>{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: '40px 0', minHeight: 220 }}>
                <div className="empty-state__icon">📊</div>
                <p style={{ color: '#404040', fontSize: 14 }}>No application data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="admin-charts-row" style={{ marginTop: 20 }}>
          {/* Top skills */}
          <div className="admin-chart-card" style={{ flex: 2 }}>
            <div className="section-header" style={{ marginBottom: 20 }}>
              <h3 className="section-title">Most In-Demand Skills</h3>
              <span style={{ fontSize: 12, color: '#404040' }}>From active job listings</span>
            </div>
            {topSkills.length > 0 ? (
              <div className="skills-demand-list">
                {topSkills.map((skill, i) => {
                  const max = topSkills[0]?.count || 1;
                  const pct = Math.round((skill.count / max) * 100);
                  return (
                    <div key={i} className="skill-demand-row">
                      <div className="skill-demand-label">
                        <span className="skill-demand-rank">#{i + 1}</span>
                        <span className="skill-demand-name">{skill._id}</span>
                      </div>
                      <div className="skill-demand-bar-wrap">
                        <div className="skill-demand-bar" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="skill-demand-count">{skill.count}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '30px 0' }}>
                <p style={{ color: '#404040', fontSize: 14 }}>No skills data yet</p>
              </div>
            )}
          </div>

          {/* Quick summary card */}
          <div className="admin-chart-card" style={{ flex: 1 }}>
            <h3 className="section-title" style={{ marginBottom: 20 }}>Platform Health</h3>
            <div className="health-metrics">
              {[
                {
                  label: 'Open Jobs',
                  value: stats?.openJobs || 0,
                  total: stats?.totalJobs || 0,
                  color: '#22c55e',
                },
                {
                  label: 'Seekers',
                  value: stats?.seekers || 0,
                  total: stats?.totalUsers || 0,
                  color: '#3b82f6',
                },
                {
                  label: 'Recruiters',
                  value: stats?.recruiters || 0,
                  total: stats?.totalUsers || 0,
                  color: '#f59e0b',
                },
                {
                  label: 'Companies',
                  value: stats?.totalCompanies || 0,
                  total: stats?.recruiters || 0,
                  color: '#8b5cf6',
                },
              ].map((m, i) => {
                const pct = m.total > 0 ? Math.round((m.value / m.total) * 100) : 0;
                return (
                  <div key={i} className="health-metric">
                    <div className="health-metric__header">
                      <span className="health-metric__label">{m.label}</span>
                      <span className="health-metric__value">{m.value.toLocaleString()}</span>
                    </div>
                    <div className="health-metric__bar">
                      <div className="health-metric__fill" style={{ width: `${pct}%`, background: m.color }} />
                    </div>
                    <div className="health-metric__pct">{pct}% of total</div>
                  </div>
                );
              })}
            </div>

            <div className="divider" style={{ margin: '20px 0' }} />

            <div className="quick-admin-links">
              <h4 style={{ fontSize: 13, fontWeight: 600, color: '#525252', marginBottom: 12 }}>QUICK ACTIONS</h4>
              {[
                { href: '/admin/users', label: 'Manage Users', icon: '👥' },
                { href: '/admin/jobs', label: 'Review Jobs', icon: '📋' },
                { href: '/admin/users?role=recruiter', label: `Approve Recruiters (${stats?.pendingRecruiters || 0})`, icon: '✅' },
              ].map((l, i) => (
                <a key={i} href={l.href} className="quick-admin-link">
                  <span>{l.icon}</span>
                  <span>{l.label}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto', color: '#404040' }}>
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bar chart - top skills (visual) */}
        {topSkills.length > 0 && (
          <div className="admin-chart-card" style={{ marginTop: 20 }}>
            <div className="section-header" style={{ marginBottom: 20 }}>
              <h3 className="section-title">Skill Demand — Bar View</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topSkills.map(s => ({ name: s._id, count: s.count }))} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <XAxis dataKey="name" tick={{ fill: '#525252', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#525252', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {topSkills.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#fff' : i < 3 ? '#a3a3a3' : '#2a2a2a'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
