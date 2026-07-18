import React, { useState } from 'react';
import { UserCheck, Check, X, Eye } from 'lucide-react';
import { styles } from '../utils/styles';
import { memberAPI } from '../services/api';

export default function MemberChangesPage({ members, t, onEditMember, onImportSuccess }) {
  const [selectedChange, setSelectedChange] = useState(null);

  // Filter members with pending profile updates
  const pendingMembers = members.filter(m => m.profile_update_status === 'Pending');

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this profile update?')) {
      try {
        await memberAPI.approveProfileUpdate(id);
        alert('Profile update approved successfully!');
        if (onImportSuccess) onImportSuccess();
        if (selectedChange && selectedChange.id === id) {
          setSelectedChange(null);
        }
      } catch (err) {
        console.error(err);
        alert('Failed to approve profile update');
      }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this profile update?')) {
      try {
        await memberAPI.rejectProfileUpdate(id);
        alert('Profile update request rejected.');
        if (onImportSuccess) onImportSuccess();
        if (selectedChange && selectedChange.id === id) {
          setSelectedChange(null);
        }
      } catch (err) {
        console.error(err);
        alert('Failed to reject profile update');
      }
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>{t.memberChanges || 'Member Changes'}</h2>

      {pendingMembers.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
            No Pending Changes
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            All member profile updates are currently approved and up to date.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedChange ? '1fr 1fr' : '1fr', gap: '24px' }}>
          {/* List of Pending Updates */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendingMembers.map(m => (
              <div
                key={m.id}
                style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  borderColor: selectedChange?.id === m.id ? '#4f46e5' : '#e2e8f0',
                  transition: 'all 0.2s'
                }}
                onClick={() => setSelectedChange(m)}
              >
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
                    {m.name}
                  </h4>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                    🆔 {m.member_id} • 📞 {m.phone || 'No Phone'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setSelectedChange(m)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#f1f5f9',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Eye size={16} />
                    {t.viewChanges || 'View'}
                  </button>
                  <button
                    onClick={() => handleApprove(m.id)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#10b981',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Check size={16} />
                    {t.approve || 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(m.id)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#ef4444',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <X size={16} />
                    {t.reject || 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Proposed Changes Panel */}
          {selectedChange && (
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              alignSelf: 'start',
              position: 'sticky',
              top: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                  Proposed Changes for {selectedChange.name}
                </h3>
                <button
                  onClick={() => onEditMember(selectedChange)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  ✏️ Edit & Approve
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '16px',
                  borderRadius: '8px',
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: '#475569', marginBottom: '12px' }}>
                    Updated Fields:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(selectedChange.pending_update?.fields || {}).map(([key, val]) => {
                      if (val === '' || val === null || key === 'password') return null;
                      const friendlyKey = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                      
                      const currentValue = selectedChange[key];
                      const isDifferent = String(currentValue) !== String(val);

                      let displayVal = String(val);
                      if (key === 'father' && val) {
                        const fatherObj = members.find(m => String(m.id) === String(val));
                        if (fatherObj) displayVal = `${fatherObj.name} (${fatherObj.member_id})`;
                      }

                      let displayCurrent = String(currentValue || 'None');
                      if (key === 'father' && currentValue) {
                        const fatherObj = members.find(m => String(m.id) === String(currentValue));
                        if (fatherObj) displayCurrent = `${fatherObj.name} (${fatherObj.member_id})`;
                      }

                      return (
                        <div key={key} style={{
                          fontSize: '13px',
                          padding: '8px',
                          borderRadius: '6px',
                          border: isDifferent ? '1px solid #fbcfe8' : '1px solid #e2e8f0',
                          backgroundColor: isDifferent ? '#fdf2f8' : 'white'
                        }}>
                          <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '2px' }}>{friendlyKey}</div>
                          {isDifferent ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ textDecoration: 'line-through', color: '#94a3b8' }}>
                                Current: {displayCurrent}
                              </span>
                              <span style={{ color: '#db2777', fontWeight: '600' }}>
                                Proposed: {displayVal}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: '#475569' }}>{displayVal}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {selectedChange.pending_update?.children && selectedChange.pending_update.children.length > 0 && (
                    <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: '#475569', marginBottom: '8px' }}>
                        Proposed Children:
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {selectedChange.pending_update.children.map((child, idx) => (
                          <div key={idx} style={{
                            fontSize: '12px',
                            padding: '6px 10px',
                            background: 'white',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0'
                          }}>
                            {child.name}{child.name_ta ? ` / ${child.name_ta}` : ''} ({child.date_of_birth || child.dob})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleReject(selectedChange.id)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    Reject Changes
                  </button>
                  <button
                    onClick={() => handleApprove(selectedChange.id)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    Approve & Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
