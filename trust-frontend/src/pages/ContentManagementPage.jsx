import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { contentAPI } from '../services/api';
import { styles } from '../utils/styles';
import { useTamilInput } from '../utils/useTamilInput';

export default function ContentManagementPage({ t }) {
    const [activeTab, setActiveTab] = useState('announcements');
    const [announcements, setAnnouncements] = useState([]);
    const [events, setEvents] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    // Tamil input hooks for content form fields
    const setTitle = useCallback((v) => setFormData(prev => ({ ...prev, title: v })), []);
    const setLocation = useCallback((v) => setFormData(prev => ({ ...prev, location: v })), []);
    const setDescription = useCallback((v) => setFormData(prev => ({ ...prev, description: v })), []);
    const setAgenda = useCallback((v) => setFormData(prev => ({ ...prev, agenda: v })), []);

    const titleProps = useTamilInput(formData.title, setTitle);
    const locationProps = useTamilInput(formData.location, setLocation);
    const descriptionProps = useTamilInput(formData.description, setDescription);
    const agendaProps = useTamilInput(formData.agenda, setAgenda);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [annRes, evtRes, mtgRes] = await Promise.all([
                contentAPI.getAnnouncements(),
                contentAPI.getEvents(),
                contentAPI.getMeetings(),
            ]);
            setAnnouncements(Array.isArray(annRes.data) ? annRes.data : annRes.data?.results || []);
            setEvents(Array.isArray(evtRes.data) ? evtRes.data : evtRes.data?.results || []);
            setMeetings(Array.isArray(mtgRes.data) ? mtgRes.data : mtgRes.data?.results || []);
        } catch (err) {
            console.error('Error fetching content:', err);
        }
    };

    const tabs = [
        { key: 'announcements', label: `📢 ${t.announcements}`, data: announcements },
        { key: 'events', label: `🎉 ${t.upcomingEvents}`, data: events },
        { key: 'meetings', label: `🤝 ${t.meetings}`, data: meetings },
    ];

    const getEmptyForm = () => {
        if (activeTab === 'announcements') return { title: '', description: '', date: '', is_active: true };
        if (activeTab === 'events') return { title: '', date: '', time: '', location: '', description: '', is_active: true };
        return { title: '', date: '', time: '', agenda: '', is_active: true };
    };

    const handleAdd = () => {
        setFormData(getEmptyForm());
        setEditingItem(null);
        setShowForm(true);
    };

    const handleEdit = (item) => {
        setFormData({ ...item });
        setEditingItem(item);
        setShowForm(true);
    };

    const handleDelete = async (item) => {
        if (!window.confirm('Are you sure you want to delete this?')) return;
        try {
            if (activeTab === 'announcements') await contentAPI.deleteAnnouncement(item.id);
            else if (activeTab === 'events') await contentAPI.deleteEvent(item.id);
            else await contentAPI.deleteMeeting(item.id);
            fetchAll();
        } catch (err) {
            alert('Error deleting: ' + err.message);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (editingItem) {
                if (activeTab === 'announcements') await contentAPI.updateAnnouncement(editingItem.id, formData);
                else if (activeTab === 'events') await contentAPI.updateEvent(editingItem.id, formData);
                else await contentAPI.updateMeeting(editingItem.id, formData);
            } else {
                if (activeTab === 'announcements') await contentAPI.createAnnouncement(formData);
                else if (activeTab === 'events') await contentAPI.createEvent(formData);
                else await contentAPI.createMeeting(formData);
            }
            setShowForm(false);
            setEditingItem(null);
            fetchAll();
        } catch (err) {
            console.error('Error saving:', err);
            if (err.response?.data) {
                const errors = Object.entries(err.response.data)
                    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                    .join('\n');
                alert('Validation error:\n' + errors);
            } else {
                alert('Error saving: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const currentData = tabs.find(t => t.key === activeTab)?.data || [];

    const pageStyle = { ...styles.page, maxWidth: '900px' };

    const tabBarStyle = {
        display: 'flex',
        gap: '4px',
        marginBottom: '20px',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '0',
    };

    const tabStyle = (active) => ({
        padding: '10px 18px',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: active ? '700' : '500',
        color: active ? '#4338ca' : '#64748b',
        borderBottom: active ? '3px solid #4338ca' : '3px solid transparent',
        marginBottom: '-2px',
        transition: 'all 0.2s',
    });

    const cardStyle = {
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12px',
    };

    const formContainerStyle = {
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        marginBottom: '12px',
        boxSizing: 'border-box',
    };

    const labelStyle = {
        fontSize: '13px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '4px',
        display: 'block',
    };

    const btnStyle = (bg) => ({
        padding: '8px 16px',
        backgroundColor: bg,
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
    });

    const iconBtnStyle = (color) => ({
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: color,
        padding: '6px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
    });

    const renderForm = () => (
        <div style={formContainerStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1e293b' }}>
                {editingItem ? '✏️ Edit' : '➕ Add New'} {activeTab === 'announcements' ? 'Announcement' : activeTab === 'events' ? 'Event' : 'Meeting'}
            </h3>

            <label style={labelStyle}>Title *</label>
            <input
                style={inputStyle}
                value={formData.title || ''}
                {...titleProps}
                placeholder="Title"
            />

            <label style={labelStyle}>Date *</label>
            <input
                type="date"
                style={inputStyle}
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />

            {(activeTab === 'events' || activeTab === 'meetings') && (
                <>
                    <label style={labelStyle}>Time</label>
                    <input
                        style={inputStyle}
                        value={formData.time || ''}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        placeholder="e.g. 10:00 AM"
                    />
                </>
            )}

            {activeTab === 'events' && (
                <>
                    <label style={labelStyle}>Location</label>
                    <input
                        style={inputStyle}
                        value={formData.location || ''}
                        {...locationProps}
                        placeholder="Location"
                    />
                </>
            )}

            {(activeTab === 'announcements' || activeTab === 'events') && (
                <>
                    <label style={labelStyle}>Description{activeTab === 'announcements' ? ' *' : ''}</label>
                    <textarea
                        style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                        value={formData.description || ''}
                        {...descriptionProps}
                        placeholder="Description"
                    />
                </>
            )}

            {activeTab === 'meetings' && (
                <>
                    <label style={labelStyle}>Agenda</label>
                    <textarea
                        style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                        value={formData.agenda || ''}
                        {...agendaProps}
                        placeholder="Meeting agenda"
                    />
                </>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <input
                    type="checkbox"
                    checked={formData.is_active !== false}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    id="is_active"
                />
                <label htmlFor="is_active" style={{ fontSize: '13px', color: '#374151' }}>Active (visible to members)</label>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleSave} disabled={loading} style={btnStyle('#4338ca')}>
                    <Save size={14} /> {loading ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => { setShowForm(false); setEditingItem(null); }} style={btnStyle('#64748b')}>
                    <X size={14} /> Cancel
                </button>
            </div>
        </div>
    );

    return (
        <div style={pageStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={styles.pageTitle}>{t.contentManagement || 'Content Management'}</h2>
                <button onClick={handleAdd} style={btnStyle('#4338ca')}>
                    <Plus size={16} /> Add New
                </button>
            </div>

            <div style={tabBarStyle}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key); setShowForm(false); }}
                        style={tabStyle(activeTab === tab.key)}
                    >
                        {tab.label} ({tab.data.length})
                    </button>
                ))}
            </div>

            {showForm && renderForm()}

            {currentData.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No {activeTab} yet. Click "Add New" to create one.
                </div>
            )}

            {currentData.map(item => (
                <div key={item.id} style={cardStyle}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '14px', color: '#1e293b' }}>{item.title}</strong>
                            {!item.is_active && (
                                <span style={{
                                    fontSize: '11px',
                                    backgroundColor: '#fef3c7',
                                    color: '#92400e',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    fontWeight: '600',
                                }}>Hidden</span>
                            )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                            📅 {item.date}
                            {item.time && <span> • 🕐 {item.time}</span>}
                            {item.location && <span> • 📍 {item.location}</span>}
                        </div>
                        {(item.description || item.agenda) && (
                            <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>
                                {item.description || item.agenda}
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        <button onClick={() => handleEdit(item)} style={iconBtnStyle('#3b82f6')} title="Edit">
                            <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item)} style={iconBtnStyle('#ef4444')} title="Delete">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
