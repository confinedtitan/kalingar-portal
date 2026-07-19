import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { styles } from '../utils/styles';

export default function SettingsPage({ t, onShowNotification }) {
  const [pageSize, setPageSize] = useState(() => {
    return Number(localStorage.getItem('pageSize') || 10);
  });

  const [activeTemplate, setActiveTemplate] = useState('tax_receipt_template.html');
  const [templates, setTemplates] = useState([]);
  const [templateContent, setTemplateContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounting/settings/');
      setActiveTemplate(res.data.active_receipt_template || 'tax_receipt_template.html');
      setTemplates(res.data.templates || []);
      setTemplateContent(res.data.template_content || '');
    } catch (err) {
      console.error(err);
      if (onShowNotification) {
        onShowNotification('Failed to load receipt template settings', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    localStorage.setItem('pageSize', String(newSize));
    if (onShowNotification) {
      onShowNotification(t.settingsSaved || 'Settings saved successfully');
    }
  };

  const handleSaveActiveTemplate = async () => {
    setSavingSettings(true);
    try {
      await api.post('/accounting/settings/', {
        active_receipt_template: activeTemplate
      });
      if (onShowNotification) {
        onShowNotification('Receipt template configuration saved successfully!');
      }
      // Reload template content for the newly active template
      loadSettings();
    } catch (err) {
      console.error(err);
      if (onShowNotification) {
        onShowNotification('Failed to update receipt template configuration', 'error');
      }
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveTemplateContent = async () => {
    setSavingTemplate(true);
    try {
      await api.post('/accounting/settings/', {
        action: 'save_template_content',
        template_name: activeTemplate,
        content: templateContent
      });
      if (onShowNotification) {
        onShowNotification('Template HTML code updated successfully!');
      }
    } catch (err) {
      console.error(err);
      if (onShowNotification) {
        onShowNotification('Failed to save template HTML code', 'error');
      }
    } finally {
      setSavingTemplate(false);
    }
  };

  const cardStyle = {
    background: 'white',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    maxWidth: '800px',
    border: '1px solid #e5e7eb',
    marginTop: '20px'
  };

  const inputStyle = {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: 'white',
    width: '100%',
    maxWidth: '300px',
    fontWeight: '500',
    color: '#1f2937'
  };

  const buttonStyle = {
    backgroundColor: '#4f46e5',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>⚙️ {t.settings || 'Settings'}</h2>
      
      {/* Pagination Settings */}
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
            style={inputStyle}
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

      {/* PDF Receipt Template Settings */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>
          📄 PDF Receipt Template Configuration
        </h3>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
          Configure and customize the active HTML templates used to compile transaction receipt PDFs.
        </p>

        {loading ? (
          <div style={{ color: '#4f46e5', fontWeight: '600', padding: '10px 0' }}>Loading settings...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Active Template Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Select Active HTML Template File
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={activeTemplate}
                  onChange={(e) => setActiveTemplate(e.target.value)}
                  style={inputStyle}
                >
                  {templates.map(tpl => (
                    <option key={tpl} value={tpl}>{tpl}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleSaveActiveTemplate}
                  disabled={savingSettings}
                  style={{ ...buttonStyle, marginTop: 0 }}
                >
                  {savingSettings ? 'Saving...' : 'Activate Template'}
                </button>
              </div>
            </div>

            {/* Template Editor */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Edit Active Template HTML Content
              </label>
              <textarea
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                style={{
                  width: '100%',
                  height: '350px',
                  fontFamily: 'Courier New, Courier, monospace',
                  fontSize: '13px',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  backgroundColor: '#f9fafb',
                  color: '#1f2937',
                  resize: 'vertical',
                  outline: 'none',
                  lineHeight: '1.5'
                }}
                placeholder="HTML Template Code goes here..."
              />
              <div>
                <button
                  type="button"
                  onClick={handleSaveTemplateContent}
                  disabled={savingTemplate}
                  style={buttonStyle}
                >
                  {savingTemplate ? 'Saving...' : '💾 Save Template Code'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
