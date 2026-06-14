import React from 'react';
import { Home, Users, Plus, DollarSign, GitBranch, User, FileText } from 'lucide-react';
import { styles } from '../utils/styles';

export default function Sidebar({ isAdmin, currentPage, setCurrentPage, t }) {
  return (
    <aside style={styles.sidebar}>
      <nav style={styles.nav}>
        <button
          onClick={() => setCurrentPage('dashboard')}
          style={{ ...styles.navButton, ...(currentPage === 'dashboard' ? styles.navButtonActive : {}) }}
        >
          <Home size={20} />
          <span>{t.dashboard}</span>
        </button>

        {isAdmin && (
          <>
            <button
              onClick={() => setCurrentPage('members')}
              style={{ ...styles.navButton, ...(currentPage === 'members' ? styles.navButtonActive : {}) }}
            >
              <Users size={20} />
              <span>{t.members}</span>
            </button>

            <button
              onClick={() => setCurrentPage('addMember')}
              style={{ ...styles.navButton, ...(currentPage === 'addMember' ? styles.navButtonActive : {}) }}
            >
              <Plus size={20} />
              <span>{t.addMember}</span>
            </button>

            <button
              onClick={() => setCurrentPage('allPayments')}
              style={{ ...styles.navButton, ...(currentPage === 'allPayments' ? styles.navButtonActive : {}) }}
            >
              <DollarSign size={20} />
              <span>{t.payments}</span>
            </button>

            <button
              onClick={() => setCurrentPage('familyTree')}
              style={{ ...styles.navButton, ...(currentPage === 'familyTree' ? styles.navButtonActive : {}) }}
            >
              <GitBranch size={20} />
              <span>{t.familyTree}</span>
            </button>

            <button
              onClick={() => setCurrentPage('contentManagement')}
              style={{ ...styles.navButton, ...(currentPage === 'contentManagement' ? styles.navButtonActive : {}) }}
            >
              <FileText size={20} />
              <span>{t.contentManagement || 'Content'}</span>
            </button>
          </>
        )}

        {!isAdmin && (
          <>
            <button
              onClick={() => setCurrentPage('myProfile')}
              style={{ ...styles.navButton, ...(currentPage === 'myProfile' ? styles.navButtonActive : {}) }}
            >
              <User size={20} />
              <span>{t.myProfile}</span>
            </button>

            <button
              onClick={() => setCurrentPage('payment')}
              style={{ ...styles.navButton, ...(currentPage === 'payment' ? styles.navButtonActive : {}) }}
            >
              <DollarSign size={20} />
              <span>{t.makePayment}</span>
            </button>
          </>
        )}
      </nav>
    </aside>
  );
}
