import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './BrowseJobs.css';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship'];
const LOCATION_TYPES = ['remote', 'onsite', 'hybrid'];
const EXPERIENCE_LEVELS = ['fresher', 'junior', 'mid', 'senior', 'lead'];

function JobCard({ job, onSave, savedIds }) {
  const isSaved = savedIds.includes(job._id);

  const formatSalary = (salary) => {
    if (!salary?.min && !salary?.max) return 'Salary not disclosed';
    const fmt = (n) => n >= 100000 ? `${(n / 100000).toFixed(1)}L` : `${(n / 1000).toFixed(0)}K`;
    if (salary.min && salary.max) return `₹${fmt(salary.min)} - ₹${fmt(salary.max)}`;
    if (salary.max) return `Up to ₹${fmt(salary.max)}`;
    return `₹${fmt(salary.min)}+`;
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <div className="job-card animate-fadeIn">
      <div className="job-card__top">
        <div className="job-card__logo">
          {job.company?.logo?.url ? (
            <img src={job.company.logo.url} alt={job.company.name} />
          ) : (
            <span>{job.company?.name?.charAt(0) || '?'}</span>
          )}
        </div>
        <div className="job-card__meta">
          <div className="job-card__company">{job.company?.name}</div>
          <div className="job-card__location">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {job.location}
          </div>
        </div>
        <button
          className={`save-btn ${isSaved ? 'saved' : ''}`}
          onClick={() => onSave(job._id)}
          title={isSaved ? 'Unsave' : 'Save job'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>

      <h3 className="job-card__title">{job.title}</h3>

      <div className="job-card__tags">
        <span className="tag">{job.jobType}</span>
        <span className="tag">{job.locationType}</span>
        <span className="tag">{job.experienceLevel}</span>
      </div>

      <div className="job-card__skills">
        {job.requiredSkills?.slice(0, 4).map(skill => (
          <span key={skill} className="skill-tag">{skill}</span>
        ))}
        {job.requiredSkills?.length > 4 && (
          <span className="skill-tag skill-tag--more">+{job.requiredSkills.length - 4}</span>
        )}
      </div>

      <div className="job-card__footer">
        <div className="job-card__salary">{formatSalary(job.salary)}</div>
        <div className="job-card__time">{timeAgo(job.createdAt)}</div>
      </div>

      <Link to={`/seeker/jobs/${job._id}`} className="job-card__apply-btn">
        View & Apply
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </Link>
    </div>
  );
}

export default function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [savedIds, setSavedIds] = useState([]);
  const [filters, setFilters] = useState({
    search: '', location: '', locationType: '',
    experience: '', jobType: '', salary_min: '', salary_max: '',
    sort: '-createdAt',
  });

  const fetchJobs = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 12, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const { data } = await api.get('/jobs', { params });
      setJobs(data.jobs);
      setTotal(data.total);
      setPages(data.pages);
      setPage(pg);
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchJobs(1); }, [filters]);

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      setSavedIds((data.user.savedJobs || []).map(j => j._id || j));
    }).catch(() => {});
  }, []);

  const handleSave = async (jobId) => {
    try {
      const { data } = await api.put(`/jobs/${jobId}/save`);
      setSavedIds(prev => data.saved ? [...prev, jobId] : prev.filter(id => id !== jobId));
      toast.success(data.message);
    } catch {
      toast.error('Login required to save jobs');
    }
  };

  const updateFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));
  const clearFilters = () => setFilters({ search: '', location: '', locationType: '', experience: '', jobType: '', salary_min: '', salary_max: '', sort: '-createdAt' });

  return (
    <div>
      <div className="page-header">
        <div className="page-header__eyebrow">Discover</div>
        <h1 className="page-header__title">Browse Jobs</h1>
        <p className="page-header__subtitle">{total.toLocaleString()} open positions available</p>
      </div>

      <div className="page-body">
        {/* Search bar */}
        <div className="search-bar">
          <div className="search-bar__icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <input
            type="text"
            className="search-bar__input"
            placeholder="Search jobs, skills, companies..."
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
          />
          <div className="search-bar__divider" />
          <div className="search-bar__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <input
            type="text"
            className="search-bar__input"
            placeholder="Location..."
            value={filters.location}
            onChange={e => updateFilter('location', e.target.value)}
            style={{ maxWidth: 200 }}
          />
        </div>

        <div className="jobs-layout">
          {/* Sidebar filters */}
          <aside className="filters-panel">
            <div className="filters-panel__header">
              <span className="filters-panel__title">Filters</span>
              <button className="filters-clear" onClick={clearFilters}>Clear all</button>
            </div>

            <div className="filter-group">
              <div className="filter-group__label">Sort by</div>
              <select className="input-base" value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}>
                <option value="-createdAt">Latest first</option>
                <option value="createdAt">Oldest first</option>
                <option value="-salary.max">Highest salary</option>
              </select>
            </div>

            <div className="filter-group">
              <div className="filter-group__label">Job Type</div>
              {JOB_TYPES.map(t => (
                <label key={t} className="filter-check">
                  <input
                    type="radio" name="jobType"
                    checked={filters.jobType === t}
                    onChange={() => updateFilter('jobType', filters.jobType === t ? '' : t)}
                  />
                  <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                </label>
              ))}
            </div>

            <div className="filter-group">
              <div className="filter-group__label">Work Type</div>
              {LOCATION_TYPES.map(t => (
                <label key={t} className="filter-check">
                  <input
                    type="radio" name="locationType"
                    checked={filters.locationType === t}
                    onChange={() => updateFilter('locationType', filters.locationType === t ? '' : t)}
                  />
                  <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                </label>
              ))}
            </div>

            <div className="filter-group">
              <div className="filter-group__label">Experience Level</div>
              {EXPERIENCE_LEVELS.map(t => (
                <label key={t} className="filter-check">
                  <input
                    type="radio" name="experience"
                    checked={filters.experience === t}
                    onChange={() => updateFilter('experience', filters.experience === t ? '' : t)}
                  />
                  <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                </label>
              ))}
            </div>

            <div className="filter-group">
              <div className="filter-group__label">Salary Range (LPA)</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" className="input-base" placeholder="Min" value={filters.salary_min}
                  onChange={e => updateFilter('salary_min', e.target.value)} />
                <input type="number" className="input-base" placeholder="Max" value={filters.salary_max}
                  onChange={e => updateFilter('salary_max', e.target.value)} />
              </div>
            </div>
          </aside>

          {/* Jobs grid */}
          <div className="jobs-content">
            {loading ? (
              <div className="jobs-grid">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="job-card-skeleton">
                    <div className="skeleton" style={{ height: 40, width: 40, borderRadius: 10 }} />
                    <div className="skeleton" style={{ height: 14, width: '60%', marginTop: 12 }} />
                    <div className="skeleton" style={{ height: 20, width: '80%', marginTop: 8 }} />
                    <div className="skeleton" style={{ height: 12, width: '40%', marginTop: 8 }} />
                    <div className="skeleton" style={{ height: 36, marginTop: 16 }} />
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">🔍</div>
                <h3 className="empty-state__title">No jobs found</h3>
                <p className="empty-state__desc">Try adjusting your filters or search terms</p>
                <button className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="jobs-grid">
                  {jobs.map(job => (
                    <JobCard key={job._id} job={job} onSave={handleSave} savedIds={savedIds} />
                  ))}
                </div>
                {pages > 1 && (
                  <div className="pagination">
                    <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => fetchJobs(page - 1)}>← Prev</button>
                    <span className="pagination__info">Page {page} of {pages}</span>
                    <button className="btn btn-secondary btn-sm" disabled={page === pages} onClick={() => fetchJobs(page + 1)}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
