import React, { useState, useEffect, useCallback } from 'react';
import { styles } from '../utils/styles';
import { accountingAPI } from '../services/api';
import { formatDate } from '../utils/dateFormatter';
import { ArrowLeft, FileText, Download } from 'lucide-react';

export default function AccountHeadStatementPage({ head, t, onBack }) {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  const fetchLedger = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch Head summary
      const sumRes = await accountingAPI.getHeadSummary(head.id);
      setSummary(sumRes.data);

      // Fetch chronological transactions paginated
      const txRes = await accountingAPI.getTransactions({
        account_head: head.id,
        page: page,
        page_size: pageSize,
      });

      const responseData = txRes.data;
      if (responseData && !Array.isArray(responseData)) {
        setTransactions(responseData.results || []);
        const totalCount = responseData.count || 0;
        setTotalPages(Math.ceil(totalCount / pageSize) || 1);
      } else {
        setTransactions(responseData || []);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching ledger statement:', err);
    } finally {
      setLoading(false);
    }
  }, [head.id, page, pageSize]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const handleExport = async () => {
    try {
      const res = await accountingAPI.exportAccountHead(head.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${head.name.replace(/\s+/g, '_')}_Statement.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export statement.');
    }
  };

  const cardBase = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    marginBottom: '24px',
  };

  const statCard = (title, amount, color) => (
    <div style={{
      flex: 1, minWidth: '180px', background: 'white', border: '1px solid #e2e8f0',
      borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px'
    }}>
      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>{title}</span>
      <strong style={{ fontSize: '20px', color: color }}>₹{Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
    </div>
  );

  return (
    <div style={styles.page}>
      {/* Header with back button */}
      <div style={{ ...styles.pageHeader, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBack}
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
              {t.ledgerStatement || 'Ledger Statement'}
            </h2>
            <div style={{ fontSize: '14px', color: '#4f46e5', fontWeight: '600', marginTop: '2px' }}>
              {head.name} {head.name_ta ? ` / ${head.name_ta}` : ''}
            </div>
          </div>
        </div>

        <button
          onClick={handleExport}
          style={{ ...styles.exportButton, background: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Download size={16} />
          {t.exportReport || 'Export'}
        </button>
      </div>

      {/* Summary Block */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {statCard(t.accountType || 'Account Type', head.account_type || 'Revenue', '#4338ca')}
        {statCard(t.totalDebits || 'Total Debits', summary?.total_debits || 0, '#dc2626')}
        {statCard(t.totalCredits || 'Total Credits', summary?.total_credits || 0, '#059669')}
        {statCard(t.netBalance || 'Net Balance', summary?.net_balance || 0, '#1e3a8a')}
      </div>

      {/* Ledger Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>{t.date || 'Date'}</th>
              <th style={styles.th}>{t.type || 'Type'}</th>
              <th style={styles.th}>{t.amount || 'Amount'}</th>
              <th style={styles.th}>{t.mode || 'Mode'}</th>
              <th style={styles.th}>{t.donorPayee || 'Donor / Payee'}</th>
              <th style={styles.th}>{t.purpose || 'Purpose / Remarks'}</th>
              <th style={styles.th}>{t.receiptNo || 'Receipt No'}</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => {
              const isDebit = txn.transaction_type === 'DEBIT';
              return (
                <tr key={txn.id} style={styles.tr}>
                  <td style={{ ...styles.td, fontSize: '13px', color: '#6b7280' }}>
                    {txn.transaction_date ? formatDate(txn.transaction_date) : ''}
                  </td>
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
                    ₹{Number(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ ...styles.td, fontSize: '13px' }}>{txn.payment_mode}</td>
                  <td style={styles.td}>
                    {isDebit ? (
                      <div>
                        {txn.member_name ? (
                          <>
                            <strong>{txn.member_name}</strong>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>Member ID: {txn.member_id_display}</div>
                          </>
                        ) : (
                          txn.paid_to || '—'
                        )}
                      </div>
                    ) : (
                      <div>
                        {txn.member_name ? (
                          <>
                            <strong>{txn.member_name}</strong>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>Member ID: {txn.member_id_display}</div>
                          </>
                        ) : (
                          txn.donor_name || '—'
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ ...styles.td, fontSize: '13px', color: '#374151' }}>
                    {isDebit ? (txn.purpose_description || txn.purpose || '—') : (txn.purpose || '—')}
                  </td>
                  <td style={{ ...styles.td, fontSize: '13px', fontWeight: '500' }}>
                    {txn.receipt_number || '—'}
                  </td>
                </tr>
              );
            })}
            {transactions.length === 0 && !loading && (
              <tr>
                <td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
                  No transactions recorded under this account head yet.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
                  Loading ledger data...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            style={{
              padding: '6px 12px', background: page === 1 ? '#f3f4f6' : 'white',
              border: '1px solid #d1d5db', borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Prev
          </button>
          <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: '600' }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            style={{
              padding: '6px 12px', background: page === totalPages ? '#f3f4f6' : 'white',
              border: '1px solid #d1d5db', borderRadius: '6px', cursor: page === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
