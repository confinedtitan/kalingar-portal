import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { styles } from '../utils/styles';
import { contentAPI } from '../services/api';

export default function DashboardPage({ isAdmin, members: rawMembers, payments: rawPayments, currentUser, t, exportToExcel }) {
  const members = Array.isArray(rawMembers) ? rawMembers : [];
  const payments = Array.isArray(rawPayments) ? rawPayments : [];
  const totalMembers = members.length;
  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const pendingAmount = members.reduce((sum, m) => sum + Number(m.amount_due ?? m.amountDue ?? 0), 0);

  const memberId = currentUser?.member_id ?? currentUser?.memberId ?? '';

  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    const fetchContent = async () => {
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
    fetchContent();
  }, []);

  const sectionStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
  };

  const sectionTitleStyle = {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const cardStyle = {
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid #f1f5f9',
    marginBottom: '10px',
    backgroundColor: '#fafbfc',
  };

  const cardTitleStyle = {
    fontWeight: '600',
    fontSize: '14px',
    color: '#1e293b',
    marginBottom: '4px',
  };

  const cardMetaStyle = {
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '6px',
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  };

  const cardDescStyle = {
    fontSize: '13px',
    color: '#475569',
    lineHeight: '1.5',
  };

  const memberIdBadgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#eef2ff',
    color: '#4338ca',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    border: '1px solid #c7d2fe',
  };

  const emptyStyle = {
    textAlign: 'center',
    padding: '20px',
    color: '#94a3b8',
    fontSize: '13px',
  };

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <div>
          <h2 style={{ ...styles.pageTitle, marginBottom: '4px' }}>{t.welcome}, {currentUser?.name}!</h2>
          {memberId && (
            <span style={memberIdBadgeStyle}>
              🆔 {t.memberId || 'Member ID'}: {memberId}
            </span>
          )}
        </div>
        {isAdmin && (
          <button onClick={exportToExcel} style={styles.exportButton}>
            <Download size={20} />
            {t.exportExcel}
          </button>
        )}
      </div>

      <div style={styles.statsGrid}>
        {isAdmin && (
          <>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>👥</div>
              <div style={styles.statContent}>
                <div style={styles.statValue}>{totalMembers}</div>
                <div style={styles.statLabel}>{t.totalMembers}</div>
              </div>
            </div>

            <div style={{ ...styles.statCard, ...styles.statCardSuccess }}>
              <div style={styles.statIcon}>💰</div>
              <div style={styles.statContent}>
                <div style={styles.statValue}>₹{totalCollected.toLocaleString()}</div>
                <div style={styles.statLabel}>{t.totalCollected}</div>
              </div>
            </div>
          </>
        )}

        <div style={{ ...styles.statCard, ...styles.statCardWarning }}>
          <div style={styles.statIcon}>⏳</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>₹{pendingAmount.toLocaleString()}</div>
            <div style={styles.statLabel}>{t.pendingPayments}</div>
          </div>
        </div>
      </div>

      {/* Announcements, Events, Meetings — from API */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '8px' }}>

        {/* Trust Announcements */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>📢 {t.announcements || 'Trust Announcements'}</div>
          {announcements.length === 0 && <div style={emptyStyle}>No announcements</div>}
          {announcements.map(a => (
            <div key={a.id} style={cardStyle}>
              <div style={cardTitleStyle}>{a.title}</div>
              <div style={cardMetaStyle}>📅 {a.date}</div>
              <div style={cardDescStyle}>{a.description}</div>
            </div>
          ))}
        </div>

        {/* Upcoming Events */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>🎉 {t.upcomingEvents || 'Upcoming Events'}</div>
          {events.length === 0 && <div style={emptyStyle}>No upcoming events</div>}
          {events.map(e => (
            <div key={e.id} style={cardStyle}>
              <div style={cardTitleStyle}>{e.title}</div>
              <div style={cardMetaStyle}>
                <span>📅 {e.date}</span>
                {e.time && <span>🕐 {e.time}</span>}
                {e.location && <span>📍 {e.location}</span>}
              </div>
              {e.description && <div style={cardDescStyle}>{e.description}</div>}
            </div>
          ))}
        </div>

        {/* Meetings */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>🤝 {t.meetings || 'Meetings'}</div>
          {meetings.length === 0 && <div style={emptyStyle}>No meetings scheduled</div>}
          {meetings.map(m => (
            <div key={m.id} style={cardStyle}>
              <div style={cardTitleStyle}>{m.title}</div>
              <div style={cardMetaStyle}>
                <span>📅 {m.date}</span>
                {m.time && <span>🕐 {m.time}</span>}
              </div>
              {m.agenda && <div style={cardDescStyle}>📋 {m.agenda}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity — admin only */}
      {isAdmin && (
        <div style={{ ...sectionStyle, marginTop: '0' }}>
          <h3 style={sectionTitleStyle}>💳 {t.recentActivity}</h3>
          <div style={styles.activityList}>
            {payments.slice(-5).reverse().map(payment => (
              <div key={payment.id} style={styles.activityItem}>
                <div style={styles.activityIcon}>💳</div>
                <div style={styles.activityContent}>
                  <div style={styles.activityTitle}>{payment.member_name ?? payment.memberName}</div>
                  <div style={styles.activityMeta}>{payment.payment_date ?? payment.date} • {payment.payment_method ?? payment.method}</div>
                </div>
                <div style={styles.activityAmount}>₹{Number(payment.amount || 0).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
