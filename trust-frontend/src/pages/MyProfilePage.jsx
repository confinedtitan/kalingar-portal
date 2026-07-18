import React, { useState } from 'react';
import { styles } from '../utils/styles';
import { formatDate } from '../utils/dateFormatter';

export default function MyProfilePage({ member, t, onEditProfile, onChangePassword }) {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ ...styles.pageTitle, margin: 0 }}>{t.myProfile}</h2>
        <button
          onClick={() => onEditProfile(member)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          ✏️ {t.edit || 'Edit'}
        </button>
      </div>

      {member.profile_update_status === 'Pending' && (
        <div style={{
          padding: '12px 20px',
          backgroundColor: '#fffbeb',
          border: '1px solid #fef3c7',
          borderRadius: '8px',
          color: '#b45309',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⚠️ {t.pendingApproval || 'Your profile update request is pending approval by admin/staff.'}
        </div>
      )}

      <div style={styles.profileCard}>
        <div style={styles.profileHeader}>
          <div style={styles.profileAvatar}>{member.name.charAt(0)}</div>
          <div>
            <h3 style={styles.profileName}>{member.name}</h3>
            {(member.name_ta || member.nameTa) && (
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '2px' }}>
                {member.name_ta || member.nameTa}
              </div>
            )}
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
            {(member.reference_id || member.referenceId) && (
              <div style={styles.profileField}>
                <label>{t.referenceId || 'Reference ID'}</label>
                <div>{member.reference_id || member.referenceId}</div>
              </div>
            )}
            <div style={styles.profileField}>
              <label>{t.dateOfBirth}</label>
              <div>{formatDate(member.date_of_birth ?? member.dob) || '-'}</div>
            </div>
            <div style={styles.profileField}>
              <label>{t.addressEnglish || t.address}</label>
              <div>{member.address}</div>
            </div>
            {(member.address_ta || member.addressTa) && (
              <div style={styles.profileField}>
                <label>{t.addressTamil || 'Address (Tamil)'}</label>
                <div>{member.address_ta || member.addressTa}</div>
              </div>
            )}
          </div>
        </div>

        <div style={styles.profileSection}>
          <h4 style={styles.profileSectionTitle}>{t.familyDetails}</h4>
          <div style={styles.profileGrid}>
            <div style={styles.profileField}>
              <label>{t.fatherNameEnglish || t.fatherName}</label>
              <div>{member.fatherName || member.father_name || '-'}</div>
            </div>
            {(member.father_name_ta || member.fatherNameTa) && (
              <div style={styles.profileField}>
                <label>{t.fatherNameTamil || "Father's Name (Tamil)"}</label>
                <div>{member.father_name_ta || member.fatherNameTa}</div>
              </div>
            )}
            {(member.motherName || member.mother_name) && (
              <div style={styles.profileField}>
                <label>{t.motherNameEnglish || t.motherName}</label>
                <div>{member.motherName || member.mother_name}</div>
              </div>
            )}
            {(member.mother_name_ta || member.motherNameTa) && (
              <div style={styles.profileField}>
                <label>{t.motherNameTamil || "Mother's Name (Tamil)"}</label>
                <div>{member.mother_name_ta || member.motherNameTa}</div>
              </div>
            )}
            {(member.spouseName || member.spouse_name) && (
              <div style={styles.profileField}>
                <label>{t.spouseNameEnglish || t.spouseName}</label>
                <div>{member.spouseName || member.spouse_name}</div>
              </div>
            )}
            {(member.spouse_name_ta || member.spouseNameTa) && (
              <div style={styles.profileField}>
                <label>{t.spouseNameTamil || "Spouse's Name (Tamil)"}</label>
                <div>{member.spouse_name_ta || member.spouseNameTa}</div>
              </div>
            )}
          </div>

          {member.children && member.children.length > 0 && (
            <div style={styles.childrenList}>
              <strong>{t.children}:</strong>
              {member.children.map((child, index) => (
                <div key={index} style={styles.profileChildItem}>
                  {child.name} ({child.gender}) - {formatDate(child.date_of_birth ?? child.dob)} - {child.marital_status || 'Unmarried'}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.profileSection}>
          <h4 style={styles.profileSectionTitle}>{t.paymentDetails}</h4>
          <div style={styles.paymentSummary}>
            {member.taxes && member.taxes.length > 0 ? (
              <div style={{ width: '100%' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Tax Name</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Tax Count</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Total</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Paid</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {member.taxes.map(tax => (
                        <tr key={tax.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px' }}>{tax.tax_name}</td>
                          <td style={{ padding: '8px' }}>{tax.tax_count}</td>
                          <td style={{ padding: '8px' }}>₹{tax.total_tax}</td>
                          <td style={{ padding: '8px', color: '#10b981' }}>₹{tax.amount_paid}</td>
                          <td style={{ padding: '8px', color: '#ef4444' }}>₹{tax.amount_due}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>

        {member.transactions && member.transactions.length > 0 && (
          <div style={styles.profileSection}>
            <h4 style={styles.profileSectionTitle}>Transaction History</h4>
            <div style={{ overflowX: 'auto', marginTop: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Receipt</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Type</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {member.transactions.map(txn => (
                    <tr key={txn.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px' }}>{txn.receipt_number}</td>
                      <td style={{ padding: '8px' }}>{formatDate(txn.payment_date)}</td>
                      <td style={{ padding: '8px' }}>{txn.transaction_type}</td>
                      <td style={{ padding: '8px', color: txn.transaction_type === 'Payment' ? '#10b981' : '#6b7280' }}>
                        ₹{txn.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
