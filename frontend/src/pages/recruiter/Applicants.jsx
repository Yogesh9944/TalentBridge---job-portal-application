import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import '../seeker/SeekerLayout.css';
import '../seeker/MyApplications.css';

const STATUS_OPTS = [
  { value: 'applied', label: 'Applied' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'selected', label: 'Selected' },
];
const STATUS_COLORS = {
  applied: '#3b82f6', under_review: '#f59e0b', shortlisted: '#8b5cf6', rejected: '#ef4444', selected: '#22c55e',
};

export default function Applicants() {
  const { id: jobId } = useParams();
  const [data, setData] = useState({ applications: [], job: null });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortByScore, setSortByScore] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [noteInput, setNoteInput] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');

  useEffect(() => {
    api.get(`/applications/job/${jobId}${sortByScore ? '?sort=score' : ''}`)
      .then(({ data: d }) => setData(d))
      .catch(() => toast.error('Failed to load applicants'))
      .finally(() => setLoading(false));
  }, [jobId, sortByScore]);

  const filtered = filter === 'all' ? data.applications : data.applications.filter(a => a.status === filter);

  const handleStatusChange = async (appId, status) => {
    setUpdating(appId);
    try {
      const body = { status };
      if (noteInput) body.recruiterNote = noteInput;
      if (interviewDate) body.interviewDate = interviewDate;
      if (interviewTime) body.interviewTime = interviewTime;
      const { data: res } = await api.put(`/applications/${appId}/status`, body);
      setData(prev => ({
        ...prev,
        applications: prev.applications.map(a => a._id === appId ? { ...a, status, recruiterNote: body.recruiterNote || a.recruiterNote } : a),
      }));
      toast.success('Status updated');
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const ScoreRing = ({ score, size = 52 }) => {
    const r = (size / 2) - 5;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
    return (
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a1a1a" strokeWidth="4"/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"/>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: size * 0.22, color }}>{score}%</span>
        </div>
      </div>
    );
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header__eyebrow">Hiring</div>
        <h1 className="page-header__title">{data.job?.title} — Applicants</h1>
        <p className="page-header__subtitle">{data.applications.length} total applications</p>
      </div>
      <div className="page-body">
        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="status-tabs" style={{ flex: 1 }}>
            {['all', ...STATUS_OPTS.map(s => s.value)].map(s => (
              <button key={s} className={`status-tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                {s === 'all' ? 'All' : STATUS_OPTS.find(o => o.value === s)?.label}
                {s !== 'all' && <span className="status-count">{data.applications.filter(a => a.status === s).length}</span>}
              </button>
            ))}
          </div>
          <button
            className={`btn btn-sm ${sortByScore ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSortByScore(p => !p)}
          >
            {sortByScore ? '★ Score' : '↕ Sort by Score'}
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">👥</div>
            <h3 className="empty-state__title">No applicants yet</h3>
            <p className="empty-state__desc">Candidates who apply for this job will appear here</p>
          </div>
        ) : (
          <div className="applications-list">
            {filtered.map(app => {
              const statusColor = STATUS_COLORS[app.status] || '#525252';
              const isOpen = selected === app._id;
              return (
                <div key={app._id} className="app-card">
                  <div className="app-card__main" onClick={() => setSelected(isOpen ? null : app._id)}>
                    <div className="app-card__logo">
                      {app.applicant?.profilePicture ? (
                        <img src={app.applicant.profilePicture} alt="" />
                      ) : (
                        <span style={{ fontSize: 18, fontWeight: 700 }}>{app.applicant?.name?.charAt(0)}</span>
                      )}
                    </div>
                    <div className="app-card__info">
                      <div className="app-card__title">{app.applicant?.name}</div>
                      <div className="app-card__company">{app.applicant?.email} · {app.applicant?.location || 'Location N/A'}</div>
                      {app.applicant?.skills?.length > 0 && (
                        <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
                          {app.applicant.skills.slice(0, 4).map(s => (
                            <span key={s} style={{ padding: '1px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 100, fontSize: 11, color: '#525252' }}>{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="app-card__right">
                      {app.analysis?.matchScore > 0 && <ScoreRing score={app.analysis.matchScore} />}
                      <span className="status-badge" style={{ background: `${statusColor}18`, color: statusColor, borderColor: `${statusColor}40` }}>
                        {STATUS_OPTS.find(s => s.value === app.status)?.label}
                      </span>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ color: '#404040', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>

                  {isOpen && (
                    <div className="app-card__detail animate-fadeIn">
                      {/* Status update controls */}
                      <div style={{ background: '#111', borderRadius: 12, padding: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#737373', marginBottom: 12 }}>Update Status</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                          {STATUS_OPTS.map(s => (
                            <button
                              key={s.value}
                              disabled={updating === app._id}
                              className={`btn btn-sm ${app.status === s.value ? 'btn-primary' : 'btn-secondary'}`}
                              onClick={() => handleStatusChange(app._id, s.value)}
                            >
                              {updating === app._id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : s.label}
                            </button>
                          ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                          <div className="form-group">
                            <label className="form-label">Interview Date</label>
                            <input type="date" className="input-base" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Interview Time</label>
                            <input type="time" className="input-base" value={interviewTime} onChange={e => setInterviewTime(e.target.value)} />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Note to Candidate</label>
                          <textarea className="input-base" rows={2} placeholder="Optional message to the candidate..." value={noteInput} onChange={e => setNoteInput(e.target.value)} style={{ resize: 'none' }} />
                        </div>
                      </div>

                      {/* Resume analysis */}
                      {app.analysis?.analyzed && (
                        <div className="analysis-block">
                          <div className="analysis-block__title">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>
                            Resume Analysis
                          </div>
                          <div className="analysis-row">
                            <ScoreRing score={app.analysis.matchScore} size={72} />
                            <div className="analysis-details">
                              {app.analysis.matchedSkills?.length > 0 && (
                                <div>
                                  <div className="analysis-label" style={{ color: '#22c55e' }}>✓ Matched</div>
                                  <div className="skill-chips">
                                    {app.analysis.matchedSkills.map(s => <span key={s} className="skill-chip skill-chip--match">{s}</span>)}
                                  </div>
                                </div>
                              )}
                              {app.analysis.missingSkills?.length > 0 && (
                                <div>
                                  <div className="analysis-label" style={{ color: '#ef4444' }}>✗ Missing</div>
                                  <div className="skill-chips">
                                    {app.analysis.missingSkills.map(s => <span key={s} className="skill-chip skill-chip--miss">{s}</span>)}
                                  </div>
                                </div>
                              )}
                              {app.analysis.strengths?.length > 0 && (
                                <div>
                                  <div className="analysis-label" style={{ color: '#f59e0b' }}>⚡ Strengths</div>
                                  <div style={{ fontSize: 13, color: '#737373', lineHeight: 1.6 }}>{app.analysis.strengths.join(' · ')}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 10 }}>
                        {app.resume?.url && (
                          <a href={app.resume.url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                            View Resume
                          </a>
                        )}
                        <a href={`mailto:${app.applicant?.email}`} className="btn btn-secondary btn-sm">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                          Email
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
