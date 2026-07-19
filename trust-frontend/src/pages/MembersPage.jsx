import React, { useState, useCallback, useRef, useEffect } from 'react';
import { styles } from '../utils/styles';
import { useTamilInput } from '../utils/useTamilInput';
import { memberAPI, accountingAPI } from '../services/api';
import { formatDate } from '../utils/dateFormatter';

export default function MembersPage({ members: rawMembers, t, onViewMember, onEditMember, onAddMemberClick, onExportExcel, onResetPassword, onImportSuccess }) {
  const members = Array.isArray(rawMembers) ? rawMembers : [];
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedRow, setExpandedRow] = useState(null);
  
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const pageSize = Number(localStorage.getItem('pageSize') || 10);

  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  // Staff management state
  const [staffList, setStaffList] = useState([]);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', phone: '', password: '' });

  const fetchStaff = useCallback(async () => {
    try {
      const response = await accountingAPI.getStaff();
      const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
      setStaffList(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const setSearchValue = useCallback((v) => setSearchTerm(v), []);
  const searchTamilProps = useTamilInput(searchTerm, setSearchValue);

  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [columnFilters, setColumnFilters] = useState({
    member_id: '',
    name: '',
    phone: '',
    annual_tax: '',
    amount_paid: '',
    address_city: '',
    tax_count: '',
    old_balance: '',
    reference_id: '',
    due_balance: ''
  });

  useEffect(() => {
    setCurrentPageNum(1);
  }, [searchTerm, filterStatus, columnFilters]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredMembers = members
    .filter(m => {
      if (!m.is_family_head) return false;
      
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = m.name.toLowerCase().includes(searchLower) ||
        (m.name_ta && m.name_ta.includes(searchTerm)) ||
        (m.phone && m.phone.includes(searchTerm));
      if (!matchesSearch) return false;

      const oldBal = Number(m.old_balance ?? m.oldBalance ?? 0.00);
      const annTax = Number(m.annual_tax ?? m.annualTax ?? 0.00);
      const amtPaid = Number(m.amount_paid ?? m.amountPaid ?? 0.00);
      const due = oldBal + annTax - amtPaid;

      const matchesFilter = filterStatus === 'all' ||
        (filterStatus === 'paid' && due === 0) ||
        (filterStatus === 'pending' && due > 0);
      if (!matchesFilter) return false;

      // Column filters
      if (columnFilters.member_id && !(m.member_id || '').toLowerCase().includes(columnFilters.member_id.toLowerCase())) return false;
      
      if (columnFilters.name) {
        const nameVal = `${m.name} ${m.name_ta || ''}`.toLowerCase();
        if (!nameVal.includes(columnFilters.name.toLowerCase())) return false;
      }

      if (columnFilters.reference_id && !(m.reference_id || m.referenceId || '').toLowerCase().includes(columnFilters.reference_id.toLowerCase())) return false;
      
      if (columnFilters.phone && !(m.phone || '').toLowerCase().includes(columnFilters.phone.toLowerCase())) return false;
      
      if (columnFilters.address_city) {
        const cityVal = `${m.address_city ?? m.addressCity ?? ''} ${m.address_city_ta ?? m.addressCityTa ?? ''}`.toLowerCase();
        if (!cityVal.includes(columnFilters.address_city.toLowerCase())) return false;
      }
      
      if (columnFilters.tax_count && !String(m.tax_count ?? m.taxCount ?? 1.0).includes(columnFilters.tax_count)) return false;
      
      if (columnFilters.old_balance && !String(m.old_balance ?? m.oldBalance ?? 0.00).includes(columnFilters.old_balance)) return false;
      
      if (columnFilters.annual_tax && !String(m.annual_tax ?? m.annualTax ?? 0).includes(columnFilters.annual_tax)) return false;
      
      if (columnFilters.amount_paid && !String(m.amount_paid ?? m.amountPaid ?? 0).includes(columnFilters.amount_paid)) return false;
      
      if (columnFilters.due_balance && !String(due).includes(columnFilters.due_balance)) return false;

      return true;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      let valA, valB;
      
      if (sortField === 'member_id') {
        valA = a.member_id || '';
        valB = b.member_id || '';
      } else if (sortField === 'name') {
        valA = a.name || '';
        valB = b.name || '';
      } else if (sortField === 'reference_id') {
        valA = a.reference_id || a.referenceId || '';
        valB = b.reference_id || b.referenceId || '';
      } else if (sortField === 'phone') {
        valA = a.phone || '';
        valB = b.phone || '';
      } else if (sortField === 'address_city') {
        valA = a.address_city ?? a.addressCity ?? '';
        valB = b.address_city ?? b.addressCity ?? '';
      } else if (sortField === 'tax_count') {
        valA = Number(a.tax_count ?? a.taxCount ?? 1.0);
        valB = Number(b.tax_count ?? b.taxCount ?? 1.0);
      } else if (sortField === 'old_balance') {
        valA = Number(a.old_balance ?? a.oldBalance ?? 0.00);
        valB = Number(b.old_balance ?? b.oldBalance ?? 0.00);
      } else if (sortField === 'annual_tax') {
        valA = Number(a.annual_tax ?? a.annualTax ?? 0);
        valB = Number(b.annual_tax ?? b.annualTax ?? 0);
      } else if (sortField === 'amount_paid') {
        valA = Number(a.amount_paid ?? a.amountPaid ?? 0);
        valB = Number(b.amount_paid ?? b.amountPaid ?? 0);
      } else if (sortField === 'due_balance') {
        valA = Number(a.old_balance ?? a.oldBalance ?? 0) + Number(a.annual_tax ?? a.annualTax ?? 0) - Number(a.amount_paid ?? a.amountPaid ?? 0);
        valB = Number(b.old_balance ?? b.oldBalance ?? 0) + Number(b.annual_tax ?? b.annualTax ?? 0) - Number(b.amount_paid ?? b.amountPaid ?? 0);
      }

      if (typeof valA === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        return sortDirection === 'asc'
          ? valA - valB
          : valB - valA;
      }
    });

  const totalPages = Math.ceil(filteredMembers.length / pageSize);
  const displayedMembers = filteredMembers.slice((currentPageNum - 1) * pageSize, currentPageNum * pageSize);

  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleApproveUpdate = async (id) => {
    if (window.confirm('Are you sure you want to approve this profile update request?')) {
      try {
        await memberAPI.approveProfileUpdate(id);
        alert('Profile update approved successfully!');
        if (onImportSuccess) onImportSuccess();
      } catch (error) {
        console.error('Error approving profile update:', error);
        alert('Failed to approve profile update.');
      }
    }
  };

  const handleRejectUpdate = async (id) => {
    if (window.confirm('Are you sure you want to reject this profile update request?')) {
      try {
        await memberAPI.rejectProfileUpdate(id);
        alert('Profile update request rejected.');
        if (onImportSuccess) onImportSuccess();
      } catch (error) {
        console.error('Error rejecting profile update:', error);
        alert('Failed to reject profile update.');
      }
    }
  };

  const handleOpenImport = () => {
    setImportFile(null);
    setImportResult(null);
    setShowImportModal(true);
  };

  const handleCloseImport = () => {
    setShowImportModal(false);
    setImportFile(null);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.xlsx')) {
      setImportFile(file);
      setImportResult(null);
    } else if (file) {
      alert('Please select a .xlsx file');
      e.target.value = '';
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append('excel_file', importFile);
      const response = await memberAPI.importExcel(formData);
      setImportResult(response.data);
      // Refresh members list if any were created
      if (response.data.created > 0 && onImportSuccess) {
        onImportSuccess();
      }
    } catch (error) {
      console.error('Import error:', error);
      const msg = error.response?.data?.error || 'Import failed. Please try again.';
      setImportResult({ created: 0, skipped: 0, errors: [{ row: '-', name: '-', reason: msg }] });
    } finally {
      setImporting(false);
    }
  };

  // ── Import Modal ──
  const importModal = showImportModal && (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: 'white', borderRadius: '16px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        width: '100%', maxWidth: '560px', maxHeight: '80vh',
        overflow: 'auto', padding: '32px', position: 'relative',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1a1a1a' }}>
            📤 Import Members from Excel
          </h3>
          <button onClick={handleCloseImport} style={{
            background: 'none', border: 'none', fontSize: '24px',
            cursor: 'pointer', color: '#6b7280', padding: '4px',
          }}>✕</button>
        </div>

        {/* Instructions */}
        <div style={{
          background: '#f0f9ff', border: '1px solid #bae6fd',
          borderRadius: '10px', padding: '16px', marginBottom: '20px',
          fontSize: '13px', color: '#0369a1', lineHeight: '1.6',
        }}>
          <strong>Format:</strong> Upload the Tamil Excel file (.xlsx) with member data starting at row 7.
          <br />Phone numbers in column J are used as login credentials.
          <br />Members with existing phone numbers will be skipped.
        </div>

        {/* File Input */}
        <div style={{
          border: '2px dashed #d1d5db', borderRadius: '12px',
          padding: '32px', textAlign: 'center', marginBottom: '20px',
          background: importFile ? '#f0fdf4' : '#fafafa',
          transition: 'all 0.2s',
          cursor: 'pointer',
        }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="import-excel-input"
          />
          {importFile ? (
            <div>
              <span style={{ fontSize: '32px' }}>📄</span>
              <p style={{ margin: '8px 0 0', fontWeight: '600', color: '#059669' }}>
                {importFile.name}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>
                {(importFile.size / 1024).toFixed(1)} KB — Click to change
              </p>
            </div>
          ) : (
            <div>
              <span style={{ fontSize: '32px' }}>📁</span>
              <p style={{ margin: '8px 0 0', fontWeight: '500', color: '#374151' }}>
                Click to select an Excel file
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9ca3af' }}>
                Only .xlsx files are supported
              </p>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <button
          onClick={handleImport}
          disabled={!importFile || importing}
          style={{
            width: '100%', padding: '14px',
            background: !importFile || importing
              ? '#d1d5db'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white', border: 'none', borderRadius: '10px',
            fontSize: '15px', fontWeight: '600', cursor: importFile && !importing ? 'pointer' : 'not-allowed',
            marginBottom: '20px', transition: 'all 0.2s',
          }}
        >
          {importing ? '⏳ Importing…' : '🚀 Upload & Import'}
        </button>

        {/* Results */}
        {importResult && (
          <div style={{
            borderRadius: '12px', overflow: 'hidden',
            border: '1px solid #e5e7eb',
          }}>
            {/* Summary bar */}
            <div style={{
              display: 'flex', gap: '0',
              background: '#f9fafb',
              borderBottom: importResult.errors?.length > 0 ? '1px solid #e5e7eb' : 'none',
            }}>
              <div style={{
                flex: 1, padding: '16px', textAlign: 'center',
                borderRight: '1px solid #e5e7eb',
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>
                  {importResult.created}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Created</div>
              </div>
              <div style={{ flex: 1, padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>
                  {importResult.skipped}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Skipped</div>
              </div>
            </div>

            {/* Error details */}
            {importResult.errors && importResult.errors.length > 0 && (
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {importResult.errors.map((err, idx) => (
                  <div key={idx} style={{
                    padding: '10px 16px', fontSize: '13px',
                    borderBottom: idx < importResult.errors.length - 1 ? '1px solid #f3f4f6' : 'none',
                    display: 'flex', gap: '8px', alignItems: 'baseline',
                  }}>
                    <span style={{
                      background: '#fef2f2', color: '#b91c1c',
                      padding: '2px 8px', borderRadius: '4px',
                      fontSize: '11px', fontWeight: '600', flexShrink: 0,
                    }}>Row {err.row}</span>
                    <span style={{ fontWeight: '500', color: '#374151' }}>{err.name}</span>
                    <span style={{ color: '#9ca3af' }}>—</span>
                    <span style={{ color: '#6b7280' }}>{err.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ ...styles.pageTitle, marginBottom: 0 }}>{t.members}</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={onAddMemberClick}
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
            ➕ {t.addMember || 'Add Member'}
          </button>
          <button
            onClick={handleOpenImport}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            id="import-excel-btn"
          >
            📤 Import Excel
          </button>
          <button
            onClick={onExportExcel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#10b981',
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
            📥 {t.exportExcel}
          </button>
        </div>
      </div>

      <div style={styles.tableControls}>
        <input
          type="text"
          placeholder={t.search}
          value={searchTerm}
          {...searchTamilProps}
          style={styles.searchInput}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="all">{t.all}</option>
          <option value="paid">{t.paid}</option>
          <option value="pending">{t.pending}</option>
        </select>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}></th>
              <th style={styles.th}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleSort('member_id')}>
                    {t.memberId || 'Member ID'} {sortField === 'member_id' ? (sortDirection === 'asc' ? '▲' : '▼') : '⇅'}
                  </div>
                  <input
                    type="text"
                    placeholder="Filter"
                    value={columnFilters.member_id}
                    onChange={(e) => setColumnFilters({ ...columnFilters, member_id: e.target.value })}
                    style={{ fontSize: '11px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '100%', boxSizing: 'border-box', fontWeight: 'normal', marginTop: '6px', color: '#334155', backgroundColor: '#ffffff' }}
                  />
                </div>
              </th>
              <th style={styles.th}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleSort('name')}>
                    {t.memberName} {sortField === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : '⇅'}
                  </div>
                  <input
                    type="text"
                    placeholder="Filter"
                    value={columnFilters.name}
                    onChange={(e) => setColumnFilters({ ...columnFilters, name: e.target.value })}
                    style={{ fontSize: '11px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '100%', boxSizing: 'border-box', fontWeight: 'normal', marginTop: '6px', color: '#334155', backgroundColor: '#ffffff' }}
                  />
                </div>
              </th>
              <th style={styles.th}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleSort('reference_id')}>
                    {t.referenceId || 'Reference ID'} {sortField === 'reference_id' ? (sortDirection === 'asc' ? '▲' : '▼') : '⇅'}
                  </div>
                  <input
                    type="text"
                    placeholder="Filter"
                    value={columnFilters.reference_id}
                    onChange={(e) => setColumnFilters({ ...columnFilters, reference_id: e.target.value })}
                    style={{ fontSize: '11px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '100%', boxSizing: 'border-box', fontWeight: 'normal', marginTop: '6px', color: '#334155', backgroundColor: '#ffffff' }}
                  />
                </div>
              </th>
              <th style={styles.th}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleSort('tax_count')}>
                    {t.taxCount || 'Tax Count'} {sortField === 'tax_count' ? (sortDirection === 'asc' ? '▲' : '▼') : '⇅'}
                  </div>
                  <input
                    type="text"
                    placeholder="Filter"
                    value={columnFilters.tax_count}
                    onChange={(e) => setColumnFilters({ ...columnFilters, tax_count: e.target.value })}
                    style={{ fontSize: '11px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '100%', boxSizing: 'border-box', fontWeight: 'normal', marginTop: '6px', color: '#334155', backgroundColor: '#ffffff' }}
                  />
                </div>
              </th>
              <th style={styles.th}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleSort('address_city')}>
                    {t.city || 'City / Town'} {sortField === 'address_city' ? (sortDirection === 'asc' ? '▲' : '▼') : '⇅'}
                  </div>
                  <input
                    type="text"
                    placeholder="Filter"
                    value={columnFilters.address_city}
                    onChange={(e) => setColumnFilters({ ...columnFilters, address_city: e.target.value })}
                    style={{ fontSize: '11px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '100%', boxSizing: 'border-box', fontWeight: 'normal', marginTop: '6px', color: '#334155', backgroundColor: '#ffffff' }}
                  />
                </div>
              </th>
              <th style={styles.th}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleSort('old_balance')}>
                    {t.lastYearBalanceCol || 'Last Year Balance (₹)'} {sortField === 'old_balance' ? (sortDirection === 'asc' ? '▲' : '▼') : '⇅'}
                  </div>
                  <input
                    type="text"
                    placeholder="Filter"
                    value={columnFilters.old_balance}
                    onChange={(e) => setColumnFilters({ ...columnFilters, old_balance: e.target.value })}
                    style={{ fontSize: '11px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '100%', boxSizing: 'border-box', fontWeight: 'normal', marginTop: '6px', color: '#334155', backgroundColor: '#ffffff' }}
                  />
                </div>
              </th>
              <th style={styles.th}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleSort('annual_tax')}>
                    {t.taxCol || 'Tax (₹)'} {sortField === 'annual_tax' ? (sortDirection === 'asc' ? '▲' : '▼') : '⇅'}
                  </div>
                  <input
                    type="text"
                    placeholder="Filter"
                    value={columnFilters.annual_tax}
                    onChange={(e) => setColumnFilters({ ...columnFilters, annual_tax: e.target.value })}
                    style={{ fontSize: '11px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '100%', boxSizing: 'border-box', fontWeight: 'normal', marginTop: '6px', color: '#334155', backgroundColor: '#ffffff' }}
                  />
                </div>
              </th>
              <th style={styles.th}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleSort('amount_paid')}>
                    {t.paidCol || 'Paid (₹)'} {sortField === 'amount_paid' ? (sortDirection === 'asc' ? '▲' : '▼') : '⇅'}
                  </div>
                  <input
                    type="text"
                    placeholder="Filter"
                    value={columnFilters.amount_paid}
                    onChange={(e) => setColumnFilters({ ...columnFilters, amount_paid: e.target.value })}
                    style={{ fontSize: '11px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '100%', boxSizing: 'border-box', fontWeight: 'normal', marginTop: '6px', color: '#334155', backgroundColor: '#ffffff' }}
                  />
                </div>
              </th>
              <th style={styles.th}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleSort('due_balance')}>
                    {t.dueCol || 'Due (₹)'} {sortField === 'due_balance' ? (sortDirection === 'asc' ? '▲' : '▼') : '⇅'}
                  </div>
                  <input
                    type="text"
                    placeholder="Filter"
                    value={columnFilters.due_balance}
                    onChange={(e) => setColumnFilters({ ...columnFilters, due_balance: e.target.value })}
                    style={{ fontSize: '11px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '100%', boxSizing: 'border-box', fontWeight: 'normal', marginTop: '6px', color: '#334155', backgroundColor: '#ffffff' }}
                  />
                </div>
              </th>
              <th style={styles.th}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleSort('phone')}>
                    {t.phoneNumber} {sortField === 'phone' ? (sortDirection === 'asc' ? '▲' : '▼') : '⇅'}
                  </div>
                  <input
                    type="text"
                    placeholder="Filter"
                    value={columnFilters.phone}
                    onChange={(e) => setColumnFilters({ ...columnFilters, phone: e.target.value })}
                    style={{ fontSize: '11px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '100%', boxSizing: 'border-box', fontWeight: 'normal', marginTop: '6px', color: '#334155', backgroundColor: '#ffffff' }}
                  />
                </div>
              </th>
              <th style={styles.th}>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {displayedMembers.map(member => {
              const annualTax = member.annual_tax ?? member.annualTax ?? 0;
              const amountPaid = member.amount_paid ?? member.amountPaid ?? 0;
              const fatherName = member.father_name ?? member.fatherName ?? '';
              const motherName = member.mother_name ?? member.motherName ?? '';
              const spouseName = member.spouse_name ?? member.spouseName ?? '';
              const children = member.children ?? [];
              const isExpanded = expandedRow === member.id;

              return (
                <React.Fragment key={member.id}>
                  <tr style={styles.tr}>
                    <td style={{ ...styles.td, cursor: 'pointer', textAlign: 'center', fontSize: '16px' }} onClick={() => toggleExpand(member.id)}>
                      {isExpanded ? '▼' : '▶'}
                    </td>
                    <td style={{ ...styles.td, fontWeight: '700', color: '#4338ca', fontSize: '12px', letterSpacing: '0.5px' }}>
                      {member.member_id || '-'}
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{member.name}</span>
                        {member.profile_update_status === 'Pending' && (
                          <span style={{
                            padding: '2px 6px',
                            backgroundColor: '#fffbeb',
                            color: '#b45309',
                            border: '1px solid #fef3c7',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '600',
                            letterSpacing: '0.3px',
                          }}>
                            {t.pendingUpdate || 'Pending Update'}
                          </span>
                        )}
                      </div>
                      {member.name_ta && (
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{member.name_ta}</div>
                      )}
                    </td>
                    <td style={styles.td}>{member.reference_id || member.referenceId || '-'}</td>
                    <td style={styles.td}>{Number(member.tax_count ?? member.taxCount ?? 1.0).toFixed(1)}</td>
                    <td style={styles.td}>
                      <div>{member.address_city ?? member.addressCity ?? '-'}</div>
                      {(member.address_city_ta || member.addressCityTa) && (
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{member.address_city_ta || member.addressCityTa}</div>
                      )}
                    </td>
                    <td style={styles.td}>{Number(member.old_balance ?? member.oldBalance ?? 0.00).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td style={styles.td}>{Number(annualTax).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td style={styles.td}>{Number(amountPaid).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td style={styles.td}>
                      {(Number(member.old_balance ?? member.oldBalance ?? 0) + Number(annualTax) - Number(amountPaid)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td style={styles.td}>{member.phone || '-'}</td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button onClick={() => onViewMember(member)} style={styles.actionButton}>
                          {t.view}
                        </button>
                        <button onClick={() => onEditMember(member)} style={{ ...styles.actionButton, backgroundColor: '#4f46e5' }}>
                          {t.edit || 'Edit'}
                        </button>
                        {onResetPassword && (
                          <button
                            onClick={() => onResetPassword(member)}
                            style={{
                              ...styles.actionButton,
                              backgroundColor: '#f97316',
                              fontSize: '12px',
                              padding: '6px 12px',
                            }}
                            title={t.resetPassword}
                          >
                            🔑 {t.resetPassword}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={12} style={{ padding: '0', border: 'none' }}>
                        <div style={{
                          background: '#f8f9fa',
                          padding: '16px 24px',
                          borderBottom: '1px solid #e2e8f0',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                          gap: '12px',
                        }}>
                          {fatherName && (
                            <div>
                              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '2px' }}>{t.fatherName}</div>
                              <div style={{ fontSize: '14px', color: '#1e293b' }}>{fatherName}</div>
                              {(member.father_name_ta || member.fatherNameTa) && (
                                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{member.father_name_ta || member.fatherNameTa}</div>
                              )}
                            </div>
                          )}
                          {motherName && (
                            <div>
                              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '2px' }}>{t.motherName}</div>
                              <div style={{ fontSize: '14px', color: '#1e293b' }}>{motherName}</div>
                              {(member.mother_name_ta || member.motherNameTa) && (
                                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{member.mother_name_ta || member.motherNameTa}</div>
                              )}
                            </div>
                          )}
                          {spouseName && (
                            <div>
                              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '2px' }}>{t.spouseName}</div>
                              <div style={{ fontSize: '14px', color: '#1e293b' }}>{spouseName}</div>
                              {(member.spouse_name_ta || member.spouseNameTa) && (
                                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{member.spouse_name_ta || member.spouseNameTa}</div>
                              )}
                            </div>
                          )}
                          {children.length > 0 && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>{t.children} ({children.length})</div>
                              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {children.map((child, idx) => (
                                  <div key={idx} style={{
                                    background: 'white',
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    border: '1px solid #e2e8f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                  }}>
                                    <span>{child.gender === 'Male' ? '👦' : '👧'}</span>
                                    <span style={{ fontWeight: '500' }}>{child.name}{child.name_ta ? ` / ${child.name_ta}` : ''}</span>
                                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>{formatDate(child.date_of_birth ?? child.dob) || '-'}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {!motherName && !spouseName && children.length === 0 && (
                            <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>
                              No additional family details available.
                            </div>
                          )}
                          {member.profile_update_status === 'Pending' && (
                            <div style={{
                              gridColumn: '1 / -1',
                              marginTop: '12px',
                              padding: '16px',
                              backgroundColor: '#fffbeb',
                              border: '1px solid #fef3c7',
                              borderRadius: '8px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#b45309', fontSize: '14px' }}>
                                  ⚠️ {t.pendingUpdate || 'Pending Profile Update'}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    onClick={() => handleApproveUpdate(member.id)}
                                    style={{
                                      padding: '8px 16px',
                                      backgroundColor: '#10b981',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      fontSize: '13px'
                                    }}
                                  >
                                    ✅ {t.approve || 'Approve'}
                                  </button>
                                  <button
                                    onClick={() => handleRejectUpdate(member.id)}
                                    style={{
                                      padding: '8px 16px',
                                      backgroundColor: '#ef4444',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      fontSize: '13px'
                                    }}
                                  >
                                    ❌ {t.reject || 'Reject'}
                                  </button>
                                </div>
                              </div>
                              <div style={{ fontSize: '13px', color: '#78350f', backgroundColor: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #fef3c7' }}>
                                <div style={{ fontWeight: '600', marginBottom: '8px' }}>Proposed Changes:</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                                  {Object.entries(member.pending_update?.fields || {}).map(([key, val]) => {
                                    if (val === '' || val === null || key === 'password') return null;
                                    const friendlyKey = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                                    let displayVal = String(val);
                                    if (key === 'father' && val) {
                                      const fatherObj = members.find(m => String(m.id) === String(val));
                                      if (fatherObj) displayVal = `${fatherObj.name} (${fatherObj.member_id})`;
                                    } else if (key === 'date_of_birth' || key === 'dob') {
                                      displayVal = formatDate(val) || 'None';
                                    }
                                    return (
                                      <div key={key} style={{ fontSize: '12px' }}>
                                        <span style={{ fontWeight: '600' }}>{friendlyKey}:</span> {displayVal}
                                      </div>
                                    );
                                  })}
                                </div>
                                {member.pending_update?.children && member.pending_update.children.length > 0 && (
                                  <div style={{ marginTop: '12px', borderTop: '1px solid #fef3c7', paddingTop: '8px' }}>
                                    <span style={{ fontWeight: '600', fontSize: '12px' }}>Proposed Children:</span>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                                      {member.pending_update.children.map((child, idx) => (
                                        <div key={idx} style={{ fontSize: '12px', padding: '4px 8px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                          {child.name}{child.name_ta ? ` / ${child.name_ta}` : ''} ({formatDate(child.date_of_birth ?? child.dob) || '-'})
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
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
              backgroundColor: currentPageNum === 1 ? '#e2e8f0' : '#6366f1',
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
            Page {currentPageNum} of {totalPages} ({filteredMembers.length} members)
          </span>
          
          <button
            disabled={currentPageNum === totalPages}
            onClick={() => setCurrentPageNum(prev => Math.min(prev + 1, totalPages))}
            style={{
              padding: '8px 16px',
              backgroundColor: currentPageNum === totalPages ? '#e2e8f0' : '#6366f1',
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

      {/* ── Accountant Staff Management ── */}
      <div style={{ marginTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ ...styles.pageTitle, fontSize: '22px' }}>👤 Accountant Accounts</h3>
          <button
            onClick={() => { setShowStaffForm(true); setStaffForm({ name: '', phone: '', password: '' }); }}
            style={{ ...styles.exportButton, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >➕ Add Accountant</button>
        </div>

        <StaffTable staffList={staffList} onRefresh={fetchStaff} />

        {showStaffForm && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
            <div style={{ background:'white', borderRadius:'16px', padding:'32px', width:'100%', maxWidth:'440px', boxShadow:'0 25px 60px rgba(0,0,0,0.3)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
                <h3 style={{ margin:0, fontSize:'18px', fontWeight:'700' }}>New Accountant</h3>
                <button onClick={()=>setShowStaffForm(false)} style={{ background:'none', border:'none', fontSize:'24px', cursor:'pointer', color:'#6b7280' }}>✕</button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await accountingAPI.createStaff(staffForm);
                  setShowStaffForm(false);
                  fetchStaff();
                } catch (err) {
                  const msg = err.response?.data ? Object.values(err.response.data).flat().join(', ') : 'Failed';
                  alert(msg);
                }
              }} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Name *</label>
                  <input type="text" required value={staffForm.name} onChange={e=>setStaffForm({...staffForm,name:e.target.value})} style={styles.formInput} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Phone (10 digits) *</label>
                  <input type="text" required value={staffForm.phone} onChange={e=>setStaffForm({...staffForm,phone:e.target.value.replace(/\D/g,'').slice(0,10)})} style={styles.formInput} maxLength={10} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Password *</label>
                  <input type="password" required minLength={8} value={staffForm.password} onChange={e=>setStaffForm({...staffForm,password:e.target.value})} style={styles.formInput} />
                </div>
                <button type="submit" style={styles.submitButton}>Create Accountant</button>
              </form>
            </div>
          </div>
        )}
      </div>

      {importModal}
    </div>
  );
}

function StaffTable({ staffList, onRefresh }) {
  const toggleActive = async (staff) => {
    try {
      if (staff.is_active) {
        await accountingAPI.deactivateStaff(staff.id);
      } else {
        await accountingAPI.activateStaff(staff.id);
      }
      onRefresh();
    } catch (err) {
      alert('Failed to update staff status.');
    }
  };

  if (staffList.length === 0) {
    return <div style={{ textAlign:'center', color:'#9ca3af', padding:'24px', background:'white', borderRadius:'12px' }}>No accountant accounts yet.</div>;
  }

  return (
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead><tr>
          <th style={styles.th}>Name</th>
          <th style={styles.th}>Phone</th>
          <th style={styles.th}>Role</th>
          <th style={styles.th}>Status</th>
          <th style={styles.th}>Actions</th>
        </tr></thead>
        <tbody>
          {staffList.map(s => (
            <tr key={s.id} style={styles.tr}>
              <td style={{...styles.td, fontWeight:'600'}}>{s.name}</td>
              <td style={styles.td}>{s.phone}</td>
              <td style={styles.td}>{s.role}</td>
              <td style={styles.td}>
                <span style={s.is_active ? styles.statusPaid : styles.statusPending}>
                  {s.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td style={styles.td}>
                <button onClick={() => toggleActive(s)} style={{
                  ...styles.actionButton,
                  background: s.is_active ? '#ef4444' : '#10b981',
                  fontSize:'12px', padding:'4px 12px',
                }}>
                  {s.is_active ? '🚫 Deactivate' : '✅ Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
