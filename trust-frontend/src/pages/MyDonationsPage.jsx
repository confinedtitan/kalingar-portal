import React, { useState, useEffect } from 'react';
import { styles } from '../utils/styles';
import { accountingAPI } from '../services/api';

export default function MyDonationsPage({ member, t }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    accountingAPI.getMyDonations()
      .then(r => setData(r.data))
      .catch(err => console.error('My donations error:', err))
      .finally(() => setLoading(false));
  }, []);

  const downloadReceipt = async (rid) => {
    try {
      const res = await accountingAPI.downloadReceipt(rid);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url; a.download = `receipt_${rid}.pdf`;
      document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
    } catch (err) { console.error(err); alert('Failed to download receipt.'); }
  };

  if (loading) return <div style={styles.page}><p style={{textAlign:'center',color:'#6b7280',padding:'60px'}}>Loading donations...</p></div>;

  const donations = data?.donations || [];
  const lifetimeTotal = data?.lifetime_total || '0';
  const perHead = data?.per_head_breakdown || [];

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>🎁 My Donations</h2>
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'20px', marginBottom:'32px' }}>
        <div style={{
          background:'white', borderRadius:'12px', padding:'24px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)',
          borderLeft:'4px solid #10b981', display:'flex', flexDirection:'column', gap:'4px',
        }}>
          <div style={{fontSize:'28px', fontWeight:'700', color:'#10b981'}}>₹{Number(lifetimeTotal).toLocaleString()}</div>
          <div style={{fontSize:'14px', color:'#6b7280', fontWeight:'500'}}>Lifetime Donations</div>
        </div>
        <div style={{
          background:'white', borderRadius:'12px', padding:'24px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)',
          borderLeft:'4px solid #4338ca', display:'flex', flexDirection:'column', gap:'4px',
        }}>
          <div style={{fontSize:'28px', fontWeight:'700', color:'#4338ca'}}>{donations.length}</div>
          <div style={{fontSize:'14px', color:'#6b7280', fontWeight:'500'}}>Total Donations</div>
        </div>
      </div>

      {/* Per-head breakdown */}
      {perHead.length > 0 && (
        <div style={{ marginBottom:'32px' }}>
          <h3 style={{...styles.sectionTitle, marginBottom:'12px'}}>Breakdown by Account Head</h3>
          <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
            {perHead.map((ph, i) => (
              <div key={i} style={{
                background:'white', borderRadius:'10px', padding:'14px 20px',
                boxShadow:'0 1px 2px rgba(0,0,0,0.06)', border:'1px solid #e5e7eb',
                minWidth:'180px',
              }}>
                <div style={{fontSize:'14px', fontWeight:'600', color:'#1a1a1a', marginBottom:'4px'}}>
                  {ph.account_head__name}
                </div>
                <div style={{fontSize:'18px', fontWeight:'700', color:'#059669'}}>
                  ₹{Number(ph.total || 0).toLocaleString()}
                </div>
                <div style={{fontSize:'11px', color:'#9ca3af'}}>{ph.count} donation{ph.count !== 1 ? 's' : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Donations table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead><tr>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Account Head</th>
            <th style={styles.th}>Amount</th>
            <th style={styles.th}>Payment Mode</th>
            <th style={styles.th}>Purpose</th>
            <th style={styles.th}>Receipt</th>
          </tr></thead>
          <tbody>
            {donations.map(d => (
              <tr key={d.id} style={styles.tr}>
                <td style={{...styles.td, fontSize:'13px', whiteSpace:'nowrap'}}>{d.transaction_date}</td>
                <td style={{...styles.td, fontWeight:'600'}}>{d.account_head_name}</td>
                <td style={{...styles.td, fontWeight:'700', color:'#059669'}}>₹{Number(d.amount).toLocaleString()}</td>
                <td style={{...styles.td, fontSize:'13px'}}>{d.payment_mode}</td>
                <td style={{...styles.td, fontSize:'13px', color:'#6b7280'}}>{d.purpose || '—'}</td>
                <td style={styles.td}>
                  {d.receipt_id ? (
                    <button onClick={() => downloadReceipt(d.receipt_id)} style={{
                      ...styles.actionButton, background:'#4338ca', fontSize:'12px', padding:'4px 10px',
                    }}>📄 Download</button>
                  ) : '—'}
                </td>
              </tr>
            ))}
            {donations.length === 0 && (
              <tr><td colSpan={6} style={{...styles.td, textAlign:'center', color:'#9ca3af', padding:'40px'}}>
                No donation records found.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
