import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { styles } from '../utils/styles';

export default function ChangePassword({ onClose, onSuccess, isForced = false, t = {} }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePasswords = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return false;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return false;
    }

    if (oldPassword === newPassword) {
      setError('New password must be different from old password');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!validatePasswords()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/members/auth/change_password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      if (response.ok) {
        setSuccess('Password changed successfully!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to change password');
      }
    } catch (err) {
      setError('Error changing password: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const translations = {
    en: {
      title: isForced ? 'Change Your Password' : 'Change Password',
      subtitle: isForced
        ? 'You must change your password before continuing'
        : 'Update your password to keep your account secure',
      oldPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      changeButton: 'Change Password',
      cancel: 'Cancel',
      required: '(minimum 8 characters)',
    },
    ta: {
      title: isForced ? 'உங்கள் கடவுச்சொல்லை மாற்றவும்' : 'கடவுச்சொல் மாற்றவும்',
      subtitle: isForced
        ? 'தொடர்வதற்கு முன் உங்கள் கடவுச்சொல்லை மாற்ற வேண்டும்'
        : 'உங்கள் கணக்கைப் பாதுகாக்க உங்கள் கடவுச்சொல்லை புதுப்பிக்கவும்',
      oldPassword: 'தற்போதைய கடவுச்சொல்',
      newPassword: 'புதிய கடவுச்சொல்',
      confirmPassword: 'புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும்',
      changeButton: 'கடவுச்சொல் மாற்றவும்',
      cancel: 'ரத்துசெய்',
      required: '(குறைந்தபட்சம் 8 எழுத்துக்கள்)',
    },
  };

  const lang = Object.keys(translations).includes(Object.keys(t).length > 0 ? 'ta' : 'en') ? 'ta' : 'en';
  const trans = translations[lang];

  const containerStyle = {
    ...styles.modal,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const boxStyle = {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    maxWidth: '400px',
    width: '90%',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  };

  const subtitleStyle = {
    fontSize: '13px',
    color: '#666',
    marginBottom: '24px',
  };

  const inputGroupStyle = {
    marginBottom: '18px',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '6px',
  };

  const inputWithIconStyle = {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#f5f5f5',
    borderRadius: '6px',
    border: '1px solid #ddd',
  };

  const inputStyle = {
    flex: 1,
    padding: '10px 12px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    outline: 'none',
  };

  const toggleButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 12px',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: '12px',
    marginTop: '28px',
  };

  const submitButtonStyle = {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'disabled' ? 'not-allowed' : 'pointer',
    fontWeight: '500',
    opacity: loading ? 0.7 : 1,
    fontSize: '14px',
  };

  const cancelButtonStyle = {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: '#f0f0f0',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
  };

  const messageStyle = {
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const errorStyle = {
    ...messageStyle,
    backgroundColor: '#fee',
    color: '#c00',
    border: '1px solid #fcc',
  };

  const successStyle = {
    ...messageStyle,
    backgroundColor: '#efe',
    color: '#060',
    border: '1px solid #cfc',
  };

  return (
    <div style={containerStyle}>
      <div style={boxStyle}>
        <div style={headerStyle}>
          <Lock size={28} color="#4CAF50" />
          <h1 style={titleStyle}>{trans.title}</h1>
        </div>
        <p style={subtitleStyle}>{trans.subtitle}</p>

        {error && (
          <div style={errorStyle}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div style={successStyle}>
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        <div style={inputGroupStyle}>
          <label style={labelStyle}>{trans.oldPassword}</label>
          <div style={inputWithIconStyle}>
            <input
              type={showOldPassword ? 'text' : 'password'}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              style={inputStyle}
              placeholder="••••••••"
              disabled={loading}
            />
            <button
              onClick={() => setShowOldPassword(!showOldPassword)}
              style={toggleButtonStyle}
            >
              {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>
            {trans.newPassword} <span style={{ fontSize: '11px', color: '#999' }}>{trans.required}</span>
          </label>
          <div style={inputWithIconStyle}>
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
              placeholder="••••••••"
              disabled={loading}
            />
            <button
              onClick={() => setShowNewPassword(!showNewPassword)}
              style={toggleButtonStyle}
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>{trans.confirmPassword}</label>
          <div style={inputWithIconStyle}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
              placeholder="••••••••"
              disabled={loading}
            />
            <button
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={toggleButtonStyle}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div style={buttonGroupStyle}>
          <button
            onClick={handleSubmit}
            style={submitButtonStyle}
            disabled={loading}
          >
            {loading ? 'Changing...' : trans.changeButton}
          </button>
          {!isForced && (
            <button
              onClick={onClose}
              style={cancelButtonStyle}
              disabled={loading}
            >
              {trans.cancel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
