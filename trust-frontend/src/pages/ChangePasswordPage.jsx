import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { styles } from '../utils/styles';

/**
 * Standalone Change Password page — accessible from the sidebar for all user
 * roles (Admin, Accountant, Member). Not a modal; not forced.
 */
export default function ChangePasswordPage({ t, language = 'en' }) {
  const [oldPassword, setOldPassword]       = useState('');
  const [newPassword, setNewPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld]               = useState(false);
  const [showNew, setShowNew]               = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const tr = {
    en: {
      title: 'Change Password',
      subtitle: 'Update your password to keep your account secure',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      minLength: '(minimum 8 characters)',
      changeBtn: 'Change Password',
      clearBtn: 'Clear',
      successMsg: 'Password changed successfully!',
      errRequired: 'All fields are required.',
      errMinLength: 'New password must be at least 8 characters.',
      errMismatch: 'New passwords do not match.',
      errSame: 'New password must be different from the current password.',
    },
    ta: {
      title: 'கடவுச்சொல் மாற்றவும்',
      subtitle: 'உங்கள் கணக்கைப் பாதுகாக்க கடவுச்சொல்லை புதுப்பிக்கவும்',
      currentPassword: 'தற்போதைய கடவுச்சொல்',
      newPassword: 'புதிய கடவுச்சொல்',
      confirmPassword: 'புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும்',
      minLength: '(குறைந்தபட்சம் 8 எழுத்துக்கள்)',
      changeBtn: 'கடவுச்சொல் மாற்றவும்',
      clearBtn: 'அழிக்கவும்',
      successMsg: 'கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது!',
      errRequired: 'அனைத்து புலங்களும் தேவை.',
      errMinLength: 'புதிய கடவுச்சொல் குறைந்தபட்சம் 8 எழுத்துக்கள் இருக்க வேண்டும்.',
      errMismatch: 'புதிய கடவுச்சொற்கள் பொருந்தவில்லை.',
      errSame: 'புதிய கடவுச்சொல் தற்போதைய கடவுச்சொல்லிலிருந்து வேறுபட வேண்டும்.',
    },
  };

  const s = tr[language === 'ta' ? 'ta' : 'en'];

  const validate = () => {
    if (!oldPassword || !newPassword || !confirmPassword) { setError(s.errRequired); return false; }
    if (newPassword.length < 8) { setError(s.errMinLength); return false; }
    if (newPassword !== confirmPassword) { setError(s.errMismatch); return false; }
    if (oldPassword === newPassword) { setError(s.errSame); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validate()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/members/auth/change_password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      });
      if (res.ok) {
        setSuccess(s.successMsg);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to change password.');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    setError(''); setSuccess('');
  };

  const fieldStyle = {
    display: 'flex', alignItems: 'center',
    backgroundColor: '#f9fafb', borderRadius: '8px',
    border: '1px solid #e5e7eb', overflow: 'hidden',
  };

  const inputStyle = {
    flex: 1, padding: '10px 14px', border: 'none',
    backgroundColor: 'transparent', fontSize: '14px', outline: 'none',
  };

  const toggleBtn = {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '0 12px', color: '#6b7280', display: 'flex', alignItems: 'center',
  };

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>🔑 {s.title}</h2>
      </div>

      <div style={{
        maxWidth: '480px',
        background: 'white',
        borderRadius: '16px',
        padding: '36px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Lock size={24} color="#6366f1" />
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>{s.title}</h3>
        </div>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '28px' }}>{s.subtitle}</p>

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 16px', backgroundColor: '#fef2f2',
            border: '1px solid #fecaca', borderRadius: '8px',
            color: '#991b1b', fontSize: '13px', marginBottom: '20px',
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {success && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 16px', backgroundColor: '#f0fdf4',
            border: '1px solid #86efac', borderRadius: '8px',
            color: '#166534', fontSize: '13px', marginBottom: '20px',
          }}>
            <CheckCircle size={16} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Current Password */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              {s.currentPassword}
            </label>
            <div style={fieldStyle}>
              <input
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                style={inputStyle}
                placeholder="••••••••"
                disabled={loading}
                autoComplete="current-password"
              />
              <button type="button" style={toggleBtn} onClick={() => setShowOld(!showOld)}>
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              {s.newPassword} <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '400' }}>{s.minLength}</span>
            </label>
            <div style={fieldStyle}>
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={inputStyle}
                placeholder="••••••••"
                disabled={loading}
                autoComplete="new-password"
              />
              <button type="button" style={toggleBtn} onClick={() => setShowNew(!showNew)}>
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              {s.confirmPassword}
            </label>
            <div style={fieldStyle}>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={inputStyle}
                placeholder="••••••••"
                disabled={loading}
                autoComplete="new-password"
              />
              <button type="button" style={toggleBtn} onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1, padding: '11px 20px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: 'white', border: 'none', borderRadius: '8px',
                fontWeight: '600', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? '⏳...' : `🔑 ${s.changeBtn}`}
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={loading}
              style={{
                padding: '11px 20px', background: '#f3f4f6', color: '#374151',
                border: '1px solid #e5e7eb', borderRadius: '8px',
                fontWeight: '600', fontSize: '14px', cursor: 'pointer',
              }}
            >
              {s.clearBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
