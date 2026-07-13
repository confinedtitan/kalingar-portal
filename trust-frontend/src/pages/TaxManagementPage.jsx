import React, { useState, useEffect } from 'react';
import { styles } from '../utils/styles';
import api from '../services/api';
import { formatDate } from '../utils/dateFormatter';
import { Edit2 } from 'lucide-react';

export default function TaxManagementPage({ t }) {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [accountHeads, setAccountHeads] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    base_amount: 1000,
    description: '',
    account_head: ''
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [editTaxId, setEditTaxId] = useState(null);

  useEffect(() => {
    fetchTaxes();
    fetchAccountHeads();
  }, []);

  const fetchAccountHeads = async () => {
    try {
      const res = await api.get('/accounting/account-heads/?is_active=true');
      const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setAccountHeads(data);
    } catch (err) {
      console.error('Failed to load account heads', err);
    }
  };

  const fetchTaxes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/members/taxes/');
      const responseData = response.data;
      setTaxes(Array.isArray(responseData) ? responseData : Array.isArray(responseData?.results) ? responseData.results : []);
      setError(null);
    } catch (err) {
      setError(t.taxCreatedError || 'Failed to load taxes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        account_head: formData.account_head || null
      };
      if (isEditMode) {
        await api.put(`/members/taxes/${editTaxId}/`, payload);
        setSuccess(t.taxUpdatedSuccess || 'Tax event updated successfully');
        setIsEditMode(false);
        setEditTaxId(null);
      } else {
        await api.post('/members/taxes/', payload);
        setSuccess(t.taxCreatedSuccess || 'Tax created successfully');
      }
      setFormData({ name: '', base_amount: 1000, description: '', account_head: '' });
      fetchTaxes();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(isEditMode ? (t.taxUpdateError || 'Failed to update tax event') : (t.taxCreatedError || 'Failed to create tax'));
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEditClick = (tax) => {
    if (tax.status === 'Generated') return;
    setIsEditMode(true);
    setEditTaxId(tax.id);
    setFormData({
      name: tax.name,
      base_amount: tax.base_amount,
      description: tax.description || '',
      account_head: tax.account_head ? String(tax.account_head) : ''
    });
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditTaxId(null);
    setFormData({ name: '', base_amount: 1000, description: '', account_head: '' });
  };

  const handleGenerateTaxes = async (taxId) => {
    if (!window.confirm(t.generateConfirm || 'Are you sure you want to generate taxes for all members for this tax event?')) return;
    
    try {
      setLoading(true);
      const res = await api.post('/members/taxes/generate_taxes/', { tax_id: taxId });
      setSuccess(res.data?.message || res.message || 'Taxes generated successfully');
      fetchTaxes();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(t.taxGeneratedError || 'Failed to generate taxes');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (loading && taxes.length === 0) return <div style={styles.loadingState}>{t.loading || 'Loading...'}</div>;

  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>{t.taxManagementTitle || 'Tax Management'}</h2>
      
      {error && <div style={{ ...styles.alert, ...styles.alertError }}>{error}</div>}
      {success && <div style={{ ...styles.alert, ...styles.alertSuccess }}>{success}</div>}
      
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          {isEditMode ? (t.editTaxEvent || 'Edit Tax Event') : (t.createNewTaxEvent || 'Create New Tax Event')}
        </h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>{t.taxName || 'Tax Name'} *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={styles.formInput}
                placeholder={t.taxNamePlaceholder || "e.g. Annual Tax 2026"}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>{t.baseAmount || 'Base Amount (₹)'} *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.base_amount}
                onChange={(e) => setFormData({ ...formData, base_amount: parseInt(e.target.value) || 0 })}
                style={styles.formInput}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>{t.accountHead || 'Account Head'}</label>
              <select
                value={formData.account_head}
                onChange={(e) => setFormData({ ...formData, account_head: e.target.value })}
                style={styles.formInput}
              >
                <option value="">{t.selectAccountHead || 'Select Account Head'}</option>
                {accountHeads.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}{h.name_ta ? ` / ${h.name_ta}` : ''}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>{t.description || 'Description'}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={styles.formTextarea}
              rows="2"
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={styles.submitButton}>
              {isEditMode ? (t.updateTaxEventBtn || 'Update Tax Event') : (t.createTaxEventBtn || 'Create Tax Event')}
            </button>
            {isEditMode && (
              <button
                type="button"
                onClick={handleCancelEdit}
                style={{
                  ...styles.submitButton,
                  background: '#ef4444',
                  color: 'white'
                }}
              >
                {t.cancelBtn || 'Cancel'}
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={{ ...styles.card, marginTop: '20px' }}>
        <h3 style={styles.cardTitle}>{t.existingTaxEvents || 'Existing Tax Events'}</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>{t.thName || 'Name'}</th>
                <th style={styles.th}>{t.thBaseAmount || 'Base Amount'}</th>
                <th style={styles.th}>{t.status || 'Status'}</th>
                <th style={styles.th}>{t.generatedDate || 'Generated Date'}</th>
                <th style={styles.th}>{t.thCreatedAt || 'Created At'}</th>
                <th style={styles.th}>{t.thActions || 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {taxes.map((tax) => (
                <tr key={tax.id}>
                  <td style={styles.td}>{tax.name}</td>
                  <td style={styles.td}>₹{tax.base_amount}</td>
                  <td style={styles.td}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: tax.status === 'Generated' ? '#def7ec' : '#e1effe',
                      color: tax.status === 'Generated' ? '#03543f' : '#1e429f'
                    }}>
                      {tax.status || 'Open'}
                    </span>
                  </td>
                  <td style={styles.td}>{tax.generated_date ? formatDate(tax.generated_date) : '-'}</td>
                  <td style={styles.td}>{formatDate(tax.created_at)}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleEditClick(tax)}
                        disabled={tax.status === 'Generated'}
                        title={tax.status === 'Generated' ? 'Cannot edit generated tax' : 'Edit tax'}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: tax.status === 'Generated' ? 'not-allowed' : 'pointer',
                          backgroundColor: tax.status === 'Generated' ? '#f3f4f6' : '#e5e7eb',
                          color: tax.status === 'Generated' ? '#9ca3af' : '#4b5563',
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      
                      {tax.status !== 'Generated' ? (
                        <button 
                          onClick={() => handleGenerateTaxes(tax.id)}
                          style={{ ...styles.actionButton, background: '#2563eb', color: 'white' }}
                        >
                          {t.generateForAllMembers || 'Generate for All Members'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 'bold' }}>
                          ✓ Generated
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {taxes.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ ...styles.td, textAlign: 'center' }}>{t.noTaxEvents || 'No tax events found.'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
