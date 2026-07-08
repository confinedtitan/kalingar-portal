import React from 'react';
import { Home, Users, Plus, DollarSign, GitBranch, User, FileText, BookOpen, List, PlusCircle, BarChart3, Gift } from 'lucide-react';
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
        <NavBtn page="dashboard" icon={Home} label={t.dashboard} />

        {/* ── Admin Navigation ── */}
        {isAdmin && (
          <>
            <NavBtn page="members" icon={Users} label={t.members} />
            <NavBtn page="addMember" icon={Plus} label={t.addMember} />
            <NavBtn page="allPayments" icon={DollarSign} label={t.payments} />
            <NavBtn page="familyTree" icon={GitBranch} label={t.familyTree} />
            <NavBtn page="contentManagement" icon={FileText} label={t.contentManagement || 'Content'} />
            <NavBtn page="taxManagement" icon={DollarSign} label="Tax Management" />

            {/* Admin accounting access */}
            <div style={{ margin: '12px 0 4px', padding: '0 16px', fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Accounting
            </div>
            <NavBtn page="accountHeads" icon={BookOpen} label="Account Heads" />
            <NavBtn page="transactionList" icon={List} label="Transactions" />
            <NavBtn page="addTransaction" icon={PlusCircle} label="Add Transaction" />
          </>
        )}

        {/* ── Accountant Navigation ── */}
        {isAccountant && (
          <>
            <NavBtn page="accountantDashboard" icon={BarChart3} label="Dashboard" />
            <NavBtn page="accountHeads" icon={BookOpen} label="Account Heads" />
            <NavBtn page="addTransaction" icon={PlusCircle} label="Add Transaction" />
            <NavBtn page="transactionList" icon={List} label="Transactions" />
          </>
        )}

        {/* ── Member Navigation ── */}
        {!isAdmin && !isAccountant && (
          <>
            <NavBtn page="myProfile" icon={User} label={t.myProfile} />
            <NavBtn page="payment" icon={DollarSign} label={t.makePayment} />
            <NavBtn page="myDonations" icon={Gift} label="My Donations" />
          </>
        )}
      </nav>
    </aside>
  );
}
