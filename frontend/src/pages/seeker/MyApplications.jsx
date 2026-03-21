import { useState, useEffect } from 'react';
import api from '../../utils/api';
import './MyApplications.css';

const STATUS_CONFIG = {
  applied: { label: 'Applied', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', step: 1 },
  under_review: { label: 'Under Review', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', step: 2 },
  shortlisted: { label: 'Shortlisted', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)', step: 3 },
  rejected: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', step: 0 },
  selected: { label: 'Selected 🎉', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', step: 4 },
};

const STEPS = ['Applied', 'Under Review', 'Shortlisted', 'Selected'];

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/applications/my')
      .then(({ data }) => setApplications(data.applications))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  const ScoreRing = ({ score, size = 60 }) => {
    const r = (size / 2) - 5;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
    return (
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a1a1a" strokeWidth="5"/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"/>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: size * 0.22, lineHeight: 1 }}>{score}%</div>
        </div>
      </div>
    );
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header__eyebrow">Your Journey</div>
        <h1 className="page-header__title">My Applications</h1>
        <p className="page-header__subtitle">{applications.length} total applications</p>
      </div>
      <div className="page-body">
        {/* Status filter tabs */}
        <div className="status-tabs">
          {['all', 'applied', 'under_review', 'shortlisted', 'rejected', 'selected'].map(s => (
            <button
              key={s}
              className={`status-tab ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? `All (${applications.length})` : STATUS_CONFIG[s]?.label}
              {s !== 'all' && (
                <span className="status-count">{applications.filter(a => a.status === s).length}</span>
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📭</div>
            <h3 className="empty-state__title">No applications here</h3>
            <p className="empty-state__desc">Applications matching this filter will appear here</p>
          </div>
        ) : (
          <div className="applications-list">
            {filtered.map(app => {
              const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
              const hasScore = app.analysis?.matchScore > 0;
              return (
                <div key={app._id} className={`app-card ${selected === app._id ? 'expanded' : ''}`}>
                  <div className="app-card__main" onClick={() => setSelected(selected === app._id ? null : app._id)}>
                    <div className="app-card__logo">
                      {app.job?.company?.logo?.url ? (
                        <img src={app.job.company.logo.url} alt="" />
                      ) : (
                        <span>{app.job?.company?.name?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <div className="app-card__info">
                      <div className="app-card__title">{app.job?.title || 'Job Removed'}</div>
                      <div className="app-card__company">
                        {app.job?.company?.name} · {app.job?.location} · {app.job?.jobType}
                      </div>
                      <div className="app-card__date">
                        Applied {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="app-card__right">
                      {hasScore && <ScoreRing score={app.analysis.matchScore} size={54} />}
                      <span className="status-badge" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
                        {cfg.label}
                      </span>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ color: '#404040', transform: selected === app._id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>

                  {selected === app._id && (
                    <div className="app-card__detail animate-fadeIn">
                      {/* Progress steps */}
                      {app.status !== 'rejected' && (
                        <div className="progress-steps">
                          {STEPS.map((step, i) => {
                            const active = cfg.step > i;
                            const current = cfg.step === i + 1;
                            return (
                              <div key={i} className="progress-step">
                                <div className={`step-dot ${active || current ? 'done' : ''}`}>
                                  {active ? '✓' : i + 1}
                                </div>
                                <div className={`step-label ${active || current ? 'active' : ''}`}>{step}</div>
                                {i < STEPS.length - 1 && <div className={`step-line ${active ? 'done' : ''}`} />}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Analysis */}
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
                                  <div className="analysis-label" style={{ color: '#22c55e' }}>✓ Matched Skills</div>
                                  <div className="skill-chips">
                                    {app.analysis.matchedSkills.map(s => (
                                      <span key={s} className="skill-chip skill-chip--match">{s}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {app.analysis.missingSkills?.length > 0 && (
                                <div>
                                  <div className="analysis-label" style={{ color: '#ef4444' }}>✗ Missing Skills</div>
                                  <div className="skill-chips">
                                    {app.analysis.missingSkills.map(s => (
                                      <span key={s} className="skill-chip skill-chip--miss">{s}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Recruiter note */}
                      {app.recruiterNote && (
                        <div className="recruiter-note">
                          <div className="analysis-label">Recruiter Note</div>
                          <p>{app.recruiterNote}</p>
                        </div>
                      )}

                      {/* Interview details */}
                      {app.interviewDate && (
                        <div className="interview-card">
                          <div className="interview-card__icon">📅</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>Interview Scheduled</div>
                            <div style={{ fontSize: 13, color: '#737373', marginTop: 4 }}>
                              {new Date(app.interviewDate).toLocaleDateString()} {app.interviewTime && `at ${app.interviewTime}`}
                              {app.interviewLink && (
                                <a href={app.interviewLink} target="_blank" rel="noreferrer" style={{ color: '#a3a3a3', marginLeft: 8 }}>Join →</a>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
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
