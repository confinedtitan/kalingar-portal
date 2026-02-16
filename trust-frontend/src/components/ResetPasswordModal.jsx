import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Lock, Copy } from 'lucide-react';

export default function ResetPasswordModal({ member, onClose, onSuccess, t = {} }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const translations = {
    en: {
      title: 'Reset Member Password',
      confirm: 'Are you sure you want to reset the password for',
      temporary: 'Temporary Password',
      copyButton: 'Copy Password',
      copiedMessage: 'Password copied to clipboard!',
      resetButton: 'Confirm Reset',
      cancel: 'Cancel',
      successMessage: 'Password reset successfully!',
      instruction: 'Member will need to change this password on their next login',
    },
    ta: {
      title: 'உறுப்பினர் கடவுச்சொல் மீட்டமைக்கவும்',
      confirm: 'இந்த உறுப்பினருக்கான கடவுச்சொல்லை மீட்டமைக்க விரும்புகிறீர்களா',
      temporary: 'தற்காலிக கடவுச்சொல்',
      copyButton: 'கடவுச்சொல்லை நகலெடுக்கவும்',
      copiedMessage: 'கடவுச்சொல் அட்டவணையில் நகலெடுக்கப்பட்டது!',
      resetButton: 'மீட்டமைப்பை உறுதிப்படுத்தவும்',
      cancel: 'ரத்துசெய்',
      successMessage: 'கடவுச்சொல் வெற்றிகரமாக மீட்டமைக்கப்பட்டது!',
      instruction: 'உறுப்பினர் அவர்களின் அடுத்த உள்நுழைவில் இந்த கடவுச்சொல்லை மாற்ற வேண்டும்',
    },
  };

  const lang = t.login === 'Login' ? 'en' : 'ta';
  const trans = translations[lang];

  const handleResetPassword = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/members/auth/reset_password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          member_id: member.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTemporaryPassword(data.temporary_password);
        setSuccess(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Error resetting password: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(temporaryPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const boxStyle = {
    backgroundColor: '#fff',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    maxWidth: '450px',
    width: '90%',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  };

  const titleStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  };

  const messageStyle = {
    padding: '12px 14px',
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

  const passwordBoxStyle = {
    backgroundColor: '#f5f5f5',
    padding: '12px 14px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  };

  const passwordStyle = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'monospace',
    flex: 1,
  };

  const copyButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
  };

  const instructionStyle = {
    fontSize: '12px',
    color: '#666',
    backgroundColor: '#f9f9f9',
    padding: '10px 12px',
    borderRadius: '6px',
    marginBottom: '16px',
    border: '1px solid #eee',
  };

  const confirmTextStyle = {
    fontSize: '14px',
    color: '#333',
    marginBottom: '16px',
    fontWeight: '500',
  };

  const memberNameStyle = {
    fontWeight: 'bold',
    color: '#2196f3',
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: '12px',
  };

  const confirmButtonStyle = {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: '#f97316',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: loading ? 'not-allowed' : 'pointer',
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

  return (
    <div style={containerStyle}>
      <div style={boxStyle}>
        {!success ? (
          <>
            <div style={headerStyle}>
              <Lock size={24} color="#f97316" />
              <h2 style={titleStyle}>{trans.title}</h2>
            </div>

            {error && (
              <div style={errorStyle}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div style={confirmTextStyle}>
              {trans.confirm}{' '}
              <span style={memberNameStyle}>{member.name}</span>
              ?
            </div>

            <div style={instructionStyle}>
              ℹ️ {trans.instruction}
            </div>

            <div style={buttonGroupStyle}>
              <button
                onClick={handleResetPassword}
                style={confirmButtonStyle}
                disabled={loading}
              >
                {loading ? 'Resetting...' : trans.resetButton}
              </button>
              <button
                onClick={onClose}
                style={cancelButtonStyle}
                disabled={loading}
              >
                {trans.cancel}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={headerStyle}>
              <CheckCircle size={24} color="#4CAF50" />
              <h2 style={titleStyle}>Success!</h2>
            </div>

            <div style={successStyle}>
              <CheckCircle size={16} />
              {trans.successMessage}
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '6px', display: 'block' }}>
                {trans.temporary}:
              </label>
              <div style={passwordBoxStyle}>
                <span style={passwordStyle}>{temporaryPassword}</span>
                <button
                  onClick={copyToClipboard}
                  style={copyButtonStyle}
                  title={trans.copyButton}
                >
                  <Copy size={18} />
                </button>
              </div>
              {copied && (
                <div style={{ ...successStyle, marginBottom: '16px' }}>
                  <CheckCircle size={14} />
                  {trans.copiedMessage}
                </div>
              )}
            </div>

            <div style={instructionStyle}>
              ℹ️ {trans.instruction}
            </div>

            <button
              onClick={onSuccess}
              style={{
                ...confirmButtonStyle,
                backgroundColor: '#4CAF50',
                flex: 1,
              }}
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}
