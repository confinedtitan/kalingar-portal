export const styles = {
  // Login Styles
  loginContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  loginBox: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    padding: '48px',
    width: '100%',
    maxWidth: '440px'
  },
  loginHeader: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  templeIcon: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  loginTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 8px 0'
  },
  languageSelector: {
    marginTop: '16px'
  },
  languageSelect: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    fontSize: '14px',
    cursor: 'pointer',
    backgroundColor: 'white'
  },
  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  inputWithIcon: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    color: '#9ca3af',
    pointerEvents: 'none'
  },
  input: {
    width: '100%',
    padding: '12px 16px 12px 48px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    fontSize: '16px',
    transition: 'border-color 0.3s',
    outline: 'none'
  },
  eyeButton: {
    position: 'absolute',
    right: '16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9ca3af',
    padding: '4px'
  },
  loginButton: {
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    marginTop: '8px'
  },
  loginHint: {
    fontSize: '12px',
    color: '#6b7280',
    textAlign: 'center',
    padding: '12px',
    background: '#f9fafb',
    borderRadius: '8px'
  },

  // Main App Styles
  container: {
    minHeight: '100vh',
    background: '#f3f4f6',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  notification: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: '#10b981',
    color: 'white',
    padding: '16px 24px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1000,
    animation: 'slideIn 0.3s ease'
  },
  header: {
    background: 'white',
    borderBottom: '1px solid #e5e7eb',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  menuButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    color: '#374151',
    display: 'flex',
    alignItems: 'center'
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoIcon: {
    fontSize: '32px'
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: 0
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  headerLanguageSelect: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '2px solid #e5e7eb',
    fontSize: '14px',
    cursor: 'pointer',
    backgroundColor: 'white'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '#f9fafb',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500'
  },
  logoutButton: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500'
  },
  mainContent: {
    display: 'flex',
    minHeight: 'calc(100vh - 73px)'
  },
  sidebar: {
    width: '260px',
    background: 'white',
    borderRight: '1px solid #e5e7eb',
    padding: '24px 0'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '0 16px'
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'none',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    transition: 'all 0.2s',
    textAlign: 'left'
  },
  navButtonActive: {
    background: '#667eea',
    color: 'white'
  },
  content: {
    flex: 1,
    padding: '32px',
    overflowY: 'auto'
  },

  // Page Styles
  page: {
    maxWidth: '1400px',
    margin: '0 auto'
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px'
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: 0
  },
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },

  // Stats Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  },
  statCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  statCardSuccess: {
    borderLeft: '4px solid #10b981'
  },
  statCardWarning: {
    borderLeft: '4px solid #f59e0b'
  },
  statIcon: {
    fontSize: '48px'
  },
  statContent: {
    flex: 1
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500'
  },

  // Recent Activity
  recentSection: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '20px'
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '8px'
  },
  activityIcon: {
    fontSize: '32px'
  },
  activityContent: {
    flex: 1
  },
  activityTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '4px'
  },
  activityMeta: {
    fontSize: '12px',
    color: '#6b7280'
  },
  activityAmount: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#10b981'
  },

  // Table Styles
  tableControls: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px'
  },
  searchInput: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    fontSize: '14px',
    outline: 'none'
  },
  filterSelect: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    fontSize: '14px',
    cursor: 'pointer',
    backgroundColor: 'white',
    minWidth: '150px'
  },
  tableContainer: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    background: '#f9fafb',
    borderBottom: '2px solid #e5e7eb'
  },
  tr: {
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#374151'
  },
  statusPaid: {
    display: 'inline-block',
    padding: '4px 12px',
    background: '#d1fae5',
    color: '#065f46',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  statusPending: {
    display: 'inline-block',
    padding: '4px 12px',
    background: '#fef3c7',
    color: '#92400e',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  actionButton: {
    padding: '6px 16px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },

  // Form Styles
  form: {
    background: 'white',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '24px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  formLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  formInput: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  formTextarea: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  childrenSection: {
    marginTop: '32px',
    padding: '24px',
    background: '#f9fafb',
    borderRadius: '8px'
  },
  subsectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '16px'
  },
  childFormGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr auto',
    gap: '12px',
    marginBottom: '16px'
  },
  addChildButton: {
    padding: '12px 24px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  childrenList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  childItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'white',
    borderRadius: '6px',
    fontSize: '14px'
  },
  removeButton: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitButton: {
    padding: '14px 32px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '24px'
  },

  // Family Tree Styles
  familyTreeContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '24px'
  },
  familyCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  familyCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e5e7eb'
  },
  familyCardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: 0
  },
  familyCardBadge: {
    padding: '4px 12px',
    background: '#ddd6fe',
    color: '#5b21b6',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  familyDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px'
  },
  familyRow: {
    fontSize: '14px',
    color: '#374151'
  },
  childrenContainer: {
    marginTop: '16px',
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '8px'
  },
  childrenTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '12px'
  },
  childCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: 'white',
    borderRadius: '6px',
    marginBottom: '8px'
  },
  childIcon: {
    fontSize: '24px'
  },
  childName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  childMeta: {
    fontSize: '12px',
    color: '#6b7280'
  },

  // Profile Styles
  profileCard: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '32px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },
  profileAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'white',
    color: '#667eea',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: '700'
  },
  profileName: {
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 4px 0'
  },
  profileEmail: {
    fontSize: '14px',
    opacity: 0.9,
    margin: 0
  },
  profileSection: {
    padding: '24px 32px',
    borderBottom: '1px solid #e5e7eb'
  },
  profileSectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '16px'
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px'
  },
  profileField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  profileChildItem: {
    padding: '8px 12px',
    background: '#f9fafb',
    borderRadius: '6px',
    fontSize: '14px',
    marginTop: '8px'
  },
  paymentSummary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginTop: '16px'
  },
  paymentSummaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '8px',
    textAlign: 'center'
  },

  // Payment Page Styles
  paymentCard: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    margin: '0 auto'
  },
  paymentHeader: {
    padding: '24px',
    borderBottom: '2px solid #e5e7eb'
  },
  paymentInfo: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  paymentInfoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '8px'
  },
  paymentInfoHighlight: {
    background: '#fef3c7',
    border: '2px solid #fbbf24'
  },
  paymentForm: {
    padding: '24px'
  },
  paymentInput: {
    width: '100%',
    padding: '16px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    outline: 'none'
  },
  payButton: {
    width: '100%',
    padding: '16px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  confirmSection: {
    padding: '16px',
    background: '#fef3c7',
    borderRadius: '8px'
  },
  confirmText: {
    fontSize: '16px',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: '16px'
  },
  confirmButtons: {
    display: 'flex',
    gap: '12px'
  },
  confirmButton: {
    flex: 1,
    padding: '12px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    background: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  paymentComplete: {
    padding: '48px',
    textAlign: 'center'
  },
  checkIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#d1fae5',
    color: '#10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    fontWeight: '700',
    margin: '0 auto 16px'
  },

  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modalContent: {
    background: 'white',
    borderRadius: '12px',
    maxWidth: '700px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  modalInner: {
    padding: '0'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '2px solid #e5e7eb'
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: '32px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalBody: {
    padding: '24px'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '16px'
  },
  detailItem: {
    marginBottom: '16px'
  },
  childrenModalList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px'
  },
  childModalItem: {
    padding: '8px 12px',
    background: '#f9fafb',
    borderRadius: '6px',
    fontSize: '14px'
  },
  paymentModalSummary: {
    marginTop: '24px',
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  paymentModalItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
};
