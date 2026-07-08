import React, { useState, useCallback, useRef } from 'react';
import { styles } from '../utils/styles';
import { useTamilInput } from '../utils/useTamilInput';
import { memberAPI, accountingAPI } from '../services/api';

export default function MembersPage({ members: rawMembers, t, onViewMember, onExportExcel, onResetPassword, onImportSuccess }) {
  const members = Array.isArray(rawMembers) ? rawMembers : [];
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedRow, setExpandedRow] = useState(null);

  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  // Staff management state
  const [staffList, setStaffList] = useState([]);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', phone: '', password: '' });

  const setSearchValue = useCallback((v) => setSearchTerm(v), []);
  const searchTamilProps = useTamilInput(searchTerm, setSearchValue);

  const filteredMembers = members.filter(m => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = m.name.toLowerCase().includes(searchLower) ||
      (m.name_ta && m.name_ta.includes(searchTerm)) ||
      m.phone.includes(searchTerm);
    const due = m.amount_due ?? m.amountDue ?? 0;
    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'paid' && due === 0) ||
      (filterStatus === 'pending' && due > 0);
    return matchesSearch && matchesFilter;
  });

  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleOpenImport = () => {
    setImportFile(null);
    setImportResult(null);
    setShowImportModal(true);
  };

  const handleCloseImport = () => {
    setShowImportModal(false);
    setImportFile(null);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.xlsx')) {
      setImportFile(file);
      setImportResult(null);
    } else if (file) {
      alert('Please select a .xlsx file');
      e.target.value = '';
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append('excel_file', importFile);
      const response = await memberAPI.importExcel(formData);
      setImportResult(response.data);
      // Refresh members list if any were created
      if (response.data.created > 0 && onImportSuccess) {
        onImportSuccess();
      }
    } catch (error) {
      console.error('Import error:', error);
      const msg = error.response?.data?.error || 'Import failed. Please try again.';
      setImportResult({ created: 0, skipped: 0, errors: [{ row: '-', name: '-', reason: msg }] });
    } finally {
      setImporting(false);
    }
  };

  // ── Import Modal ──
  const importModal = showImportModal && (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: 'white', borderRadius: '16px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        width: '100%', maxWidth: '560px', maxHeight: '80vh',
        overflow: 'auto', padding: '32px', position: 'relative',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1a1a1a' }}>
            📤 Import Members from Excel
          </h3>
          <button onClick={handleCloseImport} style={{
            background: 'none', border: 'none', fontSize: '24px',
            cursor: 'pointer', color: '#6b7280', padding: '4px',
          }}>✕</button>
        </div>

        {/* Instructions */}
        <div style={{
          background: '#f0f9ff', border: '1px solid #bae6fd',
          borderRadius: '10px', padding: '16px', marginBottom: '20px',
          fontSize: '13px', color: '#0369a1', lineHeight: '1.6',
        }}>
          <strong>Format:</strong> Upload the Tamil Excel file (.xlsx) with member data starting at row 7.
          <br />Phone numbers in column J are used as login credentials.
          <br />Members with existing phone numbers will be skipped.
        </div>

        {/* File Input */}
        <div style={{
          border: '2px dashed #d1d5db', borderRadius: '12px',
          padding: '32px', textAlign: 'center', marginBottom: '20px',
          background: importFile ? '#f0fdf4' : '#fafafa',
          transition: 'all 0.2s',
          cursor: 'pointer',
        }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="import-excel-input"
          />
          {importFile ? (
            <div>
              <span style={{ fontSize: '32px' }}>📄</span>
              <p style={{ margin: '8px 0 0', fontWeight: '600', color: '#059669' }}>
                {importFile.name}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>
                {(importFile.size / 1024).toFixed(1)} KB — Click to change
              </p>
            </div>
          ) : (
            <div>
              <span style={{ fontSize: '32px' }}>📁</span>
              <p style={{ margin: '8px 0 0', fontWeight: '500', color: '#374151' }}>
                Click to select an Excel file
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9ca3af' }}>
                Only .xlsx files are supported
              </p>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <button
          onClick={handleImport}
          disabled={!importFile || importing}
          style={{
            width: '100%', padding: '14px',
            background: !importFile || importing
              ? '#d1d5db'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white', border: 'none', borderRadius: '10px',
            fontSize: '15px', fontWeight: '600', cursor: importFile && !importing ? 'pointer' : 'not-allowed',
            marginBottom: '20px', transition: 'all 0.2s',
          }}
        >
          {importing ? '⏳ Importing…' : '🚀 Upload & Import'}
        </button>

        {/* Results */}
        {importResult && (
          <div style={{
            borderRadius: '12px', overflow: 'hidden',
            border: '1px solid #e5e7eb',
          }}>
            {/* Summary bar */}
            <div style={{
              display: 'flex', gap: '0',
              background: '#f9fafb',
              borderBottom: importResult.errors?.length > 0 ? '1px solid #e5e7eb' : 'none',
            }}>
              <div style={{
                flex: 1, padding: '16px', textAlign: 'center',
                borderRight: '1px solid #e5e7eb',
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>
                  {importResult.created}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Created</div>
              </div>
              <div style={{ flex: 1, padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>
                  {importResult.skipped}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Skipped</div>
              </div>
            </div>

            {/* Error details */}
            {importResult.errors && importResult.errors.length > 0 && (
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {importResult.errors.map((err, idx) => (
                  <div key={idx} style={{
                    padding: '10px 16px', fontSize: '13px',
                    borderBottom: idx < importResult.errors.length - 1 ? '1px solid #f3f4f6' : 'none',
                    display: 'flex', gap: '8px', alignItems: 'baseline',
                  }}>
                    <span style={{
                      background: '#fef2f2', color: '#b91c1c',
                      padding: '2px 8px', borderRadius: '4px',
                      fontSize: '11px', fontWeight: '600', flexShrink: 0,
                    }}>Row {err.row}</span>
                    <span style={{ fontWeight: '500', color: '#374151' }}>{err.name}</span>
                    <span style={{ color: '#9ca3af' }}>—</span>
                    <span style={{ color: '#6b7280' }}>{err.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ ...styles.pageTitle, marginBottom: 0 }}>{t.members}</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={handleOpenImport}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            id="import-excel-btn"
          >
            📤 Import Excel
          </button>
          <button
            onClick={onExportExcel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#10b981',
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
            📥 {t.exportExcel}
          </button>
        </div>
      </div>

      <div style={styles.tableControls}>
        <input
          type="text"
          placeholder={t.search}
          value={searchTerm}
          {...searchTamilProps}
          style={styles.searchInput}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="all">{t.all}</option>
          <option value="paid">{t.paid}</option>
          <option value="pending">{t.pending}</option>
        </select>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}></th>
              <th style={styles.th}>{t.memberId || 'Member ID'}</th>
              <th style={styles.th}>{t.memberName}</th>
              <th style={styles.th}>{t.phoneNumber}</th>
              <th style={styles.th}>{t.fatherName}</th>
              <th style={styles.th}>{t.annualTax}</th>
              <th style={styles.th}>{t.amountPaid}</th>
              <th style={styles.th}>{t.amountDue}</th>
              <th style={styles.th}>{t.status}</th>
              <th style={styles.th}>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map(member => {
              const annualTax = member.annual_tax ?? member.annualTax ?? 0;
              const amountPaid = member.amount_paid ?? member.amountPaid ?? 0;
              const amountDue = member.amount_due ?? member.amountDue ?? 0;
              const fatherName = member.father_name ?? member.fatherName ?? '';
              const motherName = member.mother_name ?? member.motherName ?? '';
              const spouseName = member.spouse_name ?? member.spouseName ?? '';
              const children = member.children ?? [];
              const isExpanded = expandedRow === member.id;

              return (
                <React.Fragment key={member.id}>
                  <tr style={styles.tr}>
                    <td style={{ ...styles.td, cursor: 'pointer', textAlign: 'center', fontSize: '16px' }} onClick={() => toggleExpand(member.id)}>
                      {isExpanded ? '▼' : '▶'}
                    </td>
                    <td style={{ ...styles.td, fontWeight: '700', color: '#4338ca', fontSize: '12px', letterSpacing: '0.5px' }}>
                      {member.member_id || '-'}
                    </td>
                    <td style={styles.td}>
                      <div>{member.name}</div>
                      {member.name_ta && (
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{member.name_ta}</div>
                      )}
                    </td>
                    <td style={styles.td}>{member.phone}</td>
                    <td style={styles.td}>
                      <div>{fatherName}</div>
                      {(member.father_name_ta || member.fatherNameTa) && (
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{member.father_name_ta || member.fatherNameTa}</div>
                      )}
                    </td>
                    <td style={styles.td}>₹{Number(annualTax).toLocaleString()}</td>
                    <td style={styles.td}>₹{Number(amountPaid).toLocaleString()}</td>
                    <td style={styles.td}>₹{Number(amountDue).toLocaleString()}</td>
                    <td style={styles.td}>
                      <span style={Number(amountDue) === 0 ? styles.statusPaid : styles.statusPending}>
                        {Number(amountDue) === 0 ? t.paid : t.pending}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button onClick={() => onViewMember(member)} style={styles.actionButton}>
                          {t.view}
                        </button>
                        {onResetPassword && (
                          <button
                            onClick={() => onResetPassword(member)}
                            style={{
                              ...styles.actionButton,
                              backgroundColor: '#f97316',
                              fontSize: '12px',
                              padding: '6px 12px',
                            }}
                            title={t.resetPassword}
                          >
                            🔑 {t.resetPassword}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={9} style={{ padding: '0', border: 'none' }}>
                        <div style={{
                          background: '#f8f9fa',
                          padding: '16px 24px',
                          borderBottom: '1px solid #e2e8f0',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                          gap: '12px',
                        }}>
                          {motherName && (
                            <div>
                              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '2px' }}>{t.motherName}</div>
                              <div style={{ fontSize: '14px', color: '#1e293b' }}>{motherName}</div>
                              {(member.mother_name_ta || member.motherNameTa) && (
                                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{member.mother_name_ta || member.motherNameTa}</div>
                              )}
                            </div>
                          )}
                          {spouseName && (
                            <div>
                              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '2px' }}>{t.spouseName}</div>
                              <div style={{ fontSize: '14px', color: '#1e293b' }}>{spouseName}</div>
                              {(member.spouse_name_ta || member.spouseNameTa) && (
                                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{member.spouse_name_ta || member.spouseNameTa}</div>
                              )}
                            </div>
                          )}
                          {children.length > 0 && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>{t.children} ({children.length})</div>
                              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {children.map((child, idx) => (
                                  <div key={idx} style={{
                                    background: 'white',
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    border: '1px solid #e2e8f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                  }}>
                                    <span>{child.gender === 'Male' ? '👦' : '👧'}</span>
                                    <span style={{ fontWeight: '500' }}>{child.name}{child.name_ta ? ` / ${child.name_ta}` : ''}</span>
                                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>{child.date_of_birth ?? child.dob}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {!motherName && !spouseName && children.length === 0 && (
                            <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>
                              No additional family details available.
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Accountant Staff Management ── */}
      <div style={{ marginTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ ...styles.pageTitle, fontSize: '22px' }}>👤 Accountant Accounts</h3>
          <button
            onClick={() => { setShowStaffForm(true); setStaffForm({ name: '', phone: '', password: '' }); }}
            style={{ ...styles.exportButton, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >➕ Add Accountant</button>
        </div>

        <StaffTable staffList={staffList} setStaffList={setStaffList} />

        {showStaffForm && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
            <div style={{ background:'white', borderRadius:'16px', padding:'32px', width:'100%', maxWidth:'440px', boxShadow:'0 25px 60px rgba(0,0,0,0.3)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
                <h3 style={{ margin:0, fontSize:'18px', fontWeight:'700' }}>New Accountant</h3>
                <button onClick={()=>setShowStaffForm(false)} style={{ background:'none', border:'none', fontSize:'24px', cursor:'pointer', color:'#6b7280' }}>✕</button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await accountingAPI.createStaff(staffForm);
                  setShowStaffForm(false);
                  // trigger re-fetch
                  setStaffList([]);
                } catch (err) {
                  const msg = err.response?.data ? Object.values(err.response.data).flat().join(', ') : 'Failed';
                  alert(msg);
                }
              }} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Name *</label>
                  <input type="text" required value={staffForm.name} onChange={e=>setStaffForm({...staffForm,name:e.target.value})} style={styles.formInput} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Phone (10 digits) *</label>
                  <input type="text" required value={staffForm.phone} onChange={e=>setStaffForm({...staffForm,phone:e.target.value.replace(/\D/g,'').slice(0,10)})} style={styles.formInput} maxLength={10} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Password *</label>
                  <input type="password" required minLength={8} value={staffForm.password} onChange={e=>setStaffForm({...staffForm,password:e.target.value})} style={styles.formInput} />
                </div>
                <button type="submit" style={styles.submitButton}>Create Accountant</button>
              </form>
            </div>
          </div>
        )}
      </div>

      {importModal}
    </div>
  );
}

function StaffTable({ staffList, setStaffList }) {
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    if (staffList.length === 0 && !loaded) {
      accountingAPI.getStaff()
        .then(r => {
          const data = Array.isArray(r.data) ? r.data : r.data?.results || [];
          setStaffList(data);
          setLoaded(true);
        })
        .catch(console.error);
    }
  }, [staffList, loaded, setStaffList]);

  // Re-fetch when staffList is cleared (after create)
  React.useEffect(() => {
    if (staffList.length === 0 && loaded) {
      setLoaded(false);
    }
  }, [staffList, loaded]);

  const toggleActive = async (staff) => {
    try {
      if (staff.is_active) {
        await accountingAPI.deactivateStaff(staff.id);
      } else {
        await accountingAPI.activateStaff(staff.id);
      }
      setStaffList([]);
    } catch (err) {
      alert('Failed to update staff status.');
    }
  };

  if (staffList.length === 0) {
    return <div style={{ textAlign:'center', color:'#9ca3af', padding:'24px', background:'white', borderRadius:'12px' }}>No accountant accounts yet.</div>;
  }

  return (
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead><tr>
          <th style={styles.th}>Name</th>
          <th style={styles.th}>Phone</th>
          <th style={styles.th}>Role</th>
          <th style={styles.th}>Status</th>
          <th style={styles.th}>Actions</th>
        </tr></thead>
        <tbody>
          {staffList.map(s => (
            <tr key={s.id} style={styles.tr}>
              <td style={{...styles.td, fontWeight:'600'}}>{s.name}</td>
              <td style={styles.td}>{s.phone}</td>
              <td style={styles.td}>{s.role}</td>
              <td style={styles.td}>
                <span style={s.is_active ? styles.statusPaid : styles.statusPending}>
                  {s.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td style={styles.td}>
                <button onClick={() => toggleActive(s)} style={{
                  ...styles.actionButton,
                  background: s.is_active ? '#ef4444' : '#10b981',
                  fontSize:'12px', padding:'4px 12px',
                }}>
                  {s.is_active ? '🚫 Deactivate' : '✅ Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
