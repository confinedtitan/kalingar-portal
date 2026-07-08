import React, { useState, useEffect } from 'react';
import { styles } from '../utils/styles';
import api from '../services/api';

export default function TaxManagementPage({ t }) {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    base_amount: 1000,
    description: ''
  });

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/members/taxes/');
      const responseData = response.data;
      setTaxes(Array.isArray(responseData) ? responseData : Array.isArray(responseData?.results) ? responseData.results : []);
      setError(null);
    } catch (err) {
      setError('Failed to load taxes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/members/taxes/', formData);
      setSuccess('Tax created successfully');
      setFormData({ name: '', base_amount: 1000, description: '' });
      fetchTaxes();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to create tax');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleGenerateTaxes = async (taxId) => {
    if (!window.confirm('Are you sure you want to generate taxes for all members for this tax event?')) return;
    
    try {
      setLoading(true);
      const res = await api.post('/members/taxes/generate_taxes/', { tax_id: taxId });
      setSuccess(res.data?.message || res.message || 'Taxes generated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to generate taxes');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (loading && taxes.length === 0) return <div style={styles.loadingState}>Loading...</div>;

  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>Tax Management</h2>
      
      {error && <div style={{ ...styles.alert, ...styles.alertError }}>{error}</div>}
      {success && <div style={{ ...styles.alert, ...styles.alertSuccess }}>{success}</div>}
      
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Create New Tax Event</h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Tax Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={styles.formInput}
                placeholder="e.g. Annual Tax 2026"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Base Amount (₹) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.base_amount}
                onChange={(e) => setFormData({ ...formData, base_amount: parseInt(e.target.value) || 0 })}
                style={styles.formInput}
              />
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={styles.formTextarea}
              rows="2"
            />
          </div>
          
          <button type="submit" style={styles.submitButton}>
            Create Tax Event
          </button>
        </form>
      </div>

      <div style={{ ...styles.card, marginTop: '20px' }}>
        <h3 style={styles.cardTitle}>Existing Tax Events</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Base Amount</th>
                <th style={styles.th}>Created At</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {taxes.map((tax) => (
                <tr key={tax.id}>
                  <td style={styles.td}>{tax.name}</td>
                  <td style={styles.td}>₹{tax.base_amount}</td>
                  <td style={styles.td}>{new Date(tax.created_at).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <button 
                      onClick={() => handleGenerateTaxes(tax.id)}
                      style={{ ...styles.actionButton, background: '#2563eb', color: 'white' }}
                    >
                      Generate for All Members
                    </button>
                  </td>
                </tr>
              ))}
              {taxes.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ ...styles.td, textAlign: 'center' }}>No tax events found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
