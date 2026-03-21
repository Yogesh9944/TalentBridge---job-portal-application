// CompanyProfile.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function CompanyProfile() {
  const { refreshUser } = useAuth();
  const [company, setCompany] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', website: '', location: '', industry: '', size: '11-50', founded: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    api.get('/companies/my')
      .then(({ data }) => {
        setCompany(data.company);
        setForm({ name: data.company.name || '', description: data.company.description || '', website: data.company.website || '', location: data.company.location || '', industry: data.company.industry || '', size: data.company.size || '11-50', founded: data.company.founded || '' });
      })
      .catch(() => setIsNew(true))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        const { data } = await api.post('/companies', form);
        setCompany(data.company);
        setIsNew(false);
        await refreshUser();
        toast.success('Company profile created!');
      } else {
        const { data } = await api.put(`/companies/${company._id}`, form);
        setCompany(data.company);
        toast.success('Company updated!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header__eyebrow">Organization</div>
        <h1 className="page-header__title">Company Profile</h1>
        <p className="page-header__subtitle">{isNew ? 'Set up your company to start posting jobs' : 'Manage your company information'}</p>
      </div>
      <div className="page-body">
        <form onSubmit={handleSave} style={{ maxWidth: 700 }}>
          <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontFamily: 'Syne', fontSize: 17, fontWeight: 700 }}>Company Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Company Name *</label>
                <input className="input-base" placeholder="Acme Corp" value={form.name} onChange={e => up('name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Industry</label>
                <input className="input-base" placeholder="Technology, Finance..." value={form.industry} onChange={e => up('industry', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Company Size</label>
                <select className="input-base" value={form.size} onChange={e => up('size', e.target.value)}>
                  {['1-10','11-50','51-200','201-500','500+'].map(s => <option key={s} value={s}>{s} employees</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="input-base" placeholder="Bangalore, India" value={form.location} onChange={e => up('location', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Founded Year</label>
                <input className="input-base" type="number" placeholder="2020" value={form.founded} onChange={e => up('founded', e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Website</label>
                <input className="input-base" placeholder="https://yourcompany.com" value={form.website} onChange={e => up('website', e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">About the Company</label>
                <textarea className="input-base" rows={5} placeholder="Tell candidates what your company does..." value={form.description} onChange={e => up('description', e.target.value)} style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><span className="spinner dark" /> Saving...</> : (isNew ? 'Create Company' : 'Save Changes')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
