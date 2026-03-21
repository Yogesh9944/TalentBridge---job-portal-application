import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import '../seeker/SeekerLayout.css';
import '../seeker/SeekerDashboard.css';

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs/recruiter/my-jobs')
      .then(({ data }) => setJobs(data.jobs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (jobId) => {
    if (!confirm('Delete this job? This cannot be undone.')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs(prev => prev.filter(j => j._id !== jobId));
      toast.success('Job deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleStatusToggle = async (job) => {
    const newStatus = job.status === 'open' ? 'closed' : 'open';
    try {
      await api.put(`/jobs/${job._id}`, { status: newStatus });
      setJobs(prev => prev.map(j => j._id === job._id ? { ...j, status: newStatus } : j));
      toast.success(`Job ${newStatus === 'open' ? 'reopened' : 'closed'}`);
    } catch {
      toast.error('Update failed');
    }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header__eyebrow">Listings</div>
        <h1 className="page-header__title">My Jobs</h1>
        <p className="page-header__subtitle">{jobs.length} jobs posted</p>
        <div className="page-header__actions">
          <Link to="/recruiter/post-job" className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            Post New Job
          </Link>
        </div>
      </div>
      <div className="page-body">
        {jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📋</div>
            <h3 className="empty-state__title">No jobs posted yet</h3>
            <p className="empty-state__desc">Create your first job listing to start receiving applications</p>
            <Link to="/recruiter/post-job" className="btn btn-primary btn-sm">Post First Job</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {jobs.map(job => (
              <div key={job._id} style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 18, transition: 'border-color 0.2s' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700 }}>{job.title}</span>
                    <span className={`badge ${job.status === 'open' ? 'badge-success' : 'badge-outline'}`}>{job.status}</span>
                    {!job.isApproved && <span className="badge badge-warning">Pending Approval</span>}
                  </div>
                  <div style={{ fontSize: 13, color: '#525252', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span>{job.location} · {job.locationType}</span>
                    <span>{job.jobType}</span>
                    <span>{job.experienceLevel}</span>
                    <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                  {job.requiredSkills?.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      {job.requiredSkills.slice(0, 5).map(s => (
                        <span key={s} style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 100, fontSize: 11, color: '#525252' }}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{job.applicationsCount || 0}</div>
                  <div style={{ fontSize: 11, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2 }}>Applicants</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                  <Link to={`/recruiter/jobs/${job._id}/applicants`} className="btn btn-secondary btn-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    Applicants
                  </Link>
                  <Link to={`/recruiter/jobs/${job._id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleStatusToggle(job)}>
                    {job.status === 'open' ? 'Close' : 'Reopen'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(job._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
