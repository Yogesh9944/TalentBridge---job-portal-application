import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import '../seeker/SeekerLayout.css';

const FIELD = (label, key, type = 'text', placeholder = '', opts = {}) => ({ label, key, type, placeholder, ...opts });

export default function PostJob() {
  const navigate = useNavigate();
  const { id } = useParams(); // edit mode if id exists
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: '', description: '', requirements: '',
    requiredSkills: '', location: '', locationType: 'onsite',
    experienceLevel: 'mid', jobType: 'full-time', category: '',
    salary_min: '', salary_max: '', salary_period: 'yearly',
    exp_min: '0', exp_max: '5', deadline: '',
  });
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    if (isEdit) {
      api.get(`/jobs/${id}`).then(({ data }) => {
        const j = data.job;
        setForm({
          title: j.title || '', description: j.description || '', requirements: j.requirements || '',
          location: j.location || '', locationType: j.locationType || 'onsite',
          experienceLevel: j.experienceLevel || 'mid', jobType: j.jobType || 'full-time',
          category: j.category || '', salary_min: j.salary?.min || '',
          salary_max: j.salary?.max || '', salary_period: j.salary?.period || 'yearly',
          exp_min: j.experienceYears?.min || '0', exp_max: j.experienceYears?.max || '5',
          deadline: j.deadline ? j.deadline.split('T')[0] : '',
          requiredSkills: '',
        });
        setSkills(j.requiredSkills || []);
      });
    }
  }, [id]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) { setSkills([...skills, s]); }
    setSkillInput('');
  };

  const removeSkill = (s) => setSkills(skills.filter(x => x !== s));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.location) {
      toast.error('Please fill required fields');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        requiredSkills: skills,
        salary: { min: parseInt(form.salary_min) || 0, max: parseInt(form.salary_max) || 0, period: form.salary_period },
        experienceYears: { min: parseInt(form.exp_min), max: parseInt(form.exp_max) },
      };
      if (isEdit) {
        await api.put(`/jobs/${id}`, payload);
        toast.success('Job updated!');
      } else {
        await api.post('/jobs', payload);
        toast.success('Job posted successfully! 🎉');
      }
      navigate('/recruiter/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  const up = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div>
      <div className="page-header">
        <div className="page-header__eyebrow">{isEdit ? 'Edit Listing' : 'New Listing'}</div>
        <h1 className="page-header__title">{isEdit ? 'Edit Job Post' : 'Post a New Job'}</h1>
        <p className="page-header__subtitle">Fill in the details to attract the right candidates</p>
      </div>
      <div className="page-body">
        <form onSubmit={handleSubmit} style={{ maxWidth: 760 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Basic Info */}
            <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 28 }}>
              <h3 style={{ fontFamily: 'Syne', fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Basic Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Job Title *</label>
                  <input className="input-base" placeholder="e.g. Senior React Developer" value={form.title} onChange={e => up('title', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input className="input-base" placeholder="e.g. Engineering, Design" value={form.category} onChange={e => up('category', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Type</label>
                  <select className="input-base" value={form.jobType} onChange={e => up('jobType', e.target.value)}>
                    {['full-time','part-time','contract','internship'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input className="input-base" placeholder="Mumbai, India" value={form.location} onChange={e => up('location', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Work Mode</label>
                  <select className="input-base" value={form.locationType} onChange={e => up('locationType', e.target.value)}>
                    {['onsite','remote','hybrid'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 28 }}>
              <h3 style={{ fontFamily: 'Syne', fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Job Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Job Description *</label>
                  <textarea className="input-base" rows={6} placeholder="Describe the role, responsibilities, and what the team does..." value={form.description} onChange={e => up('description', e.target.value)} style={{ resize: 'vertical' }} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Requirements</label>
                  <textarea className="input-base" rows={4} placeholder="List qualifications, education, certifications..." value={form.requirements} onChange={e => up('requirements', e.target.value)} style={{ resize: 'vertical' }} />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 28 }}>
              <h3 style={{ fontFamily: 'Syne', fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Required Skills</h3>
              <p style={{ fontSize: 13, color: '#525252', marginBottom: 16 }}>These skills are used for AI resume matching</p>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <input className="input-base" placeholder="Add a skill (e.g. React)" value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); }}} />
                <button type="button" className="btn btn-secondary" onClick={addSkill}>Add</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {skills.map(s => (
                  <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 100, fontSize: 13 }}>
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} style={{ background: 'none', border: 'none', color: '#525252', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>✕</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Salary & Experience */}
            <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 28 }}>
              <h3 style={{ fontFamily: 'Syne', fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Compensation & Experience</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Min Salary (₹)</label>
                  <input className="input-base" type="number" placeholder="500000" value={form.salary_min} onChange={e => up('salary_min', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Salary (₹)</label>
                  <input className="input-base" type="number" placeholder="1000000" value={form.salary_max} onChange={e => up('salary_max', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Period</label>
                  <select className="input-base" value={form.salary_period} onChange={e => up('salary_period', e.target.value)}>
                    <option value="yearly">Per Year</option>
                    <option value="monthly">Per Month</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Experience Level</label>
                  <select className="input-base" value={form.experienceLevel} onChange={e => up('experienceLevel', e.target.value)}>
                    {['fresher','junior','mid','senior','lead'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Min Years</label>
                  <input className="input-base" type="number" min="0" value={form.exp_min} onChange={e => up('exp_min', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Years</label>
                  <input className="input-base" type="number" min="0" value={form.exp_max} onChange={e => up('exp_max', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Application Deadline</label>
                  <input className="input-base" type="date" value={form.deadline} onChange={e => up('deadline', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/recruiter/jobs')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner dark" /> {isEdit ? 'Updating...' : 'Publishing...'}</> : (isEdit ? 'Update Job' : 'Publish Job')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
