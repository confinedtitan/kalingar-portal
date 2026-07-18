import React, { useState, useEffect, useCallback } from 'react';
import { TamilProvider } from './components/TamilContext';
import Login from './components/Login';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Notification from './components/Notification';
import Modal from './components/Modal';
import ChangePassword from './components/ChangePassword';
import ResetPasswordModal from './components/ResetPasswordModal';
import DashboardPage from './pages/DashboardPage';
import MembersPage from './pages/MembersPage';
import AddMemberPage from './pages/AddMemberPage';
import AllPaymentsPage from './pages/AllPaymentsPage';
import FamilyTreePage from './pages/FamilyTreePage';
import ContentManagementPage from './pages/ContentManagementPage';
import TaxManagementPage from './pages/TaxManagementPage';
import MyProfilePage from './pages/MyProfilePage';
import PaymentPage from './pages/PaymentPage';
import AccountantDashboardPage from './pages/AccountantDashboardPage';
import AccountHeadsPage from './pages/AccountHeadsPage';
import TransactionFormPage from './pages/TransactionFormPage';
import TransactionListPage from './pages/TransactionListPage';
import AccountHeadStatementPage from './pages/AccountHeadStatementPage';
import MyDonationsPage from './pages/MyDonationsPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import TrustAccountsPage from './pages/TrustAccountsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import MemberDetailsModal from './components/MemberDetailsModal';
import { translations } from './data/translations';
import { styles } from './utils/styles';
import api, { authAPI, memberAPI, paymentAPI } from './services/api';

