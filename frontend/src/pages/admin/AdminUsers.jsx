import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import '../seeker/SeekerLayout.css';
import './AdminUsers.css';

const ROLE_BADGE = {
  seeker: { label: 'Seeker', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)' },
  recruiter: { label: 'Recruiter', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
  admin: { label: 'Admin', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' },
};

export default function AdminUsers() {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || '');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 15 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const { data } = await api.get('/admin/users', { params });
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
      setPage(pg);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  const handleBlock = async (userId, isBlocked) => {
    setActionLoading(userId + 'block');
    try {
      const { data } = await api.put(`/admin/users/${userId}/toggle-block`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBlocked: data.isBlocked } : u));
      toast.success(data.message);
    } catch {
      toast.error('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (userId) => {
    setActionLoading(userId + 'approve');
    try {
      await api.put(`/admin/users/${userId}/approve`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isApproved: true } : u));
      toast.success('Recruiter approved!');
    } catch {
      toast.error('Approval failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId, name) => {
    if (!confirm(`Delete user "${name}"? This is permanent.`)) return;
    setActionLoading(userId + 'delete');
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      setTotal(t => t - 1);
      toast.success('User deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingRecruiters = users.filter(u => u.role === 'recruiter' && !u.isApproved);

  return (
    <div>
      <div className="page-header">
        <div className="page-header__eyebrow">Administration</div>
        <h1 className="page-header__title">User Management</h1>
        <p className="page-header__subtitle">{total.toLocaleString()} registered users</p>
      </div>

      <div className="page-body">
        {/* Pending approvals banner */}
        {pendingRecruiters.length > 0 && (
          <div className="pending-banner">
            <div className="pending-banner__icon">⏳</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                {pendingRecruiters.length} Recruiter{pendingRecruiters.length > 1 ? 's' : ''} Awaiting Approval
              </div>
              <div style={{ fontSize: 13, color: '#a3a3a3' }}>
                {pendingRecruiters.map(u => u.name).join(', ')}
              </div>
            </div>
            <button className="btn btn-sm" style={{ background: '#f59e0b', color: '#000', marginLeft: 'auto' }}
              onClick={() => setRoleFilter('recruiter')}>
              View Recruiters
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="admin-filters">
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#404040' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              className="input-base"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>
          <div className="role-filter-tabs">
            {['', 'seeker', 'recruiter'].map(r => (
              <button
                key={r}
                className={`role-filter-btn ${roleFilter === r ? 'active' : ''}`}
                onClick={() => setRoleFilter(r)}
              >
                {r === '' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1) + 's'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="admin-table-wrap">
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">👤</div>
              <h3 className="empty-state__title">No users found</h3>
              <p className="empty-state__desc">Try adjusting your search or filters</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Company</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const roleBadge = ROLE_BADGE[user.role] || ROLE_BADGE.seeker;
                  return (
                    <tr key={user._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="user-avatar">
                            {user.profilePicture ? (
                              <img src={user.profilePicture} alt="" />
                            ) : (
                              <span>{user.name?.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{user.name}</div>
                            <div style={{ fontSize: 12, color: '#525252' }}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: 100,
                          fontSize: 11,
                          fontWeight: 700,
                          background: roleBadge.bg,
                          color: roleBadge.color,
                          border: `1px solid ${roleBadge.border}`,
                        }}>
                          {roleBadge.label}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: '#737373' }}>
                        {user.company?.name || '—'}
                      </td>
                      <td style={{ fontSize: 13, color: '#525252' }}>
                        {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {user.isBlocked ? (
                            <span className="badge badge-danger">Blocked</span>
                          ) : (
                            <span className="badge badge-success">Active</span>
                          )}
                          {user.role === 'recruiter' && !user.isApproved && (
                            <span className="badge badge-warning">Pending</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {/* Approve recruiter */}
                          {user.role === 'recruiter' && !user.isApproved && (
                            <button
                              className="admin-action-btn approve"
                              disabled={actionLoading === user._id + 'approve'}
                              onClick={() => handleApprove(user._id)}
                            >
                              {actionLoading === user._id + 'approve' ? <span className="spinner" style={{ width: 12, height: 12 }} /> : '✓ Approve'}
                            </button>
                          )}
                          {/* Block / Unblock */}
                          <button
                            className={`admin-action-btn ${user.isBlocked ? 'unblock' : 'block'}`}
                            disabled={actionLoading === user._id + 'block'}
                            onClick={() => handleBlock(user._id, user.isBlocked)}
                          >
                            {actionLoading === user._id + 'block' ? (
                              <span className="spinner" style={{ width: 12, height: 12 }} />
                            ) : user.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                          {/* Delete */}
                          <button
                            className="admin-action-btn delete"
                            disabled={actionLoading === user._id + 'delete'}
                            onClick={() => handleDelete(user._id, user.name)}
                          >
                            {actionLoading === user._id + 'delete' ? <span className="spinner" style={{ width: 12, height: 12 }} /> : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 24 }}>
            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => fetchUsers(page - 1)}>← Prev</button>
            <span style={{ fontSize: 13, color: '#525252' }}>Page {page} of {pages}</span>
            <button className="btn btn-secondary btn-sm" disabled={page === pages} onClick={() => fetchUsers(page + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
