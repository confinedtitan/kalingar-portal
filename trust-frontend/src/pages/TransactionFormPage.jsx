import React, { useState, useEffect, useCallback } from 'react';
import { styles } from '../utils/styles';
import { accountingAPI, memberAPI } from '../services/api';
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

import api from '../services/api';

export default function TransactionFormPage({ t, onSuccess, onCancel }) {
  const [heads, setHeads] = useState([]);
  const [members, setMembers] = useState([]);
  const [trustAccounts, setTrustAccounts] = useState([]);
  const [measurementUnit, setMeasurementUnit] = useState('Grams');
  const [form, setForm] = useState({
    account_head: '',
    trust_account: '',
    commodity_type: '',
    transaction_type: 'CREDIT',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
    payment_mode: 'Cash',
    donor_name: '',
    donor_name_ta: '',
    donor_contact: '',
    member: '',
    purpose: '',
    purpose_ta: '',
    paid_to: '',
    paid_to_ta: '',
    purpose_description: '',
    purpose_description_ta: '',
    bill_reference: '',
  });
  const [proofFile, setProofFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  // Inline account head creation
  const [showNewHead, setShowNewHead] = useState(false);
  const [newHead, setNewHead] = useState({ name: '', name_ta: '', head_type: '', description: '', description_ta: '', account_type: 'Revenue' });

  // ── Tamil input hooks (mirrors AddMemberPage pattern exactly) ──
  const setDonorNameTa       = useCallback((v) => setForm(prev => ({ ...prev, donor_name_ta: v })), []);
  const setPurposeTa         = useCallback((v) => setForm(prev => ({ ...prev, purpose_ta: v })), []);
  const setPaidToTa          = useCallback((v) => setForm(prev => ({ ...prev, paid_to_ta: v })), []);
  const setPurposeDescTa     = useCallback((v) => setForm(prev => ({ ...prev, purpose_description_ta: v })), []);
  const setNewHeadNameTa     = useCallback((v) => setNewHead(prev => ({ ...prev, name_ta: v })), []);
  const setNewHeadDescTa     = useCallback((v) => setNewHead(prev => ({ ...prev, description_ta: v })), []);

  const donorNameTaProps    = useTamilInput(form.donor_name_ta,       setDonorNameTa);
  const purposeTaProps      = useTamilInput(form.purpose_ta,          setPurposeTa);
  const paidToTaProps       = useTamilInput(form.paid_to_ta,          setPaidToTa);
  const purposeDescTaProps  = useTamilInput(form.purpose_description_ta, setPurposeDescTa);
  const newHeadNameTaProps  = useTamilInput(newHead.name_ta,          setNewHeadNameTa);
  const newHeadDescTaProps  = useTamilInput(newHead.description_ta,   setNewHeadDescTa);

  useEffect(() => {
    accountingAPI.getAccountHeads({ is_active: true })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setHeads(data);
      })
      .catch(console.error);

    memberAPI.getAll({ page_size: 1000 })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setMembers(data);
      })
      .catch(console.error);

    api.get('/accounting/trust-accounts/?status=Active&page_size=1000')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setTrustAccounts(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (form.member && form.payment_mode !== 'Credit') {
      let targetType = '';
      if (form.payment_mode === 'Cash') {
        targetType = 'Cash';
      } else if (['Bank Transfer', 'UPI', 'Cheque'].includes(form.payment_mode)) {
        targetType = 'Bank';
      } else if (form.payment_mode === 'Commodities') {
        targetType = 'Commodities';
      }

      if (targetType) {
        const savedUserStr = localStorage.getItem('current_user');
        const currentUser = savedUserStr ? JSON.parse(savedUserStr) : null;
        const loginMemberId = currentUser?.id || currentUser?.member_id;
        const custodianId = (targetType === 'Cash' && loginMemberId) ? loginMemberId : form.member;

        const match = trustAccounts.find(
          acc => acc.member && String(acc.member) === String(custodianId) && acc.account_type === targetType
        );
        if (match) {
          setForm(prev => ({ ...prev, trust_account: match.account_id }));
        }
      }
    }
  }, [form.member, form.payment_mode, trustAccounts]);

  const hasCustodianAccount = form.member && form.payment_mode !== 'Credit' && (() => {
    let targetType = '';
    if (form.payment_mode === 'Cash') targetType = 'Cash';
    else if (['Bank Transfer', 'UPI', 'Cheque'].includes(form.payment_mode)) targetType = 'Bank';
    else if (form.payment_mode === 'Commodities') targetType = 'Commodities';

    const savedUserStr = localStorage.getItem('current_user');
    const currentUser = savedUserStr ? JSON.parse(savedUserStr) : null;
    const loginMemberId = currentUser?.id || currentUser?.member_id;
    const custodianId = (targetType === 'Cash' && loginMemberId) ? loginMemberId : form.member;

    return trustAccounts.some(
      acc => acc.member && String(acc.member) === String(custodianId) && acc.account_type === targetType
    );
  })();

  const handleCreateHead = async () => {
    if (!newHead.name.trim()) return;
    try {
      const res = await accountingAPI.createAccountHead(newHead);
      const created = res.data;
      setHeads((prev) => [created, ...prev]);
      setForm((prev) => ({ ...prev, account_head: String(created.id) }));
      setShowNewHead(false);
      setNewHead({ name: '', name_ta: '', head_type: 'Kodai', description: '', description_ta: '', account_type: 'Revenue' });
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
    if (form.payment_mode !== 'Credit' && !form.trust_account) {
      alert('Please select a Trust Account.');
      return;
    }
    setSubmitting(true);
    try {
      const data = new FormData();
      
      // Determine purpose texts with commodity units
      let purposeText = form.purpose;
      let purposeTaText = form.purpose_ta;
      let purposeDescText = form.purpose_description;
      let purposeDescTaText = form.purpose_description_ta;

      if (form.payment_mode === 'Commodities') {
        const suffix = ` [Unit: ${measurementUnit}]`;
        const suffixTa = ` [அலகு: ${measurementUnit}]`;
        if (form.transaction_type === 'CREDIT') {
          if (purposeText) {
            purposeText += suffix;
          } else {
            purposeText = `Commodity unit: ${measurementUnit}`;
          }
          if (purposeTaText) purposeTaText += suffixTa;
        } else {
          if (purposeDescText) {
            purposeDescText += suffix;
          } else {
            purposeDescText = `Commodity unit: ${measurementUnit}`;
          }
          if (purposeDescTaText) purposeDescTaText += suffixTa;
        }
      }

      Object.entries(form).forEach(([key, val]) => {
        if (val !== '' && val !== null && val !== undefined) {
          if (key === 'purpose') {
            data.append(key, purposeText);
          } else if (key === 'purpose_ta') {
            data.append(key, purposeTaText);
          } else if (key === 'purpose_description') {
            data.append(key, purposeDescText);
          } else if (key === 'purpose_description_ta') {
            data.append(key, purposeDescTaText);
          } else {
            data.append(key, val);
          }
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
        trust_account: '',
        commodity_type: '',
        transaction_type: 'CREDIT',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        payment_mode: 'Cash',
        donor_name: '',
        donor_name_ta: '',
        donor_contact: '',
        member: '',
        purpose: '',
        purpose_ta: '',
        paid_to: '',
        paid_to_ta: '',
        purpose_description: '',
        purpose_description_ta: '',
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

  const isIncome = form.transaction_type === 'CREDIT';

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>➕ {t.addTransaction || 'Add Transaction'}</h2>
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
        {/* Member Selection Dropdown */}
        <div style={{ ...styles.formGrid, marginBottom: '24px' }}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>{t.memberSelection || 'Select Member'} (Optional)</label>
            <select
              value={form.member}
              onChange={(e) => {
                const memberId = e.target.value;
                setForm(prev => ({
                  ...prev,
                  member: memberId,
                  donor_name: '',
                  donor_name_ta: '',
                  donor_contact: '',
                }));
              }}
              style={styles.formInput}
            >
              <option value="">{t.selectMember || 'Select Member (None)'}</option>
              {members
                .filter(m => m.is_active && m.is_family_head)
                .map((m) => (
                  <option key={m.id} value={m.id}>{m.name}{m.name_ta ? ` / ${m.name_ta}` : ''}</option>
                ))
              }
            </select>
          </div>
        </div>

        {/* Account Head selection */}
        <div style={{ ...styles.formGrid, marginBottom: '24px' }}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>{t.accountHead || 'Account Head'} *</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={form.account_head}
                onChange={(e) => setForm({ ...form, account_head: e.target.value })}
                style={{ ...styles.formInput, flex: 1 }}
                required
              >
                <option value="">{t.selectAccountHead || 'Select Account Head'}</option>
                {heads.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}{h.name_ta ? ` / ${h.name_ta}` : ''}</option>
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
            <label style={styles.formLabel}>{t.transactionType || 'Transaction Type'} *</label>
            <select
              value={form.transaction_type}
              onChange={(e) => setForm({ ...form, transaction_type: e.target.value })}
              style={styles.formInput}
            >
              <option value="CREDIT">💰 {t.credit || 'Credit'}</option>
              <option value="DEBIT">💸 {t.debit || 'Debit'}</option>
            </select>
          </div>
        </div>

        {/* Inline new head form — now with Tamil fields */}
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
                <label style={{ ...styles.formLabel, fontSize: '12px' }}>Name (English) {langTag('EN')} *</label>
                <input
                  type="text" placeholder="Name *" value={newHead.name}
                  onChange={(e) => setNewHead({ ...newHead, name: e.target.value })}
                  style={styles.formInput}
                />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ ...styles.formLabel, fontSize: '12px' }}>Name (Tamil) {langTag('தமிழ்')}</label>
                <input
                  type="text" placeholder="Tamil name" value={newHead.name_ta}
                  {...newHeadNameTaProps}
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
                  <option value="Kodai">Kodai</option>
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
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '10px' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ ...styles.formLabel, fontSize: '12px' }}>Description (English) {langTag('EN')}</label>
                <textarea
                  value={newHead.description}
                  onChange={(e) => setNewHead({ ...newHead, description: e.target.value })}
                  style={styles.formTextarea} rows={2}
                />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ ...styles.formLabel, fontSize: '12px' }}>Description (Tamil) {langTag('தமிழ்')}</label>
                <textarea
                  value={newHead.description_ta}
                  {...newHeadDescTaProps}
                  style={styles.formTextarea} rows={2}
                />
              </div>
            </div>
          </div>
        )}

        {/* Core fields */}
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>
              {form.payment_mode === 'Commodities' ? (t.quantityWeight || 'Quantity (Weight)') : (t.amount || 'Amount')} *
            </label>
            <input
              type="number" step="any" min="0.0001" required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              style={styles.formInput} placeholder="0.00"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>{t.date || 'Date'} *</label>
            <input
              type="date" required value={form.transaction_date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
              style={styles.formInput}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>{t.paymentMode || 'Payment Mode'} *</label>
            <select
              value={form.payment_mode}
              onChange={(e) => {
                const mode = e.target.value;
                setForm(prev => ({
                  ...prev,
                  payment_mode: mode,
                  trust_account: '',
                  commodity_type: mode === 'Commodities' ? 'Gold' : '',
                }));
              }}
              style={styles.formInput}
            >
              <option value="Cash">{t.cash || 'Cash'}</option>
              <option value="Bank Transfer">{t.bankTransfer || 'Bank Transfer'}</option>
              <option value="UPI">UPI</option>
              <option value="Cheque">{t.cheque || 'Cheque'}</option>
              <option value="Credit">{t.credit || 'Credit'}</option>
              <option value="Commodities">{t.commodities || 'Commodities'}</option>
            </select>
          </div>
        </div>

        {/* Dynamic Fields row: Trust Account & Commodities properties */}
        {(form.payment_mode !== 'Credit' || form.payment_mode === 'Commodities') && (
          <div style={{ ...styles.formGrid, marginTop: '16px', marginBottom: '24px' }}>
            {form.payment_mode !== 'Credit' && (
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>{t.trustAccount || 'Trust Account'} *</label>
                <select
                  required
                  value={form.trust_account}
                  onChange={(e) => setForm({ ...form, trust_account: e.target.value })}
                  style={styles.formInput}
                  disabled={form.transaction_type === 'CREDIT' && form.payment_mode === 'Cash' && hasCustodianAccount}
                >
                  <option value="">Select Trust Account</option>
                  {trustAccounts
                    .filter(acc => {
                      if (form.payment_mode === 'Cash') return acc.account_type === 'Cash';
                      if (['Bank Transfer', 'UPI', 'Cheque'].includes(form.payment_mode)) return acc.account_type === 'Bank';
                      if (form.payment_mode === 'Commodities') return acc.account_type === 'Commodities';
                      return false;
                    })
                    .map(acc => (
                      <option key={acc.account_id} value={acc.account_id}>
                        {acc.account_name} ({acc.account_type})
                      </option>
                    ))}
                </select>
              </div>
            )}

            {form.payment_mode === 'Commodities' && (
              <>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>{t.commodityType || 'Commodity Type'} *</label>
                  <select
                    required
                    value={form.commodity_type}
                    onChange={(e) => setForm({ ...form, commodity_type: e.target.value })}
                    style={styles.formInput}
                  >
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>{t.measurementUnit || 'Measurement Unit'} *</label>
                  <select
                    required
                    value={measurementUnit}
                    onChange={(e) => setMeasurementUnit(e.target.value)}
                    style={styles.formInput}
                  >
                    <option value="Grams">Grams</option>
                    <option value="Ounces">Ounces</option>
                    <option value="Sovereigns">Sovereigns</option>
                  </select>
                </div>
              </>
            )}
          </div>
        )}

        {/* Conditional fields based on type */}
        {isIncome ? (
          <div style={{ marginTop: '24px' }}>
            <h4 style={{ ...styles.subsectionTitle, color: '#059669' }}>💰 {t.incomeDetails || 'Income / Donor Details'}</h4>
            {!form.member && (
              <div style={styles.formGrid}>
                {/* Donor Name (English) */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>{t.donorName || 'Donor Name'} {langTag('EN')}</label>
                  <input
                    type="text" value={form.donor_name}
                    onChange={(e) => setForm({ ...form, donor_name: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
                {/* Donor Name (Tamil) */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>{t.donorNameTamil || 'Donor Name (Tamil)'} {langTag('தமிழ்')}</label>
                  <input
                    type="text" value={form.donor_name_ta}
                    {...donorNameTaProps}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>{t.donorContact || 'Donor Contact'}</label>
                  <input
                    type="text" value={form.donor_contact}
                    onChange={(e) => setForm({ ...form, donor_contact: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
              </div>
            )}
            {/* Purpose (English) */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>{t.purpose || 'Purpose / Remarks'} {langTag('EN')}</label>
              <textarea
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                style={styles.formTextarea} rows={2}
              />
            </div>
            {/* Purpose (Tamil) */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>{t.purposeTamil || 'Purpose / Remarks (Tamil)'} {langTag('தமிழ்')}</label>
              <textarea
                value={form.purpose_ta}
                {...purposeTaProps}
                style={styles.formTextarea} rows={2}
              />
            </div>
          </div>
        ) : (
          <div style={{ marginTop: '24px' }}>
            <h4 style={{ ...styles.subsectionTitle, color: '#dc2626' }}>💸 {t.expenseDetails || 'Expense Details'}</h4>
            <div style={styles.formGrid}>
              {/* Paid To (English) */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>{t.paidTo || 'Paid To'} {langTag('EN')}</label>
                <input
                  type="text" value={form.paid_to}
                  onChange={(e) => setForm({ ...form, paid_to: e.target.value })}
                  style={styles.formInput}
                />
              </div>
              {/* Paid To (Tamil) */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>{t.paidToTamil || 'Paid To (Tamil)'} {langTag('தமிழ்')}</label>
                <input
                  type="text" value={form.paid_to_ta}
                  {...paidToTaProps}
                  style={styles.formInput}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>{t.billReference || 'Bill Reference'}</label>
                <input
                  type="text" value={form.bill_reference}
                  onChange={(e) => setForm({ ...form, bill_reference: e.target.value })}
                  style={styles.formInput}
                />
              </div>
            </div>
            {/* Purpose/Description (English) */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>{t.purposeDescription || 'Purpose / Description'} {langTag('EN')}</label>
              <textarea
                value={form.purpose_description}
                onChange={(e) => setForm({ ...form, purpose_description: e.target.value })}
                style={styles.formTextarea} rows={2}
              />
            </div>
            {/* Purpose/Description (Tamil) */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>{t.purposeDescriptionTamil || 'Purpose / Description (Tamil)'} {langTag('தமிழ்')}</label>
              <textarea
                value={form.purpose_description_ta}
                {...purposeDescTaProps}
                style={styles.formTextarea} rows={2}
              />
            </div>
          </div>
        )}

        {/* Proof document */}
        <div style={{ ...styles.formGroup, marginTop: '16px' }}>
          <label style={styles.formLabel}>{t.proofDocument || 'Proof Document (optional)'}</label>
          <input
            type="file" accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setProofFile(e.target.files[0] || null)}
            style={styles.formInput}
          />
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
          <button type="submit" disabled={submitting} style={{
            ...styles.submitButton,
            opacity: submitting ? 0.6 : 1,
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}>
            {submitting ? '⏳ Creating...' : '✅ Create Transaction & Generate Receipt'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{ ...styles.submitButton, backgroundColor: '#64748b' }}
            >
              {t.cancel || 'Cancel'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
