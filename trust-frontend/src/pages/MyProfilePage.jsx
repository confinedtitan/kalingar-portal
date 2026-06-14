import React, { useState } from 'react';
import { styles } from '../utils/styles';

export default function MyProfilePage({ member, t, onChangePassword }) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  if (!member || !member.name) {
    return <div style={styles.page}><p>Loading profile...</p></div>;
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(t.passwordMismatch);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    try {
      await onChangePassword(passwordData.oldPassword, passwordData.newPassword);
      setPasswordSuccess(t.passwordChanged);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error) {
      if (error.response && error.response.data) {
        setPasswordError(error.response.data.error || 'Failed to change password');
      } else {
        setPasswordError('Failed to change password');
      }
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>{t.myProfile}</h2>

      <div style={styles.profileCard}>
        <div style={styles.profileHeader}>
          <div style={styles.profileAvatar}>{member.name.charAt(0)}</div>
          <div>
            <h3 style={styles.profileName}>{member.name}</h3>
            {(member.member_id || member.memberId) && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#eef2ff',
                color: '#4338ca',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '0.5px',
                border: '1px solid #c7d2fe',
                marginTop: '4px',
              }}>
                🆔 {member.member_id || member.memberId}
              </span>
            )}
          </div>
        </div>

        <div style={styles.profileSection}>
          <h4 style={styles.profileSectionTitle}>{t.memberDetails}</h4>
          <div style={styles.profileGrid}>
            <div style={styles.profileField}>
              <label>{t.phoneNumber}</label>
              <div>{member.phone}</div>
            </div>
            <div style={styles.profileField}>
              <label>{t.dateOfBirth}</label>
              <div>{member.date_of_birth ?? member.dob}</div>
            </div>
            <div style={styles.profileField}>
              <label>{t.address}</label>
              <div>{member.address}</div>
            </div>
          </div>
        </div>

        <div style={styles.profileSection}>
          <h4 style={styles.profileSectionTitle}>{t.familyDetails}</h4>
          <div style={styles.profileGrid}>
            <div style={styles.profileField}>
              <label>{t.fatherName}</label>
              <div>{member.fatherName || member.father_name || '-'}</div>
            </div>
            {(member.motherName || member.mother_name) && (
              <div style={styles.profileField}>
                <label>{t.motherName}</label>
                <div>{member.motherName || member.mother_name}</div>
              </div>
            )}
            {(member.spouseName || member.spouse_name) && (
              <div style={styles.profileField}>
                <label>{t.spouseName}</label>
                <div>{member.spouseName || member.spouse_name}</div>
              </div>
            )}
          </div>

          {member.children && member.children.length > 0 && (
            <div style={styles.childrenList}>
              <strong>{t.children}:</strong>
              {member.children.map((child, index) => (
                <div key={index} style={styles.profileChildItem}>
                  {child.name} ({child.gender}) - {child.date_of_birth ?? child.dob}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.profileSection}>
          <h4 style={styles.profileSectionTitle}>{t.paymentDetails}</h4>
          <div style={styles.paymentSummary}>
            <div style={styles.paymentSummaryItem}>
              <span>{t.annualTax}</span>
              <strong>₹{Number(member.annual_tax ?? member.annualTax ?? 0).toLocaleString()}</strong>
            </div>
            <div style={styles.paymentSummaryItem}>
              <span>{t.amountPaid}</span>
              <strong style={{ color: '#10b981' }}>₹{Number(member.amount_paid ?? member.amountPaid ?? 0).toLocaleString()}</strong>
            </div>
            <div style={styles.paymentSummaryItem}>
              <span>{t.amountDue}</span>
              <strong style={{ color: '#ef4444' }}>₹{Number(member.amount_due ?? member.amountDue ?? 0).toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div style={styles.profileSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={styles.profileSectionTitle}>{t.changePassword}</h4>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '13px',
                }}
              >
                🔑 {t.changePassword}
              </button>
            )}
          </div>

          {passwordSuccess && (
            <div style={{
              padding: '10px 16px',
              backgroundColor: '#dcfce7',
              color: '#166534',
              borderRadius: '8px',
              marginTop: '12px',
              fontSize: '14px',
            }}>
              ✅ {passwordSuccess}
            </div>
          )}

          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit} style={{ marginTop: '16px' }}>
              {passwordError && (
                <div style={{
                  padding: '10px 16px',
                  backgroundColor: '#fef2f2',
                  color: '#991b1b',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  fontSize: '14px',
                }}>
                  ❌ {passwordError}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                    {t.oldPassword}
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                    {t.newPassword}
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                    {t.confirmPassword}
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button type="submit" style={{
                    padding: '10px 20px',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                  }}>
                    {t.save}
                  </button>
                  <button type="button" onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordError('');
                    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                  }} style={{
                    padding: '10px 20px',
                    backgroundColor: '#e5e7eb',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                  }}>
                    {t.cancel}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
