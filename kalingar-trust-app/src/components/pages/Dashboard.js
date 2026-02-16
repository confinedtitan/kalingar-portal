import React from 'react';

const Dashboard = ({ members, bankAccounts, setCurrentView }) => {
  const totalMembers = members.length;
  const activeMemberPercent = ((members.filter(m => m.isActive).length / totalMembers) * 100) || 0;
  const totalBankAccounts = bankAccounts.length;
  const familyHeads = members.filter(m => m.headOfFamily === 'Yes').length;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <div className="page-actions">
          <button
            className="btn-success"
            onClick={() => setCurrentView('member-form')}
          >
            Add New Member
          </button>
        </div>
      </div>
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-value">{totalMembers}</div>
          <div className="stat-label">Total Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{familyHeads}</div>
          <div className="stat-label">Family Heads</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalBankAccounts}</div>
          <div className="stat-label">Bank Accounts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{Math.round(activeMemberPercent)}%</div>
          <div className="stat-label">Active Members</div>
        </div>
      </div>
      <div className="page-header">
        <h2 className="page-title">Quick Actions</h2>
      </div>
      <div className="dashboard-stats">
        <div
          className="stat-card"
          style={{ cursor: 'pointer' }}
          onClick={() => setCurrentView('members-list')}
        >
          <div className="stat-value">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-label">View All Members</div>
        </div>
        <div
          className="stat-card"
          style={{ cursor: 'pointer' }}
          onClick={() => setCurrentView('member-form')}
        >
          <div className="stat-value">
            <i className="fas fa-user-plus"></i>
          </div>
          <div className="stat-label">Add New Member</div>
        </div>
        <div
          className="stat-card"
          style={{ cursor: 'pointer' }}
          onClick={() => setCurrentView('bank-accounts-list')}
        >
          <div className="stat-value">
            <i className="fas fa-university"></i>
          </div>
          <div className="stat-label">Bank Accounts</div>
        </div>
        <div
          className="stat-card"
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-value">
            <i className="fas fa-chart-bar"></i>
          </div>
          <div className="stat-label">Reports</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;