import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import '../seeker/SeekerLayout.css';
import './AdminUsers.css';

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchJobs = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/admin/jobs', { params });
      setJobs(data.jobs);
      setTotal(data.total);
      setPages(data.pages);
      setPage(pg);
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchJobs(1); }, [fetchJobs]);

  const handleToggleApproval = async (jobId, currentState) => {
    setActionLoading(jobId + 'approve');
    try {
      const { data } = await api.put(`/admin/jobs/${jobId}/approve`);
      setJobs(prev => prev.map(j => j._id === jobId ? { ...j, isApproved: data.isApproved } : j));
      toast.success(data.message);
    } catch {
      toast.error('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (jobId, title) => {
    if (!confirm(`Delete job "${title}"?`)) return;
    setActionLoading(jobId + 'delete');
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs(prev => prev.filter(j => j._id !== jobId));
      setTotal(t => t - 1);
      toast.success('Job deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setActionLoading(null);
    }
  };

  const formatSalary = (salary) => {
    if (!salary?.min && !salary?.max) return '—';
    const fmt = (n) => n >= 100000 ? `${(n / 100000).toFixed(0)}L` : `${(n / 1000).toFixed(0)}K`;
    if (salary.min && salary.max) return `₹${fmt(salary.min)}–${fmt(salary.max)}`;
    return salary.max ? `Up to ₹${fmt(salary.max)}` : `₹${fmt(salary.min)}+`;
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header__eyebrow">Administration</div>
        <h1 className="page-header__title">Job Listings</h1>
        <p className="page-header__subtitle">{total.toLocaleString()} total jobs on platform</p>
      </div>

      <div className="page-body">
        {/* Status filter */}
        <div className="admin-filters">
          <div className="role-filter-tabs">
            {[
              { value: '', label: 'All Jobs' },
              { value: 'open', label: '🟢 Open' },
              { value: 'closed', label: '🔴 Closed' },
              { value: 'draft', label: '⚪ Draft' },
            ].map(f => (
              <button
                key={f.value}
                className={`role-filter-btn ${statusFilter === f.value ? 'active' : ''}`}
                onClick={() => setStatusFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 13, color: '#404040', marginLeft: 'auto' }}>
            {total} results
          </span>
        </div>

        {/* Table */}
        <div className="admin-table-wrap">
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">📋</div>
              <h3 className="empty-state__title">No jobs found</h3>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Posted By</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Applicants</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job._id}>
                    <td>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{job.title}</div>
                        <div style={{ fontSize: 12, color: '#525252', marginTop: 2 }}>
                          {job.location} · {job.jobType} · {job.experienceLevel}
                        </div>
                        {job.requiredSkills?.length > 0 && (
                          <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
                            {job.requiredSkills.slice(0, 3).map(s => (
                              <span key={s} style={{ padding: '1px 7px', background: 'rgba(255,255,255,0.04)', borderRadius: 100, fontSize: 10, color: '#404040' }}>{s}</span>
                            ))}
                            {job.requiredSkills.length > 3 && (
                              <span style={{ fontSize: 10, color: '#404040' }}>+{job.requiredSkills.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{job.company?.name || '—'}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>{job.postedBy?.name || '—'}</div>
                      <div style={{ fontSize: 11, color: '#525252' }}>{job.postedBy?.email || ''}</div>
                    </td>
                    <td style={{ fontSize: 13, color: '#a3a3a3' }}>
                      {formatSalary(job.salary)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span className={`badge ${job.status === 'open' ? 'badge-success' : 'badge-outline'}`} style={{ textTransform: 'capitalize' }}>
                          {job.status}
                        </span>
                        {!job.isApproved && (
                          <span className="badge badge-warning">Unapproved</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 800, color: '#d4d4d4' }}>
                        {job.applicationsCount || 0}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button
                          className={`admin-action-btn ${job.isApproved ? 'block' : 'approve'}`}
                          disabled={actionLoading === job._id + 'approve'}
                          onClick={() => handleToggleApproval(job._id, job.isApproved)}
                        >
                          {actionLoading === job._id + 'approve' ? (
                            <span className="spinner" style={{ width: 12, height: 12 }} />
                          ) : job.isApproved ? 'Unapprove' : '✓ Approve'}
                        </button>
                        <button
                          className="admin-action-btn delete"
                          disabled={actionLoading === job._id + 'delete'}
                          onClick={() => handleDelete(job._id, job.title)}
                        >
                          {actionLoading === job._id + 'delete' ? <span className="spinner" style={{ width: 12, height: 12 }} /> : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 24 }}>
            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => fetchJobs(page - 1)}>← Prev</button>
            <span style={{ fontSize: 13, color: '#525252' }}>Page {page} of {pages}</span>
            <button className="btn btn-secondary btn-sm" disabled={page === pages} onClick={() => fetchJobs(page + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
