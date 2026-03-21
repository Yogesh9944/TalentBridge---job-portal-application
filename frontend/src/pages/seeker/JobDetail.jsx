import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import './JobDetail.css';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [already, setAlready] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`)
      .then(({ data }) => setJob(data.job))
      .catch(() => toast.error('Job not found'))
      .finally(() => setLoading(false));

    // Check if already applied
    api.get('/applications/my').then(({ data }) => {
      const exists = data.applications.find(a => a.job?._id === id || a.job === id);
      setAlready(!!exists);
    }).catch(() => {});
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      const fd = new FormData();
      if (resumeFile) fd.append('resume', resumeFile);
      fd.append('coverLetter', coverLetter);
      const { data } = await api.post(`/applications/${id}/apply`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Application submitted! 🎉');
      setAlready(true);
      setShowApply(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (salary) => {
    if (!salary?.min && !salary?.max) return 'Not disclosed';
    const fmt = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;
    if (salary.min && salary.max) return `${fmt(salary.min)} – ${fmt(salary.max)} / ${salary.period || 'year'}`;
    return salary.min ? `${fmt(salary.min)}+` : `Up to ${fmt(salary.max)}`;
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" /></div>;
  if (!job) return <div className="empty-state"><div className="empty-state__icon">❌</div><h3 className="empty-state__title">Job not found</h3><Link to="/seeker/jobs" className="btn btn-secondary btn-sm">Back to Jobs</Link></div>;

  return (
    <div>
      <div className="page-header">
        <Link to="/seeker/jobs" className="back-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Jobs
        </Link>
      </div>
      <div className="page-body">
        <div className="job-detail-grid">
          {/* Main content */}
          <div>
            {/* Header card */}
            <div className="jd-header-card">
              <div className="jd-header-top">
                <div className="jd-logo">
                  {job.company?.logo?.url ? (
                    <img src={job.company.logo.url} alt={job.company.name} />
                  ) : (
                    <span>{job.company?.name?.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h1 className="jd-title">{job.title}</h1>
                  <div className="jd-company">{job.company?.name}</div>
                </div>
              </div>
              <div className="jd-quick-info">
                <div className="jd-info-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {job.location} · {job.locationType}
                </div>
                <div className="jd-info-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                  {job.experienceYears?.min}–{job.experienceYears?.max} yrs · {job.experienceLevel}
                </div>
                <div className="jd-info-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  {formatSalary(job.salary)}
                </div>
                <div className="jd-info-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  {job.jobType}
                </div>
              </div>
              <div className="jd-actions">
                {already ? (
                  <button className="btn btn-secondary" disabled>✓ Already Applied</button>
                ) : (
                  <button className="btn btn-primary" onClick={() => setShowApply(true)}>
                    Apply Now
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                )}
                <div className="jd-applicants">{job.applicationsCount} applicants</div>
              </div>
            </div>

            {/* Description */}
            <div className="jd-section">
              <h2 className="jd-section-title">About the Role</h2>
              <p className="jd-text">{job.description}</p>
            </div>

            {job.requirements && (
              <div className="jd-section">
                <h2 className="jd-section-title">Requirements</h2>
                <p className="jd-text">{job.requirements}</p>
              </div>
            )}

            {/* Required Skills */}
            <div className="jd-section">
              <h2 className="jd-section-title">Required Skills</h2>
              <div className="jd-skills">
                {job.requiredSkills?.map(skill => (
                  <span key={skill} className="skill-tag-lg">{skill}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside>
            {/* Company card */}
            <div className="jd-company-card">
              <h3 className="jd-company-card__title">About the Company</h3>
              <div className="jd-company-card__logo">
                {job.company?.logo?.url ? (
                  <img src={job.company.logo.url} alt={job.company.name} />
                ) : (
                  <span>{job.company?.name?.charAt(0)}</span>
                )}
              </div>
              <div className="jd-company-name">{job.company?.name}</div>
              <div className="jd-company-meta">
                {job.company?.industry && <div><span>Industry</span><span>{job.company.industry}</span></div>}
                {job.company?.size && <div><span>Company Size</span><span>{job.company.size} employees</span></div>}
                {job.company?.location && <div><span>HQ</span><span>{job.company.location}</span></div>}
                {job.company?.website && (
                  <div><span>Website</span>
                    <a href={job.company.website} target="_blank" rel="noreferrer" style={{ color: '#a3a3a3' }}>Visit →</a>
                  </div>
                )}
              </div>
              {job.company?.description && (
                <p className="jd-company-desc">{job.company.description}</p>
              )}
            </div>

            {/* Job overview */}
            <div className="jd-company-card" style={{ marginTop: 16 }}>
              <h3 className="jd-company-card__title">Job Overview</h3>
              <div className="jd-company-meta">
                {job.deadline && <div><span>Apply Before</span><span>{new Date(job.deadline).toLocaleDateString()}</span></div>}
                <div><span>Posted</span><span>{new Date(job.createdAt).toLocaleDateString()}</span></div>
                <div><span>Views</span><span>{job.views}</span></div>
                <div><span>Status</span><span style={{ color: job.status === 'open' ? '#22c55e' : '#ef4444', textTransform: 'capitalize' }}>{job.status}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Apply Modal */}
      {showApply && (
        <div className="modal-overlay" onClick={() => setShowApply(false)}>
          <div className="modal animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Apply for {job.title}</h2>
              <button className="modal__close" onClick={() => setShowApply(false)}>✕</button>
            </div>
            <form onSubmit={handleApply} className="modal__body">
              <div className="form-group">
                <label className="form-label">Resume (PDF/DOC)</label>
                {user?.resume?.url ? (
                  <div className="existing-resume">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                    <span>{user.resume.originalName || 'Saved Resume'}</span>
                    <span style={{ color: '#525252', fontSize: 12 }}>· Will be used</span>
                  </div>
                ) : null}
                <label className="file-drop">
                  <input type="file" accept=".pdf,.doc,.docx" onChange={e => setResumeFile(e.target.files[0])} />
                  <div className="file-drop__inner">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span>{resumeFile ? resumeFile.name : (user?.resume?.url ? 'Upload different resume' : 'Upload Resume (PDF/DOC)')}</span>
                  </div>
                </label>
              </div>
              <div className="form-group">
                <label className="form-label">Cover Letter (Optional)</label>
                <textarea
                  className="input-base"
                  rows={5}
                  placeholder="Tell the recruiter why you're a great fit..."
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="modal__footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowApply(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={applying}>
                  {applying ? <><span className="spinner dark" /> Submitting...</> : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
