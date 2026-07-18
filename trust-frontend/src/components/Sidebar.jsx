import React from 'react';
import { Home, Users, Plus, DollarSign, GitBranch, User, FileText, BookOpen, List, PlusCircle, BarChart3, Gift, KeyRound, Briefcase, Settings, UserCheck } from 'lucide-react';
import { styles } from '../utils/styles';

export default function Sidebar({ isAdmin, isAccountant, currentPage, setCurrentPage, t }) {
  const NavBtn = ({ page, icon: Icon, label }) => (
    <button
      onClick={() => setCurrentPage(page)}
      style={{ ...styles.navButton, ...(currentPage === page ? styles.navButtonActive : {}) }}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <aside style={styles.sidebar}>
      <nav style={styles.nav}>
        {!isAccountant && <NavBtn page="dashboard" icon={Home} label={t.dashboard} />}

        {/* ── Change Password — visible to ALL users ── */}
        <NavBtn page="changePassword" icon={KeyRound} label={t.changePassword || 'Change Password'} />
        <NavBtn page="settings" icon={Settings} label={t.settings || 'Settings'} />

        {/* ── Admin Navigation ── */}
        {isAdmin && (
          <>
            <NavBtn page="members" icon={Users} label={t.members} />
            <NavBtn page="memberChanges" icon={UserCheck} label={t.memberChanges || 'Member Changes'} />
            <NavBtn page="familyTree" icon={GitBranch} label={t.familyTree} />
            <NavBtn page="contentManagement" icon={FileText} label={t.contentManagement || 'Content'} />
            <NavBtn page="taxManagement" icon={DollarSign} label={t.taxManagement || 'Tax Management'} />

            {/* Admin accounting access */}
            <div style={{ margin: '12px 0 4px', padding: '0 16px', fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t.accounting || 'Accounting'}
            </div>
            <NavBtn page="accountHeads" icon={BookOpen} label={t.accountHeads || 'Account Heads'} />
            <NavBtn page="trustAccounts" icon={Briefcase} label={t.trustAccounts || 'Trust Accounts'} />
            <NavBtn page="transactionList" icon={List} label={t.transactions || 'Transactions'} />
            <NavBtn page="reports" icon={BarChart3} label={t.reports || 'Reports'} />
          </>
        )}

        {/* ── Accountant Navigation ── */}
        {isAccountant && (
          <>
            <NavBtn page="accountantDashboard" icon={BarChart3} label={t.accountantDashboard || 'Dashboard'} />
            <NavBtn page="memberChanges" icon={UserCheck} label={t.memberChanges || 'Member Changes'} />
            <NavBtn page="accountHeads" icon={BookOpen} label={t.accountHeads || 'Account Heads'} />
            <NavBtn page="trustAccounts" icon={Briefcase} label={t.trustAccounts || 'Trust Accounts'} />
            <NavBtn page="transactionList" icon={List} label={t.transactions || 'Transactions'} />
            <NavBtn page="reports" icon={BarChart3} label={t.reports || 'Reports'} />
          </>
        )}

        {/* ── Member Navigation ── */}
        {!isAdmin && !isAccountant && (
          <>
            <NavBtn page="myProfile" icon={User} label={t.myProfile} />
            <NavBtn page="payment" icon={DollarSign} label={t.makePayment} />
            <NavBtn page="myDonations" icon={Gift} label={t.myDonations || 'My Donations'} />
          </>
        )}
      </nav>
    </aside>
  );
}
