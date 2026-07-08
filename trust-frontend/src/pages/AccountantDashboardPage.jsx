import React, { useState, useEffect } from 'react';
import { styles } from '../utils/styles';
import { accountingAPI } from '../services/api';

export default function AccountantDashboardPage({ t }) {
  const [summary, setSummary] = useState(null);
  const [headSummaries, setHeadSummaries] = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, headsRes, txnRes] = await Promise.all([
          accountingAPI.getTransactionSummary(),
          accountingAPI.getAccountHeads({ is_active: true }),
          accountingAPI.getTransactions({ page_size: 10 }),
        ]);
        setSummary(sumRes.data);
        setRecentTxns(
          Array.isArray(txnRes.data) ? txnRes.data : txnRes.data?.results || []
        );

        // Fetch per-head summaries
        const heads = Array.isArray(headsRes.data)
          ? headsRes.data
          : headsRes.data?.results || [];
        const hSums = await Promise.all(
          heads.map(async (h) => {
            try {
              const s = await accountingAPI.getHeadSummary(h.id);
              return { ...h, ...s.data };
            } catch {
              return { ...h, total_income: '0', total_expense: '0', net_balance: '0', transaction_count: 0 };
            }
          })
        );
        setHeadSummaries(hSums);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cardBase = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
  };

  const widgetGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  };

  const widgetCard = (borderColor) => ({
    ...cardBase,
    borderLeft: `4px solid ${borderColor}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  });

  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExportHead = async (headId, headName) => {
    try {
      const res = await accountingAPI.exportAccountHead(headId);
      downloadFile(res.data, `${headName.replace(/\s+/g, '_')}_Report.xlsx`);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export report.');
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '60px 0' }}>
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>📊 Accountant Dashboard</h2>
      </div>

      {/* Overall Summary */}
      <div style={widgetGrid}>
        <div style={widgetCard('#10b981')}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>
            ₹{Number(summary?.total_income || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
            Total Income
          </div>
        </div>
        <div style={widgetCard('#ef4444')}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444' }}>
            ₹{Number(summary?.total_expense || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
            Total Expenses
          </div>
        </div>
        <div style={widgetCard('#4338ca')}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#4338ca' }}>
            ₹{Number(summary?.net_balance || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
            Net Balance
          </div>
        </div>
        <div style={widgetCard('#f59e0b')}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>
            {summary?.total_transactions || 0}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
            Total Transactions
          </div>
        </div>
      </div>

      {/* Per-Head Summary Cards */}
      <h3 style={{ ...styles.sectionTitle, marginBottom: '16px' }}>
        📁 Account Head Summary
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {headSummaries.map((h) => (
          <div key={h.id} style={cardBase}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '12px',
            }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>
                {h.name}
              </h4>
              {h.head_type && (
                <span style={{
                  padding: '2px 10px', borderRadius: '12px', fontSize: '11px',
                  fontWeight: '600', background: '#eef2ff', color: '#4338ca',
                }}>
                  {h.head_type}
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div style={{ textAlign: 'center', padding: '8px', background: '#f0fdf4', borderRadius: '8px' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#059669' }}>
                  ₹{Number(h.total_income || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Income</div>
              </div>
              <div style={{ textAlign: 'center', padding: '8px', background: '#fef2f2', borderRadius: '8px' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#dc2626' }}>
                  ₹{Number(h.total_expense || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Expense</div>
              </div>
              <div style={{ textAlign: 'center', padding: '8px', background: '#eef2ff', borderRadius: '8px' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#4338ca' }}>
                  ₹{Number(h.net_balance || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Balance</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                {h.transaction_count || 0} transactions
              </span>
              <button
                onClick={() => handleExportHead(h.id, h.name)}
                style={{
                  padding: '4px 12px', fontSize: '12px', fontWeight: '600',
                  background: '#10b981', color: 'white', border: 'none',
                  borderRadius: '6px', cursor: 'pointer',
                }}
              >
                📥 Export
              </button>
            </div>
          </div>
        ))}
        {headSummaries.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px', gridColumn: '1 / -1' }}>
            No account heads yet. Create one from the Account Heads page.
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <h3 style={{ ...styles.sectionTitle, marginBottom: '16px' }}>
        🕐 Recent Transactions
      </h3>
      <div style={cardBase}>
        {recentTxns.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '24px' }}>
            No transactions yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentTxns.map((txn) => (
              <div
                key={txn.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', background: '#f9fafb',
                  borderRadius: '8px',
                }}
              >
                <span style={{ fontSize: '20px' }}>
                  {txn.transaction_type === 'INCOME' ? '💰' : '💸'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                    {txn.transaction_type === 'INCOME'
                      ? txn.donor_name || 'Donation'
                      : txn.paid_to || 'Expense'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {txn.account_head_name} • {txn.transaction_date} • {txn.payment_mode}
                  </div>
                </div>
                <div style={{
                  fontSize: '16px', fontWeight: '700',
                  color: txn.transaction_type === 'INCOME' ? '#059669' : '#dc2626',
                }}>
                  {txn.transaction_type === 'INCOME' ? '+' : '-'}₹{Number(txn.amount).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
