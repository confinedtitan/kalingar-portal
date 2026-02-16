import React, { useState, useCallback } from 'react';
import { styles } from '../utils/styles';
import { useTamilInput } from '../utils/useTamilInput';

export default function MembersPage({ members: rawMembers, t, onViewMember, onExportExcel, onResetPassword }) {
  const members = Array.isArray(rawMembers) ? rawMembers : [];
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedRow, setExpandedRow] = useState(null);

  const setSearchValue = useCallback((v) => setSearchTerm(v), []);
  const searchTamilProps = useTamilInput(searchTerm, setSearchValue);

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm);
    const due = m.amount_due ?? m.amountDue ?? 0;
    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'paid' && due === 0) ||
      (filterStatus === 'pending' && due > 0);
    return matchesSearch && matchesFilter;
  });

  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div style={styles.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ ...styles.pageTitle, marginBottom: 0 }}>{t.members}</h2>
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
              <th style={styles.th}>{t.memberId || 'Member ID'}</th>
              <th style={styles.th}>{t.memberName}</th>
              <th style={styles.th}>{t.phoneNumber}</th>
              <th style={styles.th}>{t.fatherName}</th>
              <th style={styles.th}>{t.annualTax}</th>
              <th style={styles.th}>{t.amountPaid}</th>
              <th style={styles.th}>{t.amountDue}</th>
              <th style={styles.th}>{t.status}</th>
              <th style={styles.th}>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map(member => {
              const annualTax = member.annual_tax ?? member.annualTax ?? 0;
              const amountPaid = member.amount_paid ?? member.amountPaid ?? 0;
              const amountDue = member.amount_due ?? member.amountDue ?? 0;
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
                    <td style={styles.td}>{member.name}</td>
                    <td style={styles.td}>{member.phone}</td>
                    <td style={styles.td}>{fatherName}</td>
                    <td style={styles.td}>₹{Number(annualTax).toLocaleString()}</td>
                    <td style={styles.td}>₹{Number(amountPaid).toLocaleString()}</td>
                    <td style={styles.td}>₹{Number(amountDue).toLocaleString()}</td>
                    <td style={styles.td}>
                      <span style={Number(amountDue) === 0 ? styles.statusPaid : styles.statusPending}>
                        {Number(amountDue) === 0 ? t.paid : t.pending}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button onClick={() => onViewMember(member)} style={styles.actionButton}>
                          {t.view}
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
                      <td colSpan={9} style={{ padding: '0', border: 'none' }}>
                        <div style={{
                          background: '#f8f9fa',
                          padding: '16px 24px',
                          borderBottom: '1px solid #e2e8f0',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                          gap: '12px',
                        }}>
                          {motherName && (
                            <div>
                              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '2px' }}>{t.motherName}</div>
                              <div style={{ fontSize: '14px', color: '#1e293b' }}>{motherName}</div>
                            </div>
                          )}
                          {spouseName && (
                            <div>
                              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '2px' }}>{t.spouseName}</div>
                              <div style={{ fontSize: '14px', color: '#1e293b' }}>{spouseName}</div>
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
                                    <span style={{ fontWeight: '500' }}>{child.name}</span>
                                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>{child.date_of_birth ?? child.dob}</span>
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
    </div>
  );
}
