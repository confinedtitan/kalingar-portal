import React, { useState, useEffect, useCallback } from 'react';
import { styles } from '../utils/styles';
import api, { memberAPI } from '../services/api';
import { formatDate } from '../utils/dateFormatter';
import { ArrowLeft, Play, Square, Edit2, Plus, Sparkles } from 'lucide-react';

export default function TrustAccountsPage({ t, isAdmin, isAccountant }) {
  const [accounts, setAccounts] = useState([]);
  const [members, setMembers] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Statement navigation state
  const [selectedAccountForStatement, setSelectedAccountForStatement] = useState(null);
  const [ledgerTxns, setLedgerTxns] = useState([]);
  const [statementLoading, setStatementLoading] = useState(false);

  // Form modal state
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [form, setForm] = useState({
    account_name: '',
    account_type: 'Cash',
    associated_entity_type: 'Trust_Direct',
    member: '',
    family_member: '',
    account_number: '',
    bank_name: '',
    branch_name: '',
  });

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/accounting/trust-accounts/');
      setAccounts(Array.isArray(res.data) ? res.data : res.data?.results || []);
    } catch (err) {
      setError('Failed to fetch trust accounts.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProxyData = useCallback(async () => {
    try {
      // Fetch members
      const memRes = await memberAPI.getAll({ page_size: 1000 });
      const memData = Array.isArray(memRes.data) ? memRes.data : memRes.data?.results || [];
      setMembers(memData);

      // Collect children/family members
      const allChildren = [];
      memData.forEach(m => {
        if (Array.isArray(m.children)) {
          m.children.forEach(c => {
            allChildren.push({
              id: c.id,
              name: `${c.name} (Child of ${m.name})`,
              name_ta: c.name_ta
            });
          });
        }
      });
      setFamilyMembers(allChildren);
    } catch (err) {
      console.error('Error fetching proxy helper data', err);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
    fetchProxyData();
  }, [fetchAccounts, fetchProxyData]);

  // View statement ledger
  const handleViewStatement = async (account) => {
    try {
      setStatementLoading(true);
      setSelectedAccountForStatement(account);
      const res = await api.get(`/accounting/trust-accounts/${account.account_id}/ledger/`);
      setLedgerTxns(res.data?.transactions || []);
    } catch (err) {
      alert('Failed to load account ledger.');
    } finally {
      setStatementLoading(false);
    }
  };

  const handleDeactivate = async (account) => {
    if (!window.confirm(`Are you sure you want to deactivate "${account.account_name}"?`)) return;
    try {
      await api.post(`/accounting/trust-accounts/${account.account_id}/deactivate/`);
      setSuccess('Account deactivated successfully.');
      fetchAccounts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      alert('Failed to deactivate account.');
    }
  };

  const handleActivate = async (account) => {
    try {
      await api.post(`/accounting/trust-accounts/${account.account_id}/activate/`);
      setSuccess('Account activated successfully.');
      fetchAccounts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      alert('Failed to activate account.');
    }
  };

  const handleEditClick = (account) => {
    setEditingAccount(account);
    setForm({
      account_name: account.account_name,
      account_type: account.account_type,
      associated_entity_type: account.associated_entity_type,
      member: account.member || '',
      family_member: account.family_member || '',
      account_number: account.account_number || '',
      bank_name: account.bank_name || '',
      branch_name: account.branch_name || '',
    });
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingAccount(null);
    setForm({
      account_name: '',
      account_type: 'Cash',
      associated_entity_type: 'Trust_Direct',
      member: '',
      family_member: '',
      account_number: '',
      bank_name: '',
      branch_name: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate Bank types
    if (form.account_type === 'Bank') {
      if (!form.account_number.trim() || !form.bank_name.trim() || !form.branch_name.trim()) {
        alert('All Bank details are strictly mandatory for Bank trust accounts.');
        return;
      }
    }

    try {
      const payload = {
        account_name: form.account_name,
        account_type: form.account_type,
        associated_entity_type: form.associated_entity_type,
        member: form.member || null,
        family_member: form.family_member || null,
        account_number: form.account_type === 'Bank' ? form.account_number : '',
        bank_name: form.account_type === 'Bank' ? form.bank_name : '',
        branch_name: form.account_type === 'Bank' ? form.branch_name : '',
      };

      if (editingAccount) {
        await api.put(`/accounting/trust-accounts/${editingAccount.account_id}/`, payload);
        setSuccess('Account updated successfully.');
      } else {
        await api.post('/accounting/trust-accounts/', payload);
        setSuccess('Account created successfully.');
      }
      handleCancelForm();
      fetchAccounts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      alert(err.response?.data ? Object.values(err.response.data).flat().join(', ') : 'Failed to save account.');
    }
  };

  // UI styles helper
  const modalBackdrop = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
  };

  const modalContainer = {
    background: 'white', borderRadius: '16px', padding: '32px',
    width: '100%', maxWidth: '600px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  };

  if (selectedAccountForStatement) {
    // Render deep ledger statement for selected account
    const isCommodity = selectedAccountForStatement.account_type === 'Commodities';
    return (
      <div style={styles.page}>
        <div style={{ ...styles.pageHeader, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setSelectedAccountForStatement(null)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', border: '1px solid #d1d5db',
              borderRadius: '8px', background: 'white', cursor: 'pointer', color: '#4b5563'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ ...styles.pageTitle, margin: 0 }}>
              {selectedAccountForStatement.account_name} {t.statement || 'Statement'}
            </h2>
            <div style={{ fontSize: '13px', color: '#4f46e5', fontWeight: '600', marginTop: '2px' }}>
              Type: {selectedAccountForStatement.account_type} • Entity: {selectedAccountForStatement.associated_entity_type}
            </div>
          </div>
        </div>

        {statementLoading ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '60px' }}>Loading ledger...</p>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>{t.date || 'Date'}</th>
                  <th style={styles.th}>{t.type || 'Type'}</th>
                  <th style={styles.th}>{isCommodity ? t.quantityWeight || 'Quantity (Weight)' : t.amount || 'Amount'}</th>
                  <th style={styles.th}>{t.mode || 'Mode'}</th>
                  <th style={styles.th}>{t.donorPayee || 'Donor / Payee'}</th>
                  <th style={styles.th}>{t.purpose || 'Purpose / Remarks'}</th>
                  <th style={styles.th}>{t.receiptNo || 'Receipt No'}</th>
                  <th style={styles.th}>{t.runningBalance || 'Running Balance'}</th>
                </tr>
              </thead>
              <tbody>
                {ledgerTxns.map((txn) => {
                  const isDebit = txn.transaction_type === 'DEBIT';
                  return (
                    <tr key={txn.id} style={styles.tr}>
                      <td style={styles.td}>{formatDate(txn.transaction_date)}</td>
                      <td style={styles.td}>
                        <span style={{
                          padding: '2px 10px', borderRadius: '12px', fontSize: '12px',
                          fontWeight: '600',
                          background: isDebit ? '#fee2e2' : '#d1fae5',
                          color: isDebit ? '#991b1b' : '#065f46'
                        }}>
                          {isDebit ? (t.debit || 'Debit') : (t.credit || 'Credit')}
                        </span>
                      </td>
                      <td style={{ ...styles.td, fontWeight: '700', color: isDebit ? '#dc2626' : '#059669' }}>
                        {isCommodity ? '' : '₹'}{Number(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td style={styles.td}>{txn.payment_mode} {txn.commodity_type ? `(${txn.commodity_type})` : ''}</td>
                      <td style={styles.td}>
                        {isDebit ? (txn.paid_to || '—') : (txn.donor_name || '—')}
                      </td>
                      <td style={styles.td}>{txn.purpose || '—'}</td>
                      <td style={styles.td}>{txn.receipt_number || '—'}</td>
                      <td style={{ ...styles.td, fontWeight: '700', color: '#1e3a8a' }}>
                        {isCommodity ? '' : '₹'}{Number(txn.running_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
                {ledgerTxns.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ ...styles.td, textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
                      No ledger transactions found for this account.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>💼 {t.trustAccounts || 'Trust Accounts'}</h2>
        {(isAdmin || isAccountant) && (
          <button
            onClick={() => setShowForm(true)}
            style={{ ...styles.exportButton, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} />
            Add Trust Account
          </button>
        )}
      </div>

      {success && <div style={{ ...styles.alert, ...styles.alertSuccess }}>{success}</div>}

      {loading ? (
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '60px' }}>Loading accounts registry...</p>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>{t.accountName || 'Account Name'}</th>
                <th style={styles.th}>{t.accountType || 'Account Type'}</th>
                <th style={styles.th}>{t.associatedEntityType || 'Associated Entity'}</th>
                <th style={styles.th}>{t.bankDetails || 'Bank Details'}</th>
                <th style={styles.th}>{t.status || 'Status'}</th>
                <th style={styles.th}>{t.actions || 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acct) => (
                <tr key={acct.account_id} style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: '600' }}>
                    <button
                      onClick={() => handleViewStatement(acct)}
                      style={{
                        background: 'none', border: 'none', padding: 0,
                        color: '#4f46e5', textDecoration: 'underline',
                        fontWeight: '700', cursor: 'pointer', textAlign: 'left'
                      }}
                    >
                      {acct.account_name}
                    </button>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      padding: '2px 10px', borderRadius: '12px', fontSize: '12px',
                      fontWeight: '600',
                      background: acct.account_type === 'Bank' ? '#e0f2fe' : acct.account_type === 'Cash' ? '#ecfdf5' : '#fef3c7',
                      color: acct.account_type === 'Bank' ? '#0369a1' : acct.account_type === 'Cash' ? '#047857' : '#b45309'
                    }}>
                      {acct.account_type}
                    </span>
                  </td>
                  <td style={acct.associated_entity_type === 'Trust_Direct' ? styles.td : { ...styles.td, fontSize: '13px' }}>
                    {acct.associated_entity_type === 'Trust_Direct' ? 'Direct Trust' : (
                      <div>
                        <strong>{acct.associated_entity_type.replace('_', ' ')}</strong>
                        <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px' }}>
                          Custodian: {acct.family_member_name || acct.member_name || '—'}
                        </div>
                      </div>
                    )}
                  </td>
                  <td style={{ ...styles.td, fontSize: '13px' }}>
                    {acct.account_type === 'Bank' ? (
                      <div>
                        <div>Bank: {acct.bank_name}</div>
                        <div>A/C: {acct.account_number}</div>
                        <div>Branch: {acct.branch_name}</div>
                      </div>
                    ) : '—'}
                  </td>
                  <td style={styles.td}>
                    <span style={acct.status === 'Active' ? styles.statusPaid : styles.statusPending}>
                      {acct.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {(isAdmin || isAccountant) && (
                        <button
                          onClick={() => handleEditClick(acct)}
                          style={{ ...styles.actionButton, background: '#6b7280', padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                      )}
                      {isAdmin && acct.status === 'Active' && (
                        <button
                          onClick={() => handleDeactivate(acct)}
                          style={{ ...styles.actionButton, background: '#ef4444', padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Square size={12} /> Deactivate
                        </button>
                      )}
                      {isAdmin && acct.status === 'Inactive' && (
                        <button
                          onClick={() => handleActivate(acct)}
                          style={{ ...styles.actionButton, background: '#10b981', padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Play size={12} /> Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
                    No trust accounts registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Creation/Edit Form Modal */}
      {showForm && (
        <div style={modalBackdrop}>
          <div style={modalContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>
                {editingAccount ? 'Edit Trust Account' : 'Add Trust Account'}
              </h3>
              <span style={{ fontSize: '11px', color: '#6366f1', background: '#e0e7ff', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                <Sparkles size={10} style={{ display: 'inline', marginRight: '4px' }} />
                Secure Registry
              </span>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Account Name *</label>
                <input
                  type="text" required
                  value={form.account_name}
                  onChange={(e) => setForm({ ...form, account_name: e.target.value })}
                  style={styles.formInput}
                  placeholder="e.g. Main Cash Vault, SBI Trust Proxy"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Account Type *</label>
                  <select
                    value={form.account_type}
                    onChange={(e) => setForm({ ...form, account_type: e.target.value })}
                    style={styles.formInput}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank</option>
                    <option value="Commodities">Commodities</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Associated Entity Type *</label>
                  <select
                    value={form.associated_entity_type}
                    onChange={(e) => setForm({ ...form, associated_entity_type: e.target.value })}
                    style={styles.formInput}
                  >
                    <option value="Trust_Direct">Trust Direct</option>
                    <option value="Member">Member Proxy</option>
                    <option value="Member_Family">Member Family Proxy</option>
                  </select>
                </div>
              </div>

              {/* Conditional Proxy selectors */}
              {form.associated_entity_type === 'Member' && (
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Custodian Member *</label>
                  <select
                    required
                    value={form.member}
                    onChange={(e) => setForm({ ...form, member: e.target.value })}
                    style={styles.formInput}
                  >
                    <option value="">Select proxy member</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {form.associated_entity_type === 'Member_Family' && (
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Custodian Family Member *</label>
                  <select
                    required
                    value={form.family_member}
                    onChange={(e) => setForm({ ...form, family_member: e.target.value })}
                    style={styles.formInput}
                  >
                    <option value="">Select proxy child</option>
                    {familyMembers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Commodities member association override note */}
              {form.account_type === 'Commodities' && form.associated_entity_type === 'Trust_Direct' && (
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Responsible Custodian (Member) *</label>
                  <select
                    required
                    value={form.member}
                    onChange={(e) => setForm({ ...form, member: e.target.value })}
                    style={styles.formInput}
                  >
                    <option value="">Select custodian member</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Bank fields (strictly mandatory only if Bank) */}
              {form.account_type === 'Bank' && (
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#475569' }}>Mandatory Bank Details</h4>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Bank Name *</label>
                    <input
                      type="text" required
                      value={form.bank_name}
                      onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                      style={styles.formInput}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Account Number *</label>
                      <input
                        type="text" required
                        value={form.account_number}
                        onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                        style={styles.formInput}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Branch Name *</label>
                      <input
                        type="text" required
                        value={form.branch_name}
                        onChange={(e) => setForm({ ...form, branch_name: e.target.value })}
                        style={styles.formInput}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  style={{ padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', background: '#4f46e5', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
