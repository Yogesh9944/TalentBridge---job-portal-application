import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function SeekerProfile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ name: '', title: '', bio: '', phone: '', location: '', skills: '' });
  const [saving, setSaving] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        title: user.title || '',
        bio: user.bio || '',
        phone: user.phone || '',
        location: user.location || '',
        skills: (user.skills || []).join(', '),
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/profile', form);
      await refreshUser();
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('resume', resumeFile);
      await api.post('/resume/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await refreshUser();
      toast.success('Resume uploaded!');
      setResumeFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header__eyebrow">Account</div>
        <h1 className="page-header__title">My Profile</h1>
        <p className="page-header__subtitle">Manage your professional information</p>
      </div>
      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 900 }}>
          {/* Profile form */}
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 28 }}>
              <h3 style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Personal Information</h3>
              <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { key: 'name', label: 'Full Name', placeholder: 'John Doe', col: 1 },
                  { key: 'title', label: 'Job Title', placeholder: 'Full Stack Developer', col: 1 },
                  { key: 'phone', label: 'Phone', placeholder: '+91 9876543210', col: 1 },
                  { key: 'location', label: 'Location', placeholder: 'Mumbai, India', col: 1 },
                ].map(f => (
                  <div key={f.key} className="form-group">
                    <label className="form-label">{f.label}</label>
                    <input type="text" className="input-base" placeholder={f.placeholder}
                      value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                  </div>
                ))}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Professional Bio</label>
                  <textarea className="input-base" rows={4} placeholder="Tell recruiters about yourself..."
                    value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} style={{ resize: 'vertical' }} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Skills <span style={{ color: '#404040', fontWeight: 400 }}>(comma separated)</span></label>
                  <input type="text" className="input-base" placeholder="React, Node.js, Python, MongoDB..."
                    value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />
                  {form.skills && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      {form.skills.split(',').filter(Boolean).map(s => (
                        <span key={s} style={{ padding: '3px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, fontSize: 12, color: '#a3a3a3' }}>
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <><span className="spinner dark" /> Saving...</> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Resume upload */}
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 28 }}>
              <h3 style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Resume</h3>
              {user?.resume?.url && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, marginBottom: 16 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                  <span style={{ fontSize: 14, color: '#22c55e', flex: 1 }}>Current: {user.resume.originalName || 'Resume on file'}</span>
                  <a href={user.resume.url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">View</a>
                </div>
              )}
              <div style={{ display: 'flex', gap: 12 }}>
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: '1.5px dashed rgba(255,255,255,0.1)', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s' }}>
                  <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => setResumeFile(e.target.files[0])} />
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#525252' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span style={{ fontSize: 14, color: resumeFile ? '#a3a3a3' : '#525252' }}>{resumeFile ? resumeFile.name : 'Choose resume file (PDF/DOC)'}</span>
                </label>
                <button className="btn btn-primary" onClick={handleResumeUpload} disabled={!resumeFile || uploading}>
                  {uploading ? <><span className="spinner dark" /> Uploading...</> : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
