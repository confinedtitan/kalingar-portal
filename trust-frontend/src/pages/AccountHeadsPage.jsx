import React, { useState, useEffect, useCallback } from 'react';
import { styles } from '../utils/styles';
import { accountingAPI } from '../services/api';
import { formatDate } from '../utils/dateFormatter';
import { useTamilInput } from '../utils/useTamilInput';

// Language tag badge (mirrors AddMemberPage.jsx)
const langTag = (text) => (
  <span style={{
    display: 'inline-block', fontSize: '10px', fontWeight: '600',
    padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', verticalAlign: 'middle',
    background: text === 'EN' ? '#dbeafe' : '#fef3c7',
    color: text === 'EN' ? '#1d4ed8' : '#92400e',
  }}>{text}</span>
);

export default function AccountHeadsPage({ isAdmin, t, onSelectHead }) {
  const [heads, setHeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHead, setEditingHead] = useState(null);
  const [form, setForm] = useState({ name: '', name_ta: '', description: '', description_ta: '', head_type: '', account_type: 'Revenue' });

  // Tamil input hooks
  const setNameTa = useCallback((v) => setForm(prev => ({ ...prev, name_ta: v })), []);
  const setDescTa  = useCallback((v) => setForm(prev => ({ ...prev, description_ta: v })), []);
  const nameTaProps = useTamilInput(form.name_ta, setNameTa);
  const descTaProps  = useTamilInput(form.description_ta, setDescTa);

  const fetchHeads = async () => {
    try {
      const res = await accountingAPI.getAccountHeads();
      setHeads(Array.isArray(res.data) ? res.data : res.data?.results || []);
    } catch (err) {
      console.error('Error fetching account heads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHeads(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHead) {
        await accountingAPI.updateAccountHead(editingHead.id, form);
      } else {
        await accountingAPI.createAccountHead(form);
      }
      setShowForm(false);
      setEditingHead(null);
      setForm({ name: '', name_ta: '', description: '', description_ta: '', head_type: '', account_type: 'Revenue' });
      fetchHeads();
    } catch (err) {
      console.error('Error saving account head:', err);
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join(', ')
        : 'Failed to save.';
      alert(msg);
    }
  };

  const handleEdit = (head) => {
    setEditingHead(head);
    setForm({
      name: head.name,
      name_ta: head.name_ta || '',
      description: head.description || '',
      description_ta: head.description_ta || '',
      head_type: head.head_type || '',
      account_type: head.account_type || 'Revenue',
    });
    setShowForm(true);
  };

  const handleDeactivate = async (head) => {
    if (!window.confirm(`Deactivate "${head.name}"? It won't appear in new transaction dropdowns.`)) return;
    try {
      await accountingAPI.deactivateAccountHead(head.id);
      fetchHeads();
    } catch (err) {
      console.error('Deactivate error:', err);
      alert(err.response?.data?.error || 'Failed to deactivate.');
    }
  };

  const handleExport = async (head) => {
    try {
      const res = await accountingAPI.exportAccountHead(head.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${head.name.replace(/\s+/g, '_')}_Report.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export.');
    }
  };

  const cardBase = {
    background: 'white', borderRadius: '12px', padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb',
  };

  if (loading) {
    return <div style={styles.page}><p style={{ textAlign: 'center', color: '#6b7280', padding: '60px' }}>Loading...</p></div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>📁 {t.accountHeads || 'Account Heads'}</h2>
        <button
          onClick={() => { setEditingHead(null); setForm({ name: '', name_ta: '', description: '', description_ta: '', head_type: '', account_type: 'Revenue' }); setShowForm(true); }}
          style={{ ...styles.exportButton, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          ➕ New Account Head
        </button>
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{ ...cardBase, width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                {editingHead ? 'Edit Account Head' : 'New Account Head'}
              </h3>
              <button onClick={() => { setShowForm(false); setEditingHead(null); }}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Name (English) */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>{t.accountHeadName || 'Account Head Name'} {langTag('EN')} *</label>
                <input
                  type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={styles.formInput} placeholder="e.g. Kovil Kodai 2026"
                />
              </div>
              {/* Name (Tamil) */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>{t.accountHeadNameTamil || 'Account Head Name (Tamil)'} {langTag('தமிழ்')}</label>
                <input
                  type="text" value={form.name_ta}
                  {...nameTaProps}
                  style={styles.formInput} placeholder="Tamil name (type in Tamil mode)"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Type</label>
                <select value={form.head_type} onChange={(e) => setForm({ ...form, head_type: e.target.value })} style={styles.formInput}>
                  <option value="">Select type (optional)</option>
                  <option value="General">General</option>
                  <option value="Kodai">Kodai</option>
                </select>
              </div>
              {/* Account Type */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>{t.accountType || 'Account Type'} *</label>
                <select value={form.account_type} onChange={(e) => setForm({ ...form, account_type: e.target.value })} style={styles.formInput} required>
                  <option value="Revenue">Revenue</option>
                  <option value="Asset">Asset</option>
                  <option value="Liability">Liability</option>
                  <option value="Equity">Equity</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>
              {/* Description (English) */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>{t.description || 'Description'} {langTag('EN')}</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={styles.formTextarea} rows={3}
                />
              </div>
              {/* Description (Tamil) */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>{t.descriptionTamil || 'Description (Tamil)'} {langTag('தமிழ்')}</label>
                <textarea
                  value={form.description_ta}
                  {...descTaProps}
                  style={styles.formTextarea} rows={3}
                />
              </div>
              <button type="submit" style={styles.submitButton}>
                {editingHead ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Heads List */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>{t.memberName || 'Name'}</th>
              <th style={styles.th}>{t.type || 'Type'}</th>
              <th style={styles.th}>{t.accountType || 'Account Type'}</th>
              <th style={styles.th}>{t.totalDebits || 'Total Debits'} (₹)</th>
              <th style={styles.th}>{t.totalCredits || 'Total Credits'} (₹)</th>
              <th style={styles.th}>{t.netBalance || 'Net Balance'} (₹)</th>
              <th style={styles.th}>{t.status}</th>
              <th style={styles.th}>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {heads.map((head) => (
              <tr key={head.id} style={styles.tr}>
                <td style={{ ...styles.td, fontWeight: '600' }}>
                  <button
                    onClick={() => onSelectHead && onSelectHead(head)}
                    style={{
                      background: 'none', border: 'none', padding: 0,
                      color: '#4338ca', textDecoration: 'underline',
                      fontWeight: '700', cursor: 'pointer', textAlign: 'left',
                      fontSize: '14px',
                    }}
                  >
                    {head.name}
                  </button>
                  {/* Always show Tamil name as subtitle when non-empty — never conditional on UI language */}
                  {head.name_ta && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{head.name_ta}</div>
                  )}
                </td>
                <td style={styles.td}>
                  {head.head_type ? (
                    <span style={{
                      padding: '2px 10px', borderRadius: '12px', fontSize: '12px',
                      fontWeight: '600', background: '#eef2ff', color: '#4338ca',
                    }}>{head.head_type}</span>
                  ) : '—'}
                </td>
                <td style={styles.td}>{head.account_type || 'Revenue'}</td>
                <td style={{ ...styles.td, fontWeight: '600', color: '#dc2626' }}>
                  {Number(head.total_debits || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td style={{ ...styles.td, fontWeight: '600', color: '#059669' }}>
                  {Number(head.total_credits || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td style={{ ...styles.td, fontWeight: '700', color: '#1e3a8a' }}>
                  {Number(head.net_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td style={styles.td}>
                  <span style={head.is_active ? styles.statusPaid : styles.statusPending}>
                    {head.is_active ? (t.active || 'Active') : (t.inactive || 'Inactive')}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {isAdmin && (
                      <button onClick={() => handleEdit(head)} style={{ ...styles.actionButton, fontSize: '12px', padding: '4px 10px' }}>
                        ✏️ Edit
                      </button>
                    )}
                    {isAdmin && head.is_active && (
                      <button onClick={() => handleDeactivate(head)} style={{
                        ...styles.actionButton, background: '#ef4444', fontSize: '12px', padding: '4px 10px',
                      }}>
                        🚫 Deactivate
                      </button>
                    )}
                    <button onClick={() => handleExport(head)} style={{
                      ...styles.actionButton, background: '#10b981', fontSize: '12px', padding: '4px 10px',
                    }}>
                      📥 Export
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {heads.length === 0 && (
              <tr>
                <td colSpan={8} style={{ ...styles.td, textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
                  No account heads yet. Click "New Account Head" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
