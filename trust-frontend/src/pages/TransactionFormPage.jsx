import React, { useState, useEffect } from 'react';
import { styles } from '../utils/styles';
import { accountingAPI } from '../services/api';

export default function TransactionFormPage({ t, onSuccess }) {
  const [heads, setHeads] = useState([]);
  const [form, setForm] = useState({
    account_head: '',
    transaction_type: 'INCOME',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
    payment_mode: 'Cash',
    donor_name: '',
    donor_contact: '',
    member: '',
    purpose: '',
    paid_to: '',
    purpose_description: '',
    bill_reference: '',
  });
  const [proofFile, setProofFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  // Inline account head creation
  const [showNewHead, setShowNewHead] = useState(false);
  const [newHead, setNewHead] = useState({ name: '', head_type: '', description: '' });

  useEffect(() => {
    accountingAPI.getAccountHeads({ is_active: true })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setHeads(data);
      })
      .catch(console.error);
  }, []);

  const handleCreateHead = async () => {
    if (!newHead.name.trim()) return;
    try {
      const res = await accountingAPI.createAccountHead(newHead);
      const created = res.data;
      setHeads((prev) => [created, ...prev]);
      setForm((prev) => ({ ...prev, account_head: String(created.id) }));
      setShowNewHead(false);
      setNewHead({ name: '', head_type: '', description: '' });
    } catch (err) {
      alert('Failed to create account head.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.account_head) {
      alert('Please select an Account Head.');
      return;
    }
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== '' && val !== null && val !== undefined) {
          data.append(key, val);
        }
      });
      if (proofFile) {
        data.append('proof_document', proofFile);
      }

      const res = await accountingAPI.createTransaction(data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(res.data);
      setForm({
        account_head: '',
        transaction_type: 'INCOME',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        payment_mode: 'Cash',
        donor_name: '',
        donor_contact: '',
        member: '',
        purpose: '',
        paid_to: '',
        purpose_description: '',
        bill_reference: '',
      });
      setProofFile(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Transaction create error:', err);
      const msg = err.response?.data
        ? typeof err.response.data === 'string'
          ? err.response.data
          : Object.values(err.response.data).flat().join(', ')
        : 'Failed to create transaction.';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadReceipt = async (receiptId) => {
    try {
      const res = await accountingAPI.downloadReceipt(receiptId);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt_${receiptId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Receipt download error:', err);
      alert('Failed to download receipt.');
    }
  };

  const isIncome = form.transaction_type === 'INCOME';

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>➕ Add Transaction</h2>
      </div>

      {/* Success message */}
      {success && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px',
          padding: '20px', marginBottom: '24px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#059669', marginBottom: '4px' }}>
              ✅ Transaction created successfully!
            </div>
            <div style={{ fontSize: '13px', color: '#374151' }}>
              Receipt: {success.receipt_number || 'Generated'}
            </div>
          </div>
          {success.receipt_id && (
            <button
              onClick={() => handleDownloadReceipt(success.receipt_id)}
              style={{
                padding: '8px 16px', background: '#4338ca', color: 'white',
                border: 'none', borderRadius: '8px', cursor: 'pointer',
                fontWeight: '600', fontSize: '13px',
              }}
            >
              📄 Download Receipt
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Account Head selection */}
        <div style={{ ...styles.formGrid, marginBottom: '24px' }}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Account Head *</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={form.account_head}
                onChange={(e) => setForm({ ...form, account_head: e.target.value })}
                style={{ ...styles.formInput, flex: 1 }}
                required
              >
                <option value="">Select Account Head</option>
                {heads.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewHead(!showNewHead)}
                style={{
                  padding: '8px 14px', background: '#667eea', color: 'white',
                  border: 'none', borderRadius: '8px', cursor: 'pointer',
                  fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap',
                }}
              >
                + New
              </button>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Transaction Type *</label>
            <select
              value={form.transaction_type}
              onChange={(e) => setForm({ ...form, transaction_type: e.target.value })}
              style={styles.formInput}
            >
              <option value="INCOME">💰 Income / Donation</option>
              <option value="EXPENSE">💸 Expense</option>
            </select>
          </div>
        </div>

        {/* Inline new head form */}
        {showNewHead && (
          <div style={{
            background: '#f9fafb', padding: '16px', borderRadius: '10px',
            marginBottom: '20px', border: '1px dashed #d1d5db',
          }}>
            <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#374151' }}>
              Create New Account Head
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <input
                  type="text" placeholder="Name *" value={newHead.name}
                  onChange={(e) => setNewHead({ ...newHead, name: e.target.value })}
                  style={styles.formInput}
                />
              </div>
              <div style={{ minWidth: '140px' }}>
                <select
                  value={newHead.head_type}
                  onChange={(e) => setNewHead({ ...newHead, head_type: e.target.value })}
                  style={styles.formInput}
                >
                  <option value="">Type</option>
                  <option value="Event">Event</option>
                  <option value="Recurring">Recurring</option>
                  <option value="General">General</option>
                </select>
              </div>
              <button
                type="button" onClick={handleCreateHead}
                style={{
                  padding: '10px 20px', background: '#10b981', color: 'white',
                  border: 'none', borderRadius: '8px', cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Create
              </button>
            </div>
          </div>
        )}

        {/* Core fields */}
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Amount (₹) *</label>
            <input
              type="number" step="0.01" min="0.01" required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              style={styles.formInput} placeholder="0.00"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Date *</label>
            <input
              type="date" required value={form.transaction_date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
              style={styles.formInput}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Payment Mode *</label>
            <select
              value={form.payment_mode}
              onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}
              style={styles.formInput}
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
        </div>

        {/* Conditional fields based on type */}
        {isIncome ? (
          <div style={{ marginTop: '24px' }}>
            <h4 style={{ ...styles.subsectionTitle, color: '#059669' }}>💰 Income / Donor Details</h4>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Donor Name</label>
                <input
                  type="text" value={form.donor_name}
                  onChange={(e) => setForm({ ...form, donor_name: e.target.value })}
                  style={styles.formInput}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Donor Contact</label>
                <input
                  type="text" value={form.donor_contact}
                  onChange={(e) => setForm({ ...form, donor_contact: e.target.value })}
                  style={styles.formInput}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Linked Member ID (optional)</label>
                <input
                  type="number" value={form.member}
                  onChange={(e) => setForm({ ...form, member: e.target.value })}
                  style={styles.formInput}
                  placeholder="Leave blank if not a member"
                />
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Purpose / Remarks</label>
              <textarea
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                style={styles.formTextarea} rows={2}
              />
            </div>
          </div>
        ) : (
          <div style={{ marginTop: '24px' }}>
            <h4 style={{ ...styles.subsectionTitle, color: '#dc2626' }}>💸 Expense Details</h4>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Paid To</label>
                <input
                  type="text" value={form.paid_to}
                  onChange={(e) => setForm({ ...form, paid_to: e.target.value })}
                  style={styles.formInput}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Bill Reference</label>
                <input
                  type="text" value={form.bill_reference}
                  onChange={(e) => setForm({ ...form, bill_reference: e.target.value })}
                  style={styles.formInput}
                />
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Purpose / Description</label>
              <textarea
                value={form.purpose_description}
                onChange={(e) => setForm({ ...form, purpose_description: e.target.value })}
                style={styles.formTextarea} rows={2}
              />
            </div>
          </div>
        )}

        {/* Proof document */}
        <div style={{ ...styles.formGroup, marginTop: '16px' }}>
          <label style={styles.formLabel}>Proof Document (optional)</label>
          <input
            type="file" accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setProofFile(e.target.files[0] || null)}
            style={styles.formInput}
          />
        </div>

        <button type="submit" disabled={submitting} style={{
          ...styles.submitButton,
          opacity: submitting ? 0.6 : 1,
          cursor: submitting ? 'not-allowed' : 'pointer',
        }}>
          {submitting ? '⏳ Creating...' : '✅ Create Transaction & Generate Receipt'}
        </button>
      </form>
    </div>
  );
}
