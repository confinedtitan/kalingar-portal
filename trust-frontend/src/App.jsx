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
import MyProfilePage from './pages/MyProfilePage';
import PaymentPage from './pages/PaymentPage';
import MemberDetailsModal from './components/MemberDetailsModal';
import { translations } from './data/translations';
import { styles } from './utils/styles';
import { authAPI, memberAPI, paymentAPI } from './services/api';

export default function App() {
  const [language, setLanguage] = useState('en');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
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
          setCurrentUser(JSON.parse(savedUser));
          setIsAdmin(savedIsAdmin === 'true');
          setIsLoggedIn(true);
        } catch (error) {
          // Token is invalid — clear everything
          console.log('Stored token is invalid, clearing session');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('current_user');
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

      // Check if password reset is required
      if (data.password_reset_required && !data.is_admin) {
        setPasswordResetRequired(true);
        setShowPasswordChange(true);
      }

      if (data.is_admin) {
        setIsAdmin(true);
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
      setIsLoggedIn(false);
      setCurrentUser(null);
      setIsAdmin(false);
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
      // Map camelCase form fields to snake_case Django fields
      const apiData = {
        name: memberData.name,
        phone: memberData.phone,

        date_of_birth: memberData.dob,
        address: memberData.address,
        father_name: memberData.fatherName,
        mother_name: memberData.motherName || '',
        spouse_name: memberData.spouseName || '',
        annual_tax: memberData.annualTax,
        password: memberData.password || memberData.phone,
        children: (memberData.children || []).map(child => ({
          name: child.name,
          date_of_birth: child.dob,
          gender: child.gender,
        })),
      };
      await memberAPI.create(apiData);
      showNotification(t.memberAdded);
      // Refresh members list
      fetchMembers();
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

  const makePaymentHandler = async (memberId, amount) => {
    try {
      await paymentAPI.create({
        member: memberId,
        amount: amount,
        payment_method: 'UPI',
      });
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
                onExportExcel={exportToExcel}
                onResetPassword={handleResetPassword}
              />
            )}

            {currentPage === 'addMember' && isAdmin && (
              <AddMemberPage
                t={t}
                onAddMember={addMemberHandler}
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

            {currentPage === 'myProfile' && !isAdmin && (
              <MyProfilePage
                member={currentUser}
                t={t}
                onChangePassword={async (oldPassword, newPassword) => {
                  await authAPI.changePassword(oldPassword, newPassword);
                  showNotification(t.passwordChanged);
                }}
              />
            )}

            {currentPage === 'payment' && !isAdmin && (
              <PaymentPage
                member={currentUser}
                t={t}
                onMakePayment={(amount) => makePaymentHandler(currentUser.id, amount)}
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

        {showPasswordChange && passwordResetRequired && (
          <ChangePassword
            isForced={passwordResetRequired}
            onClose={() => setShowPasswordChange(false)}
            onSuccess={() => {
              setPasswordResetRequired(false);
              setShowPasswordChange(false);
              showNotification('Password changed successfully!');
            }}
            t={t}
          />
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
