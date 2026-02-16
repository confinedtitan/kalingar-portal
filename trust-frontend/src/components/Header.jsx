import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { styles } from '../utils/styles';
import { useTamilMode } from './TamilContext';

export default function Header({ showSidebar, setShowSidebar, language, setLanguage, currentUser, onLogout, t }) {
  const { tamilMode, setTamilMode } = useTamilMode();

  const toggleSwitchContainer = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 12px',
    backgroundColor: tamilMode ? '#eef2ff' : '#f9fafb',
    borderRadius: '8px',
    border: tamilMode ? '2px solid #818cf8' : '2px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    userSelect: 'none',
  };

  const toggleTrack = {
    width: '40px',
    height: '22px',
    borderRadius: '11px',
    backgroundColor: tamilMode ? '#6366f1' : '#d1d5db',
    position: 'relative',
    transition: 'background-color 0.3s ease',
    flexShrink: 0,
  };

  const toggleThumb = {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    position: 'absolute',
    top: '2px',
    left: tamilMode ? '20px' : '2px',
    transition: 'left 0.3s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '700',
    color: tamilMode ? '#4338ca' : '#6b7280',
    letterSpacing: '0.5px',
  };

  return (
    <header style={styles.header}>
      <div style={styles.headerLeft}>
        <button onClick={() => setShowSidebar(!showSidebar)} style={styles.menuButton}>
          <Menu size={24} />
        </button>
        <div style={styles.logoSection}>
          <span style={styles.logoIcon}>🕉️</span>
          <h1 style={styles.headerTitle}>{t.appTitle}</h1>
        </div>
      </div>

      <div style={styles.headerRight}>
        {/* Tamil Typing Toggle */}
        <div
          style={toggleSwitchContainer}
          onClick={() => setTamilMode(!tamilMode)}
          title={tamilMode ? 'Tamil typing ON — click to switch to English' : 'English typing — click to switch to Tamil'}
        >
          <span style={labelStyle}>{tamilMode ? 'அ' : 'A'}</span>
          <div style={toggleTrack}>
            <div style={toggleThumb} />
          </div>
          <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
            {tamilMode ? 'தமிழ்' : 'ENG'}
          </span>
        </div>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={styles.headerLanguageSelect}
        >
          <option value="en">English</option>
          <option value="ta">தமிழ்</option>
        </select>
        <div style={styles.userInfo}>
          👤 {currentUser?.name || 'User'}
        </div>
        <button onClick={onLogout} style={styles.logoutButton}>
          <LogOut size={18} />
          {t.logout}
        </button>
      </div>
    </header>
  );
}
