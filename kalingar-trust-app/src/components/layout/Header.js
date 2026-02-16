import React from 'react';

const Header = ({ user, onLogout }) => {
  return (
    <div className="header">
      <div className="header-content">
        <h1 className="header-title">Kalingar Trust - Admin Portal</h1>
        <div className="header-user">
          <div className="user-info">
            <div className="user-avatar">
              <i className="fas fa-user"></i>
            </div>
            <span className="user-name">{user.name}</span>
          </div>
          <div className="header-actions">
            <button className="btn-icon" title="Notifications">
              <i className="fas fa-bell"></i>
            </button>
            <button
              className="btn-icon"
              onClick={onLogout}
              title="Logout"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;