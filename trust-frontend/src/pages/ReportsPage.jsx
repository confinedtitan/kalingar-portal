import React, { useState, useEffect } from 'react';
import { styles } from '../utils/styles';
import api, { accountingAPI } from '../services/api';
import { formatDate } from '../utils/dateFormatter';
import { BarChart3, BookOpen, Calendar, CheckSquare, Coins, DollarSign, Filter, FileSpreadsheet, ShieldAlert, Users } from 'lucide-react';

export default function ReportsPage({ t }) {
  const [activeReport, setActiveReport] = useState('balance_sheet');
  const [loading, setLoading] = useState(false);
  const [heads, setHeads] = useState([]);
  const [reportData, setReportData] = useState(null);

  // Common filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // 1. Balance Sheet State
  const [balanceSheetHeads, setBalanceSheetHeads] = useState([]);

  // 2. Multi-Type Transaction Filter State
  const [selectedHeadTypes, setSelectedHeadTypes] = useState({ General: true, Kodai: true });
  const [multiTypeTxns, setMultiTypeTxns] = useState([]);

  // 3. Head Wise By Type State
  const [headsByType, setHeadsByType] = useState({});

  // 4. Single Account Head State
  const [selectedHead, setSelectedHead] = useState('');
  const [singleHeadTxns, setSingleHeadTxns] = useState([]);
  const [singleHeadBalance, setSingleHeadBalance] = useState({ debits: 0, credits: 0, net: 0 });

  // 5. Commodity Asset State
  const [commoditySummary, setCommoditySummary] = useState(null);

  // 6. Bank Ledger State
  const [bankTxns, setBankTxns] = useState([]);

  // 7. Cash Ledger State
  const [cashTxns, setCashTxns] = useState([]);

  // 8. Member Balance Matrix State
  const [memberBalances, setMemberBalances] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');

  // 9. Account Head Expense State
  const [selectedExpenseHead, setSelectedExpenseHead] = useState('');
  const [expenseTxns, setExpenseTxns] = useState([]);

  // Fetch initial accounts head list
  useEffect(() => {
    accountingAPI.getAccountHeads()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setHeads(data);
      })
      .catch(err => console.error(err));
  }, []);

  // Fetch report data based on selected active tab and filters
  const loadReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;

      if (activeReport === 'balance_sheet') {
        const res = await api.get('/accounting/account-heads/', { params });
        setBalanceSheetHeads(Array.isArray(res.data) ? res.data : res.data?.results || []);
      }

      else if (activeReport === 'multi_type_filter') {
        const types = Object.entries(selectedHeadTypes)
          .filter(([_, checked]) => checked)
          .map(([type]) => type)
          .join(',');
        const res = await api.get('/accounting/transactions/', {
          params: { ...params, head_types: types, page_size: 1000 }
        });
        setMultiTypeTxns(Array.isArray(res.data) ? res.data : res.data?.results || []);
      }

      else if (activeReport === 'head_wise_by_type') {
        const res = await api.get('/accounting/account-heads/', { params });
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        // Group by account_type
        const grouped = {};
        data.forEach(h => {
          if (!grouped[h.account_type]) grouped[h.account_type] = [];
          grouped[h.account_type].push(h);
        });
        setHeadsByType(grouped);
      }

      else if (activeReport === 'single_head_summary') {
        if (selectedHead) {
          const res = await api.get('/accounting/transactions/', {
            params: { ...params, account_head: selectedHead, page_size: 1000 }
          });
          const txns = Array.isArray(res.data) ? res.data : res.data?.results || [];
          setSingleHeadTxns(txns);

          // Calculate summary
          let deb = 0, cred = 0;
          txns.forEach(t => {
            if (t.transaction_type === 'DEBIT') deb += Number(t.amount);
            else cred += Number(t.amount);
          });
          setSingleHeadBalance({ debits: deb, credits: cred, net: cred - deb });
        } else {
          setSingleHeadTxns([]);
        }
      }

      else if (activeReport === 'commodity_asset_summary') {
        const res = await api.get('/accounting/transactions/commodity-summary/', { params });
        setCommoditySummary(res.data);
      }

      else if (activeReport === 'bank_ledger') {
        const res = await api.get('/accounting/transactions/', {
          params: { ...params, is_bank: 'true', page_size: 1000 }
        });
        setBankTxns(Array.isArray(res.data) ? res.data : res.data?.results || []);
      }

      else if (activeReport === 'cash_ledger') {
        const res = await api.get('/accounting/transactions/', {
          params: { ...params, is_cash: 'true', page_size: 1000 }
        });
        setCashTxns(Array.isArray(res.data) ? res.data : res.data?.results || []);
      }

      else if (activeReport === 'member_balance_matrix') {
        const res = await api.get('/accounting/transactions/member-balances/', { params });
        setMemberBalances(Array.isArray(res.data) ? res.data : []);
      }

      else if (activeReport === 'head_expense_report') {
        if (selectedExpenseHead) {
          const res = await api.get('/accounting/transactions/', {
            params: { ...params, account_head: selectedExpenseHead, transaction_type: 'DEBIT', page_size: 1000 }
          });
          setExpenseTxns(Array.isArray(res.data) ? res.data : res.data?.results || []);
        } else {
          setExpenseTxns([]);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [activeReport, selectedHead, selectedExpenseHead, selectedHeadTypes]);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    loadReport();
  };

  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    // React triggers load on state change when calling API directly
    setTimeout(() => loadReport(), 50);
  };

  // Report navigation tabs (9 submenus)
  const reportTabs = [
    { id: 'balance_sheet', label: t.balanceSheet || 'Balance Sheet', icon: FileSpreadsheet },
    { id: 'multi_type_filter', label: t.multiTypeFilter || 'Multi-Type Filter', icon: CheckSquare },
    { id: 'head_wise_by_type', label: t.headWiseByType || 'Head Wise By Type', icon: BookOpen },
    { id: 'single_head_summary', label: t.singleHeadSummary || 'Single Head Summary', icon: Filter },
    { id: 'commodity_asset_summary', label: t.commodityAssetSummary || 'Commodity & Assets', icon: Coins },
    { id: 'bank_ledger', label: t.bankAccountLedger || 'Bank Account Ledger', icon: DollarSign },
    { id: 'cash_ledger', label: t.cashLedger || 'Cash Ledger', icon: BarChart3 },
    { id: 'member_balance_matrix', label: t.memberBalanceMatrix || 'Member Balance Matrix', icon: Users },
    { id: 'head_expense_report', label: t.headExpense || 'Expense Outflows', icon: ShieldAlert },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>📊 {t.reportsDashboard || 'Reports Dashboard'}</h2>
      </div>

      {/* Date Range Global Filter */}
      <form onSubmit={handleApplyFilter} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px', flexWrap: 'wrap', border: '1px solid #e2e8f0' }}>
        <div style={{ ...styles.formGroup, margin: 0, minWidth: '150px' }}>
          <label style={{ ...styles.formLabel, fontSize: '12px' }}>From Date</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{ ...styles.formInput, padding: '8px 12px' }}
          />
        </div>
        <div style={{ ...styles.formGroup, margin: 0, minWidth: '150px' }}>
          <label style={{ ...styles.formLabel, fontSize: '12px' }}>To Date</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{ ...styles.formInput, padding: '8px 12px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="submit"
            style={{ padding: '8px 16px', border: 'none', background: '#4f46e5', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            style={{ padding: '8px 16px', border: '1px solid #d1d5db', background: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
          >
            Clear
          </button>
        </div>
      </form>

      {/* Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Side Tab Navigation */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {reportTabs.map(tab => {
            const Icon = tab.icon;
            const active = activeReport === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveReport(tab.id);
                  setReportData(null);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                  padding: '10px 12px', borderRadius: '8px', border: 'none',
                  background: active ? '#f0f3ff' : 'transparent',
                  color: active ? '#4f46e5' : '#4b5563',
                  fontWeight: active ? '700' : '500',
                  cursor: 'pointer', fontSize: '13px', textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side Content Panel */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', minHeight: '400px' }}>
          
          {loading ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '60px' }}>Loading report metrics...</p>
          ) : (
            <>
              {/* 1. BALANCE SHEET VIEW */}
              {activeReport === 'balance_sheet' && (
                <div>
                  <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                    Balance Sheet (Account Head Wise)
                  </h3>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Head Name</th>
                        <th style={styles.th}>Type</th>
                        <th style={styles.th}>Category</th>
                        <th style={styles.th}>Total Debits (₹)</th>
                        <th style={styles.th}>Total Credits (₹)</th>
                        <th style={styles.th}>Net Balance (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {balanceSheetHeads.map(h => (
                        <tr key={h.id} style={styles.tr}>
                          <td style={{ ...styles.td, fontWeight: '600' }}>{h.name}</td>
                          <td style={styles.td}>{h.head_type}</td>
                          <td style={styles.td}>{h.account_type}</td>
                          <td style={{ ...styles.td, color: '#dc2626' }}>{Number(h.total_debits).toFixed(2)}</td>
                          <td style={{ ...styles.td, color: '#059669' }}>{Number(h.total_credits).toFixed(2)}</td>
                          <td style={{ ...styles.td, fontWeight: '700' }}>{Number(h.net_balance).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Summary Block */}
                  <div style={{ marginTop: '24px', padding: '20px', background: '#f8fafc', borderRadius: '12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Cumulative Debits</div>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>
                        ₹{balanceSheetHeads.reduce((acc, h) => acc + Number(h.total_debits), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Cumulative Credits</div>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#059669', marginTop: '4px' }}>
                        ₹{balanceSheetHeads.reduce((acc, h) => acc + Number(h.total_credits), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Net Balance Position</div>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#1e3b8b', marginTop: '4px' }}>
                        ₹{balanceSheetHeads.reduce((acc, h) => acc + Number(h.net_balance), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. MULTI-TYPE FILTER */}
              {activeReport === 'multi_type_filter' && (
                <div>
                  <h3 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                    Multi-Type Transaction Filter Report
                  </h3>
                  <div style={{ display: 'flex', gap: '20px', background: '#f1f5f9', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: '#475569' }}>Selected Head Types:</div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                      <input
                        type="checkbox"
                        checked={selectedHeadTypes.General}
                        onChange={(e) => setSelectedHeadTypes({ ...selectedHeadTypes, General: e.target.checked })}
                      />
                      General
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                      <input
                        type="checkbox"
                        checked={selectedHeadTypes.Kodai}
                        onChange={(e) => setSelectedHeadTypes({ ...selectedHeadTypes, Kodai: e.target.checked })}
                      />
                      Kodai
                    </label>
                  </div>

                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Account Head</th>
                        <th style={styles.th}>Type</th>
                        <th style={styles.th}>Amount (₹)</th>
                        <th style={styles.th}>Mode</th>
                        <th style={styles.th}>Donor/Payee</th>
                        <th style={styles.th}>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {multiTypeTxns.map(t => (
                        <tr key={t.id} style={styles.tr}>
                          <td style={styles.td}>{formatDate(t.transaction_date)}</td>
                          <td style={styles.td}>{t.account_head_name}</td>
                          <td style={styles.td}>
                            <span style={{
                              padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                              background: t.transaction_type === 'DEBIT' ? '#fee2e2' : '#d1fae5',
                              color: t.transaction_type === 'DEBIT' ? '#b91c1c' : '#15803d'
                            }}>
                              {t.transaction_type}
                            </span>
                          </td>
                          <td style={{ ...styles.td, fontWeight: '700' }}>{Number(t.amount).toFixed(2)}</td>
                          <td style={styles.td}>{t.payment_mode}</td>
                          <td style={styles.td}>{t.transaction_type === 'DEBIT' ? t.paid_to : t.donor_name}</td>
                          <td style={styles.td}>{t.purpose || t.purpose_description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 3. HEAD WISE BY TYPE */}
              {activeReport === 'head_wise_by_type' && (
                <div>
                  <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                    Account Head Wise by Parent Account Type
                  </h3>
                  {Object.entries(headsByType).map(([category, headsList]) => (
                    <div key={category} style={{ marginBottom: '32px' }}>
                      <h4 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        📁 {category}
                      </h4>
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.th}>Head Name</th>
                            <th style={styles.th}>Type</th>
                            <th style={styles.th}>Total Debits (₹)</th>
                            <th style={styles.th}>Total Credits (₹)</th>
                            <th style={styles.th}>Net Balance (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {headsList.map(h => (
                            <tr key={h.id} style={styles.tr}>
                              <td style={{ ...styles.td, fontWeight: '600' }}>{h.name}</td>
                              <td style={styles.td}>{h.head_type}</td>
                              <td style={{ ...styles.td, color: '#dc2626' }}>{Number(h.total_debits).toFixed(2)}</td>
                              <td style={{ ...styles.td, color: '#059669' }}>{Number(h.total_credits).toFixed(2)}</td>
                              <td style={{ ...styles.td, fontWeight: '700' }}>{Number(h.net_balance).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}

              {/* 4. SINGLE ACCOUNT HEAD SUMMARY */}
              {activeReport === 'single_head_summary' && (
                <div>
                  <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                    Single Account Head Summary Report
                  </h3>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Select Account Head</label>
                    <select
                      value={selectedHead}
                      onChange={(e) => setSelectedHead(e.target.value)}
                      style={{ ...styles.formInput, maxWidth: '400px' }}
                    >
                      <option value="">Choose head...</option>
                      {heads.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedHead && (
                    <div style={{ marginTop: '24px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '10px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Total Debits (Outflows)</div>
                          <div style={{ fontSize: '18px', fontWeight: '700', color: '#ef4444' }}>₹{singleHeadBalance.debits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Total Credits (Inflows)</div>
                          <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>₹{singleHeadBalance.credits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Net Position</div>
                          <div style={{ fontSize: '18px', fontWeight: '700', color: '#4f46e5' }}>₹{singleHeadBalance.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        </div>
                      </div>

                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Type</th>
                            <th style={styles.th}>Amount (₹)</th>
                            <th style={styles.th}>Mode</th>
                            <th style={styles.th}>Donor/Payee</th>
                            <th style={styles.th}>Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {singleHeadTxns.map(t => (
                            <tr key={t.id} style={styles.tr}>
                              <td style={styles.td}>{formatDate(t.transaction_date)}</td>
                              <td style={styles.td}>
                                <span style={{
                                  padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                                  background: t.transaction_type === 'DEBIT' ? '#fee2e2' : '#d1fae5',
                                  color: t.transaction_type === 'DEBIT' ? '#b91c1c' : '#15803d'
                                }}>
                                  {t.transaction_type}
                                </span>
                              </td>
                              <td style={{ ...styles.td, fontWeight: '700' }}>{Number(t.amount).toFixed(2)}</td>
                              <td style={styles.td}>{t.payment_mode}</td>
                              <td style={styles.td}>{t.transaction_type === 'DEBIT' ? t.paid_to : t.donor_name}</td>
                              <td style={styles.td}>{t.purpose || t.purpose_description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 5. COMMODITY & ASSET SUMMARY */}
              {activeReport === 'commodity_asset_summary' && commoditySummary && (
                <div>
                  <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                    Commodity & Asset Inventory Summary
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    
                    {/* Gold Ledger Box */}
                    <div style={{ padding: '20px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px' }}>
                      <h4 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: '800', color: '#b45309' }}>👑 Gold (Inventory Balance)</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                          <span>Total Deposited (Credits):</span>
                          <strong>{Number(commoditySummary.gold?.total_credits).toFixed(2)} grams</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                          <span>Total Handed Over (Debits):</span>
                          <strong>{Number(commoditySummary.gold?.total_debits).toFixed(2)} grams</strong>
                        </div>
                        <hr style={{ border: '0', borderTop: '1px solid #fcd34d', margin: '4px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '800', color: '#92400e' }}>
                          <span>Net In-Vault Weight:</span>
                          <span>{Number(commoditySummary.gold?.net_balance).toFixed(2)} grams</span>
                        </div>
                      </div>
                    </div>

                    {/* Silver Ledger Box */}
                    <div style={{ padding: '20px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '12px' }}>
                      <h4 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: '800', color: '#475569' }}>🥈 Silver (Inventory Balance)</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                          <span>Total Deposited (Credits):</span>
                          <strong>{Number(commoditySummary.silver?.total_credits).toFixed(2)} grams</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                          <span>Total Handed Over (Debits):</span>
                          <strong>{Number(commoditySummary.silver?.total_debits).toFixed(2)} grams</strong>
                        </div>
                        <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', margin: '4px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>
                          <span>Net In-Vault Weight:</span>
                          <span>{Number(commoditySummary.silver?.net_balance).toFixed(2)} grams</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Fiat Assets Box */}
                  <div style={{ marginTop: '24px', padding: '20px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: '800', color: '#065f46' }}>💵 Fiat Cash/Bank Holdings</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#047857' }}>Cumulative Inflow</div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#065f46' }}>₹{Number(commoditySummary.fiat?.total_credits).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#047857' }}>Cumulative Outflow</div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#991b1b' }}>₹{Number(commoditySummary.fiat?.total_debits).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#047857' }}>Current Net Position</div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e3b8b' }}>₹{Number(commoditySummary.fiat?.net_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. BANK ACCOUNT LEDGER */}
              {activeReport === 'bank_ledger' && (
                <div>
                  <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                    Bank Account Ledger Report
                  </h3>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Account Head</th>
                        <th style={styles.th}>Bank Account</th>
                        <th style={styles.th}>Type</th>
                        <th style={styles.th}>Amount (₹)</th>
                        <th style={styles.th}>Donor/Payee</th>
                        <th style={styles.th}>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bankTxns.map(t => (
                        <tr key={t.id} style={styles.tr}>
                          <td style={styles.td}>{formatDate(t.transaction_date)}</td>
                          <td style={styles.td}>{t.account_head_name}</td>
                          <td style={styles.td}>{t.trust_account_name || '—'}</td>
                          <td style={styles.td}>
                            <span style={{
                              padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                              background: t.transaction_type === 'DEBIT' ? '#fee2e2' : '#d1fae5',
                              color: t.transaction_type === 'DEBIT' ? '#b91c1c' : '#15803d'
                            }}>
                              {t.transaction_type}
                            </span>
                          </td>
                          <td style={{ ...styles.td, fontWeight: '700' }}>{Number(t.amount).toFixed(2)}</td>
                          <td style={styles.td}>{t.transaction_type === 'DEBIT' ? t.paid_to : t.donor_name}</td>
                          <td style={styles.td}>{t.purpose || t.purpose_description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 7. CASH LEDGER */}
              {activeReport === 'cash_ledger' && (
                <div>
                  <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                    Cash Ledger Report
                  </h3>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Account Head</th>
                        <th style={styles.th}>Cash Account</th>
                        <th style={styles.th}>Type</th>
                        <th style={styles.th}>Amount (₹)</th>
                        <th style={styles.th}>Donor/Payee</th>
                        <th style={styles.th}>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cashTxns.map(t => (
                        <tr key={t.id} style={styles.tr}>
                          <td style={styles.td}>{formatDate(t.transaction_date)}</td>
                          <td style={styles.td}>{t.account_head_name}</td>
                          <td style={styles.td}>{t.trust_account_name || '—'}</td>
                          <td style={styles.td}>
                            <span style={{
                              padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                              background: t.transaction_type === 'DEBIT' ? '#fee2e2' : '#d1fae5',
                              color: t.transaction_type === 'DEBIT' ? '#b91c1c' : '#15803d'
                            }}>
                              {t.transaction_type}
                            </span>
                          </td>
                          <td style={{ ...styles.td, fontWeight: '700' }}>{Number(t.amount).toFixed(2)}</td>
                          <td style={styles.td}>{t.transaction_type === 'DEBIT' ? t.paid_to : t.donor_name}</td>
                          <td style={styles.td}>{t.purpose || t.purpose_description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 8. MEMBER BALANCE MATRIX */}
              {activeReport === 'member_balance_matrix' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                      Member Balance Matrix (Outstanding Dues)
                    </h3>
                    <input
                      type="text"
                      placeholder="Search member name or contact..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      style={{ ...styles.formInput, maxWidth: '280px', padding: '8px 12px' }}
                    />
                  </div>

                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Member ID</th>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Contact</th>
                        <th style={styles.th}>Total Invoiced (Debits) (₹)</th>
                        <th style={styles.th}>Total Paid (Credits) (₹)</th>
                        <th style={styles.th}>Outstanding Balance (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberBalances
                        .filter(m => 
                          m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                          (m.name_ta && m.name_ta.includes(memberSearch)) ||
                          (m.phone && m.phone.includes(memberSearch))
                        )
                        .map(m => {
                          const val = Number(m.running_balance);
                          const isOwed = val > 0;
                          return (
                            <tr key={m.id} style={styles.tr}>
                              <td style={styles.td}>{m.member_id}</td>
                              <td style={{ ...styles.td, fontWeight: '600' }}>
                                {m.name} {m.name_ta ? `(${m.name_ta})` : ''}
                              </td>
                              <td style={styles.td}>{m.phone}</td>
                              <td style={{ ...styles.td, color: '#dc2626' }}>{Number(m.total_debits).toFixed(2)}</td>
                              <td style={{ ...styles.td, color: '#059669' }}>{Number(m.total_credits).toFixed(2)}</td>
                              <td style={{ ...styles.td, fontWeight: '800', color: isOwed ? '#b91c1c' : '#166534' }}>
                                {isOwed ? `${val.toFixed(2)} (Due)` : `${Math.abs(val).toFixed(2)} (Overpaid)`}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 9. ACCOUNT HEAD EXPENSE REPORT */}
              {activeReport === 'head_expense_report' && (
                <div>
                  <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                    Account Head Expense (Debit Outflows) Report
                  </h3>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Select Account Head</label>
                    <select
                      value={selectedExpenseHead}
                      onChange={(e) => setSelectedExpenseHead(e.target.value)}
                      style={{ ...styles.formInput, maxWidth: '400px' }}
                    >
                      <option value="">Choose expense head...</option>
                      {heads
                        .filter(h => h.account_type === 'Expense')
                        .map(h => (
                          <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                    </select>
                  </div>

                  {selectedExpenseHead && (
                    <div style={{ marginTop: '24px' }}>
                      <div style={{ padding: '16px', background: '#fee2e2', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fca5a5' }}>
                        <div style={{ fontSize: '13px', color: '#7f1d1d', fontWeight: '700' }}>
                          Cumulative Outflow Expenditure: ₹{expenseTxns.reduce((acc, t) => acc + Number(t.amount), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Amount (₹)</th>
                            <th style={styles.th}>Paid To</th>
                            <th style={styles.th}>Bill Reference</th>
                            <th style={styles.th}>Remarks / Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expenseTxns.map(t => (
                            <tr key={t.id} style={styles.tr}>
                              <td style={styles.td}>{formatDate(t.transaction_date)}</td>
                              <td style={{ ...styles.td, fontWeight: '700', color: '#b91c1c' }}>{Number(t.amount).toFixed(2)}</td>
                              <td style={styles.td}>{t.paid_to || '—'}</td>
                              <td style={styles.td}>{t.bill_reference || '—'}</td>
                              <td style={styles.td}>{t.purpose_description || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            </>
          )}

        </div>

      </div>
    </div>
  );
}
