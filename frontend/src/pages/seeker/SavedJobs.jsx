// SavedJobs.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      setSavedJobs(data.user.savedJobs || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (jobId) => {
    try {
      await api.put(`/jobs/${jobId}/save`);
      setSavedJobs(prev => prev.filter(j => j._id !== jobId));
      toast.success('Job removed from saved');
    } catch {
      toast.error('Failed to unsave');
    }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header__eyebrow">Wishlist</div>
        <h1 className="page-header__title">Saved Jobs</h1>
        <p className="page-header__subtitle">{savedJobs.length} saved positions</p>
      </div>
      <div className="page-body">
        {savedJobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🔖</div>
            <h3 className="empty-state__title">No saved jobs yet</h3>
            <p className="empty-state__desc">Browse jobs and click the bookmark icon to save them for later</p>
            <Link to="/seeker/jobs" className="btn btn-primary btn-sm">Browse Jobs</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {savedJobs.map(job => job && (
              <div key={job._id} style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#a3a3a3', flexShrink: 0 }}>
                  {job.company?.name?.charAt(0) || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{job.title}</div>
                  <div style={{ fontSize: 13, color: '#525252', marginTop: 2 }}>{job.location} · {job.jobType}</div>
                </div>
                <span className={`badge ${job.status === 'open' ? 'badge-success' : 'badge-danger'}`}>
                  {job.status}
                </span>
                <Link to={`/seeker/jobs/${job._id}`} className="btn btn-secondary btn-sm">View</Link>
                <button className="btn btn-sm" style={{ color: '#525252', background: 'none', border: 'none' }} onClick={() => handleUnsave(job._id)} title="Remove">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
