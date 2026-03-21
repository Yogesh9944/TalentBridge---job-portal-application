import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function RecruiterProfile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', location: '' });
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '', location: user.location || '' });
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

  const handlePwChange = async (e) => {
    e.preventDefault();
    setChangingPw(true);
    try {
      await api.put('/auth/change-password', pwForm);
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header__eyebrow">Account</div>
        <h1 className="page-header__title">My Profile</h1>
      </div>
      <div className="page-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 600 }}>
          <form onSubmit={handleSave}>
            <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontFamily: 'Syne', fontSize: 17, fontWeight: 700 }}>Personal Details</h3>
              {[
                { k: 'name', l: 'Full Name', p: 'Your name' },
                { k: 'phone', l: 'Phone', p: '+91 ...' },
                { k: 'location', l: 'Location', p: 'City, Country' },
              ].map(f => (
                <div key={f.k} className="form-group">
                  <label className="form-label">{f.l}</label>
                  <input className="input-base" placeholder={f.p} value={form[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} />
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner dark" /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
          <form onSubmit={handlePwChange}>
            <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontFamily: 'Syne', fontSize: 17, fontWeight: 700 }}>Change Password</h3>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" className="input-base" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="input-base" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} minLength={6} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-secondary" disabled={changingPw}>
                  {changingPw ? <><span className="spinner" /> Updating...</> : 'Update Password'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