export default function App() {
  const [language, setLanguage] = useState('en');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAccountant, setIsAccountant] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedHeadForStatement, setSelectedHeadForStatement] = useState(null);
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [notification, setNotification] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordResetRequired, setPasswordResetRequired] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [memberToReset, setMemberToReset] = useState(null);

  const t = translations[language];

  // Update browser tab title dynamically when language changes
  useEffect(() => {
    document.title = t.appTitle || 'Temple Portal';
  }, [t.appTitle]);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  // Fetch members from API
  const fetchMembers = useCallback(async () => {
    try {
      const response = await memberAPI.getAll();
      const data = response.data;
      setMembers(Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  }, []);

  // Fetch payments from API
  const fetchPayments = useCallback(async () => {
    try {
      const response = await paymentAPI.getAll();
      const data = response.data;
      setPayments(Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  }, []);

  // Load data when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchMembers();
      fetchPayments();
    }
  }, [isLoggedIn, fetchMembers, fetchPayments]);

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('current_user');
    const savedIsAdmin = localStorage.getItem('is_admin');

    if (token && savedUser) {
      // Validate the token by making an API call
      const validateToken = async () => {
        try {
          // Try fetching members list — if token is valid this succeeds
          await memberAPI.getAll();
          
          const savedIsAccountant = localStorage.getItem('is_accountant');
          if (savedIsAdmin !== 'true' && savedIsAccountant !== 'true') {
            try {
              const memberResponse = await memberAPI.getMe();
              setCurrentUser(memberResponse.data);
              localStorage.setItem('current_user', JSON.stringify(memberResponse.data));
            } catch {
              setCurrentUser(JSON.parse(savedUser));
            }
          } else {
             setCurrentUser(JSON.parse(savedUser));
          }
          
          setIsAdmin(savedIsAdmin === 'true');
          setIsAccountant(localStorage.getItem('is_accountant') === 'true');
          setIsLoggedIn(true);
        } catch (error) {
          // Token is invalid — clear everything
          console.log('Stored token is invalid, clearing session');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('current_user');
          localStorage.removeItem('is_accountant');
          localStorage.removeItem('is_admin');
        }
      };
      validateToken();
    }
  }, []);

  const handleLogin = async (phone, password) => {
    setLoading(true);
    try {
      const response = await authAPI.login(phone, password);
      const data = response.data;

      // Store token
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('is_admin', data.is_admin);
      localStorage.setItem('is_accountant', data.role === 'ACCOUNTANT');

      // Notify user to change their password (but don't force/block them)
      if (data.password_reset_required && !data.is_admin) {
        setPasswordResetRequired(true);
        // Redirect to change password page instead of forcing a modal
        // They can dismiss and change later via the sidebar
      }

      if (data.role === 'ACCOUNTANT') {
        setIsAccountant(true);
        setIsAdmin(false);
        const user = { name: data.name, role: 'ACCOUNTANT', staff_id: data.staff_id };
        setCurrentUser(user);
        localStorage.setItem('current_user', JSON.stringify(user));
        setCurrentPage('accountantDashboard');
      } else if (data.is_admin) {
        setIsAdmin(true);
        setIsAccountant(false);
        const user = { name: data.name || 'Admin', role: 'Administrator' };
        setCurrentUser(user);
        localStorage.setItem('current_user', JSON.stringify(user));
      } else {
        setIsAdmin(false);
        // Fetch full member profile
        try {
          const memberResponse = await memberAPI.getMe();
          setCurrentUser(memberResponse.data);
          localStorage.setItem('current_user', JSON.stringify(memberResponse.data));
        } catch {
          // Fallback — use login response data
          const user = {
            id: data.member_id,
            name: data.name,
            phone: data.phone,
          };
          setCurrentUser(user);
          localStorage.setItem('current_user', JSON.stringify(user));
        }
      }

      setIsLoggedIn(true);

      // Show appropriate notification
      if (!data.password_reset_required || data.is_admin) {
        showNotification(t.emailConfirmation || 'Login successful');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.status === 401) {
        alert('Invalid credentials');
      } else {
        alert('Login failed. Make sure the server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
      localStorage.removeItem('is_admin');
      localStorage.removeItem('is_accountant');
      setIsLoggedIn(false);
      setCurrentUser(null);
      setIsAdmin(false);
      setIsAccountant(false);
      setCurrentPage('dashboard');
      setMembers([]);
      setPayments([]);
    }
  };

  const exportToExcel = async () => {
    try {
      const response = await memberAPI.exportExcel();

      // Create download link from blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'trust_members_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showNotification('Excel report downloaded');
    } catch (error) {
      console.error('Error exporting:', error);
      showNotification('Failed to download report');
    }
  };

  const addMemberHandler = async (memberData) => {
    try {
      const apiData = {
        name: memberData.name,
        name_ta: memberData.nameTa || '',
        phone: memberData.phone || null,
        reference_id: memberData.referenceId || '',
        date_of_birth: memberData.dob,
        address: memberData.address,
        address_ta: memberData.addressTa || '',
        father: memberData.father || null,
        fallback_father_name_en: memberData.fallbackFatherNameEn || '',
        fallback_father_name_ta: memberData.fallbackFatherNameTa || '',
        father_name: memberData.fatherName,
        father_name_ta: memberData.fatherNameTa || '',
        mother_name: memberData.motherName || '',
        mother_name_ta: memberData.motherNameTa || '',
        spouse_name: memberData.spouseName || '',
        spouse_name_ta: memberData.spouseNameTa || '',
        annual_tax: memberData.annualTax,
        password: memberData.password || memberData.phone,
        children: (memberData.children || []).map(child => ({
          name: child.name,
          name_ta: child.nameTa || '',
          date_of_birth: child.dob,
          gender: child.gender || 'Male',
          marital_status: child.marital_status || 'Unmarried'
        })),
      };
      await memberAPI.create(apiData);
      showNotification(t.memberAdded);
      fetchMembers();
      setCurrentPage('members');
    } catch (error) {
      console.error('Error creating member:', error);
      if (error.response && error.response.data) {
        const errors = Object.values(error.response.data).flat().join(', ');
        alert('Error creating member: ' + errors);
      } else {
        alert('Error creating member');
      }
    }
  };

  const updateMemberHandler = async (memberId, memberData) => {
    try {
      const apiData = {
        name: memberData.name,
        name_ta: memberData.nameTa || '',
        phone: memberData.phone || null,
        reference_id: memberData.referenceId || '',
        date_of_birth: memberData.dob,
        address: memberData.address,
        address_ta: memberData.addressTa || '',
        father: memberData.father || null,
        fallback_father_name_en: memberData.fallbackFatherNameEn || '',
        fallback_father_name_ta: memberData.fallbackFatherNameTa || '',
        father_name: memberData.fatherName,
        father_name_ta: memberData.fatherNameTa || '',
        mother_name: memberData.motherName || '',
        mother_name_ta: memberData.motherNameTa || '',
        spouse_name: memberData.spouseName || '',
        spouse_name_ta: memberData.spouseNameTa || '',
        annual_tax: memberData.annualTax,
        is_active: memberData.isActive ?? true,
        is_expired: memberData.isExpired ?? false,
        is_family_head: memberData.isFamilyHead ?? false,
        children: (memberData.children || []).map(child => ({
          id: child.id || null,
          name: child.name,
          name_ta: child.nameTa || '',
          date_of_birth: child.dob,
          gender: child.gender || 'Male',
          marital_status: child.marital_status || 'Unmarried'
        })),
      };
      await memberAPI.update(memberId, apiData);
      showNotification('Member updated successfully!');
      fetchMembers();
      setSelectedMember(null);
      setCurrentPage('members');
    } catch (error) {
      console.error('Error updating member:', error);
      if (error.response && error.response.data) {
        const errors = Object.values(error.response.data).flat().join(', ');
        alert('Error updating member: ' + errors);
      } else {
        alert('Error updating member');
      }
    }
  };

  const makePaymentHandler = async (memberId, amount, taxId = null) => {
    try {
      if (taxId) {
        await api.post('/members/transactions/', {
          member: memberId,
          member_tax: taxId,
          amount: amount,
          transaction_type: 'Payment',
        });
      } else {
        await paymentAPI.create({
          member: memberId,
          amount: amount,
          payment_method: 'UPI',
        });
      }
      showNotification(t.paymentSuccess);

      // Refresh data
      fetchMembers();
      fetchPayments();

      // Refresh current user if they made the payment
      if (currentUser && currentUser.id === memberId) {
        try {
          const memberResponse = await memberAPI.getMe();
          setCurrentUser(memberResponse.data);
          localStorage.setItem('current_user', JSON.stringify(memberResponse.data));
        } catch (error) {
          console.error('Error refreshing user:', error);
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed');
    }
  };

  const handleViewMember = (member) => {
    setSelectedMember(member);
    setShowModal(true);
  };

  const handleResetPassword = (member) => {
    setMemberToReset(member);
    setShowResetPasswordModal(true);
  };

  if (!isLoggedIn) {
    return (
      <TamilProvider>
        <Login
          onLogin={handleLogin}
          language={language}
          setLanguage={setLanguage}
          t={t}
          loading={loading}
        />
      </TamilProvider>
    );
  }

  return (
    <TamilProvider>
      <div style={styles.container}>
        <Notification message={notification} />

        <Header
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          language={language}
          setLanguage={setLanguage}
          currentUser={currentUser}
          onLogout={handleLogout}
          t={t}
        />

        <div style={styles.mainContent}>
          {showSidebar && (
            <Sidebar
              isAdmin={isAdmin}
              isAccountant={isAccountant}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              t={t}
            />
          )}

          <main style={styles.content}>
            {currentPage === 'dashboard' && (
              <DashboardPage
                isAdmin={isAdmin}
                members={members}
                payments={payments}
                currentUser={currentUser}
                t={t}
                exportToExcel={exportToExcel}
              />
            )}

            {currentPage === 'members' && isAdmin && (
              <MembersPage
                members={members}
                t={t}
                onViewMember={handleViewMember}
                onEditMember={(member) => {
                  setSelectedMember(member);
                  setCurrentPage('editMember');
                }}
                onAddMemberClick={() => {
                  setCurrentPage('addMember');
                }}
                onExportExcel={exportToExcel}
                onResetPassword={handleResetPassword}
                onImportSuccess={fetchMembers}
              />
            )}

            {currentPage === 'addMember' && isAdmin && (
              <AddMemberPage
                t={t}
                members={members}
                onAddMember={addMemberHandler}
                onCancel={() => setCurrentPage('members')}
              />
            )}

            {currentPage === 'editMember' && isAdmin && selectedMember && (
              <AddMemberPage
                t={t}
                members={members}
                member={selectedMember}
                onUpdateMember={updateMemberHandler}
                onCancel={() => {
                  setSelectedMember(null);
                  setCurrentPage('members');
                }}
              />
            )}

            {currentPage === 'allPayments' && isAdmin && (
              <AllPaymentsPage
                payments={payments}
                t={t}
              />
            )}

            {currentPage === 'familyTree' && isAdmin && (
              <FamilyTreePage
                members={members}
                t={t}
              />
            )}

            {currentPage === 'contentManagement' && isAdmin && (
              <ContentManagementPage
                t={t}
              />
            )}

            {currentPage === 'taxManagement' && isAdmin && (
              <TaxManagementPage
                t={t}
              />
            )}

            {/* ── Accountant Pages (also accessible by Admin) ── */}
            {currentPage === 'accountantDashboard' && isAccountant && (
              <AccountantDashboardPage t={t} />
            )}

            {currentPage === 'accountHeads' && (isAdmin || isAccountant) && (
              <AccountHeadsPage
                isAdmin={isAdmin}
                t={t}
                onSelectHead={(head) => {
                  setSelectedHeadForStatement(head);
                  setCurrentPage('accountHeadStatement');
                }}
              />
            )}

            {currentPage === 'accountHeadStatement' && (isAdmin || isAccountant) && selectedHeadForStatement && (
              <AccountHeadStatementPage
                head={selectedHeadForStatement}
                t={t}
                onBack={() => {
                  setSelectedHeadForStatement(null);
                  setCurrentPage('accountHeads');
                }}
              />
            )}

            {currentPage === 'addTransaction' && (isAdmin || isAccountant) && (
              <TransactionFormPage
                t={t}
                onSuccess={() => {
                  fetchMembers();
                  setCurrentPage('transactionList');
                }}
                onCancel={() => setCurrentPage('transactionList')}
              />
            )}

            {currentPage === 'transactionList' && (isAdmin || isAccountant) && (
              <TransactionListPage
                isAdmin={isAdmin}
                t={t}
                onAddTransactionClick={() => setCurrentPage('addTransaction')}
              />
            )}

            {currentPage === 'trustAccounts' && (isAdmin || isAccountant) && (
              <TrustAccountsPage t={t} isAdmin={isAdmin} isAccountant={isAccountant} />
            )}

            {currentPage === 'reports' && (isAdmin || isAccountant) && (
              <ReportsPage t={t} />
            )}

            {/* ── Member Pages ── */}
            {currentPage === 'myProfile' && !isAdmin && !isAccountant && (
              <MyProfilePage
                member={currentUser}
                t={t}
                onChangePassword={async (oldPassword, newPassword) => {
                  await authAPI.changePassword(oldPassword, newPassword);
                  showNotification(t.passwordChanged);
                }}
              />
            )}

            {currentPage === 'myDonations' && !isAdmin && !isAccountant && (
              <MyDonationsPage member={currentUser} t={t} />
            )}

            {/* ── Change Password — available to ALL user roles ── */}
            {currentPage === 'changePassword' && (
              <ChangePasswordPage t={t} language={language} />
            )}

            {currentPage === 'payment' && !isAdmin && !isAccountant && (
              <PaymentPage
                member={currentUser}
                t={t}
                onMakePayment={(amount, taxId) => makePaymentHandler(currentUser.id, amount, taxId)}
              />
            )}

            {currentPage === 'settings' && (
              <SettingsPage
                t={t}
                onShowNotification={showNotification}
              />
            )}
          </main>
        </div>

        {showModal && selectedMember && (
          <Modal onClose={() => setShowModal(false)}>
            <MemberDetailsModal
              member={selectedMember}
              t={t}
              onClose={() => setShowModal(false)}
            />
          </Modal>
        )}




        {showResetPasswordModal && memberToReset && (
          <ResetPasswordModal
            member={memberToReset}
            onClose={() => {
              setShowResetPasswordModal(false);
              setMemberToReset(null);
            }}
            onSuccess={() => {
              setShowResetPasswordModal(false);
              setMemberToReset(null);
              showNotification('Password reset successfully!');
              fetchMembers();
            }}
            t={t}
          />
        )}
      </div>
    </TamilProvider>
  );
}
