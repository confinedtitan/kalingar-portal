import React, { useState } from 'react';
import { styles } from '../utils/styles';

export default function SettingsPage({ t, onShowNotification }) {
  const [pageSize, setPageSize] = useState(() => {
    return Number(localStorage.getItem('pageSize') || 10);
  });

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    localStorage.setItem('pageSize', String(newSize));
    if (onShowNotification) {
      onShowNotification(t.settingsSaved || 'Settings saved successfully');
    }
  };

  const cardStyle = {
    background: 'white',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    maxWidth: '600px',
    border: '1px solid #e5e7eb',
    marginTop: '16px'
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>⚙️ {t.settings || 'Settings'}</h2>
      
      <div style={cardStyle}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', marginBottom: '16px' }}>
          Pagination Settings
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
            {t.pageSize || 'Page Size'}
          </label>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: '2px solid #e5e7eb',
              fontSize: '14px',
              cursor: 'pointer',
              backgroundColor: 'white',
              outline: 'none',
              maxWidth: '200px',
              fontWeight: '500',
              color: '#1f2937'
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px', lineHeight: '1.5' }}>
            Configure how many members or transactions will be displayed on a single page before pagination triggers. Changes are automatically saved.
          </p>
        </div>
      </div>
    </div>
  );
}
