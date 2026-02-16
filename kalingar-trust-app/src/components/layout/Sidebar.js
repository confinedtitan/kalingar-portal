import React from 'react';

const Sidebar = ({ currentView, setCurrentView, setEditingMember, setEditingBankAccount }) => {
  const handleNavigation = (view) => {
    if (view === 'member-form') {
      setEditingMember(null);
    }
    if (view === 'bank-account-form') {
      setEditingBankAccount(null);
    }
    setCurrentView(view);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">KT Portal</div>
      </div>
      <div className="sidebar-menu">
        <div className="menu-section">
          <div className="menu-title">Main</div>
          <div
            className={`menu-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavigation('dashboard')}
          >
            <i className="fas fa-tachometer-alt menu-icon"></i>
            <span>Dashboard</span>
          </div>
        </div>
        <div className="menu-section">
          <div className="menu-title">Members</div>
          <div
            className={`menu-item ${currentView === 'members-list' ? 'active' : ''}`}
            onClick={() => handleNavigation('members-list')}
          >
            <i className="fas fa-users menu-icon"></i>
            <span>Member List</span>
          </div>
          <div
            className={`menu-item submenu-item ${currentView === 'member-form' ? 'active' : ''}`}
            onClick={() => handleNavigation('member-form')}
          >
            <i className="fas fa-user-plus menu-icon"></i>
            <span>Add Member</span>
          </div>
        </div>
        <div className="menu-section">
          <div className="menu-title">Masters</div>
          <div
            className="menu-item"
            onClick={() => handleNavigation('user-management')}
          >
            <i className="fas fa-user-cog menu-icon"></i>
            <span>User Management</span>
          </div>
        </div>
        <div className="menu-section">
          <div className="menu-title">Accounts</div>
          <div
            className="menu-item"
            onClick={() => handleNavigation('user-management')}
          >
            <i className="fas fa-users-cog menu-icon"></i>
            <span>User Management</span>
          </div>
          <div
            className={`menu-item ${currentView === 'bank-accounts-list' ? 'active' : ''}`}
            onClick={() => handleNavigation('bank-accounts-list')}
          >
            <i className="fas fa-university menu-icon"></i>
            <span>Bank Accounts</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;