import React, { useState, useEffect, useCallback } from 'react';
import { styles } from '../utils/styles';
import { accountingAPI } from '../services/api';

export default function TransactionListPage({ isAdmin, t, onAddTransactionClick }) {
  const [transactions, setTransactions] = useState([]);
  const [heads, setHeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    account_head: '', transaction_type: '', payment_mode: '',
    from: '', to: '', search: '',
  });

  const [currentPageNum, setCurrentPageNum] = useState(1);
  const pageSize = Number(localStorage.getItem('pageSize') || 10);

  const fetchTransactions = useCallback(async () => {
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await accountingAPI.getTransactions(params);
      setTransactions(Array.isArray(res.data) ? res.data : res.data?.results || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => {
    accountingAPI.getAccountHeads().then(r => setHeads(Array.isArray(r.data) ? r.data : r.data?.results || [])).catch(console.error);
  }, []);
  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);
  useEffect(() => { setCurrentPageNum(1); }, [filters]);

  const handleDelete = async (txn) => {
    if (!window.confirm(`Soft-delete this transaction of ₹${txn.amount}?`)) return;
    try { await accountingAPI.deleteTransaction(txn.id); fetchTransactions(); }
    catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const downloadReceipt = async (rid) => {
    try {
      const res = await accountingAPI.downloadReceipt(rid);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url; a.download = `receipt_${rid}.pdf`;
      document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
    } catch (err) { console.error(err); }
  };

  const totalPages = Math.ceil(transactions.length / pageSize);
  const displayedTransactions = transactions.slice((currentPageNum - 1) * pageSize, currentPageNum * pageSize);

  return (
    <div style={styles.page}>
      <div style={{ ...styles.pageHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ ...styles.pageTitle, marginBottom: 0 }}>📋 Transactions</h2>
        <button
          onClick={onAddTransactionClick}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
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
          ➕ {t.addTransaction || 'Add Transaction'}
        </button>
      </div>

      <div style={{ display:'flex', gap:'12px', marginBottom:'24px', flexWrap:'wrap', alignItems:'flex-end' }}>
        <input type="text" placeholder="Search donor/payee..." value={filters.search}
          onChange={e => setFilters({...filters, search: e.target.value})}
          style={{...styles.searchInput, flex:'1 1 200px', minWidth:'180px'}} />
        <select value={filters.account_head} onChange={e => setFilters({...filters, account_head: e.target.value})} style={{...styles.filterSelect, minWidth:'160px'}}>
          <option value="">All Heads</option>
          {heads.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
        <select value={filters.transaction_type} onChange={e => setFilters({...filters, transaction_type: e.target.value})} style={styles.filterSelect}>
          <option value="">All Types</option><option value="CREDIT">{t.credit || 'Credit'}</option><option value="DEBIT">{t.debit || 'Debit'}</option>
        </select>
        <select value={filters.payment_mode} onChange={e => setFilters({...filters, payment_mode: e.target.value})} style={styles.filterSelect}>
          <option value="">All Modes</option><option value="Cash">Cash</option><option value="Bank Transfer">Bank Transfer</option>
          <option value="UPI">UPI</option><option value="Cheque">Cheque</option><option value="Credit">Credit</option>
        </select>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <input type="date" value={filters.from} onChange={e => setFilters({...filters, from: e.target.value})} style={{...styles.formInput, padding:'8px 12px', fontSize:'13px'}} />
          <span style={{color:'#9ca3af'}}>→</span>
          <input type="date" value={filters.to} onChange={e => setFilters({...filters, to: e.target.value})} style={{...styles.formInput, padding:'8px 12px', fontSize:'13px'}} />
        </div>
      </div>

      {loading ? <p style={{textAlign:'center',color:'#6b7280',padding:'60px'}}>Loading...</p> : (
        <div style={styles.tableContainer}>
          <table style={{...styles.table, minWidth:'1100px'}}>
            <thead><tr>
              <th style={styles.th}>{t.date}</th><th style={styles.th}>{t.accountHeads || 'Account Head'}</th><th style={styles.th}>{t.type || 'Type'}</th>
              <th style={styles.th}>{t.amount} (₹)</th><th style={styles.th}>{t.mode || 'Mode'}</th><th style={styles.th}>{t.donorPayee || 'Donor/Payee'}</th>
              <th style={styles.th}>{t.receiptNo || 'Receipt #'}</th><th style={styles.th}>{t.enteredBy || 'Entered By'}</th><th style={styles.th}>{t.actions}</th>
            </tr></thead>
            <tbody>
              {displayedTransactions.map(txn => (
                <tr key={txn.id} style={styles.tr}>
                  <td style={{...styles.td, fontSize:'13px', whiteSpace:'nowrap'}}>{txn.transaction_date}</td>
                  <td style={{...styles.td, fontWeight:'600'}}>{txn.account_head_name}</td>
                  <td style={styles.td}>
                    <span style={{ padding:'2px 10px', borderRadius:'12px', fontSize:'11px', fontWeight:'700',
                      background: txn.transaction_type==='CREDIT' ? '#d1fae5':'#fee2e2',
                      color: txn.transaction_type==='CREDIT' ? '#065f46':'#991b1b' }}>
                      {txn.transaction_type === 'CREDIT' ? (t.credit || 'Credit') : (t.debit || 'Debit')}
                    </span>
                  </td>
                  <td style={{...styles.td, fontWeight:'700', color: txn.transaction_type==='CREDIT'?'#059669':'#dc2626'}}>
                    {Number(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style={{...styles.td, fontSize:'13px'}}>{txn.payment_mode}</td>
                  <td style={styles.td}>
                    {txn.transaction_type === 'CREDIT' ? (
                      <div>
                        <div>{txn.donor_name || txn.member_name || '—'}</div>
                        {txn.donor_name_ta && (
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{txn.donor_name_ta}</div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div>{txn.paid_to || txn.member_name || '—'}</div>
                        {txn.paid_to_ta && (
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{txn.paid_to_ta}</div>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{...styles.td, fontSize:'12px', color:'#4338ca', fontWeight:'600'}}>{txn.receipt_number||'—'}</td>
                  <td style={{...styles.td, fontSize:'12px'}}>{txn.entered_by_name||'—'}</td>
                  <td style={styles.td}>
                    <div style={{display:'flex', gap:'4px', flexWrap:'wrap'}}>
                      {txn.receipt_id && <button onClick={()=>downloadReceipt(txn.receipt_id)} style={{...styles.actionButton, background:'#4338ca', fontSize:'11px', padding:'3px 8px'}}>📄 Receipt</button>}
                      <button onClick={()=>handleDelete(txn)} style={{...styles.actionButton, background:'#ef4444', fontSize:'11px', padding:'3px 8px'}}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {transactions.length===0 && <tr><td colSpan={9} style={{...styles.td, textAlign:'center', color:'#9ca3af', padding:'40px'}}>No transactions found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          padding: '12px 24px',
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <button
            disabled={currentPageNum === 1}
            onClick={() => setCurrentPageNum(prev => Math.max(prev - 1, 1))}
            style={{
              padding: '8px 16px',
              backgroundColor: currentPageNum === 1 ? '#e2e8f0' : '#4338ca',
              color: currentPageNum === 1 ? '#94a3b8' : 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: currentPageNum === 1 ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              transition: 'all 0.2s'
            }}
          >
            ← {t.previous || 'Previous'}
          </button>
          
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>
            Page {currentPageNum} of {totalPages} ({transactions.length} transactions)
          </span>
          
          <button
            disabled={currentPageNum === totalPages}
            onClick={() => setCurrentPageNum(prev => Math.min(prev + 1, totalPages))}
            style={{
              padding: '8px 16px',
              backgroundColor: currentPageNum === totalPages ? '#e2e8f0' : '#4338ca',
              color: currentPageNum === totalPages ? '#94a3b8' : 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: currentPageNum === totalPages ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              transition: 'all 0.2s'
            }}
          >
            {t.next || 'Next'} →
          </button>
        </div>
      )}
    </div>
  );
}
