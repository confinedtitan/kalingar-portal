import React, { useState } from 'react';

const BankAccountsList = ({ bankAccounts, setCurrentView, setEditingBankAccount, deleteBankAccount }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredAccounts = bankAccounts.filter(account => 
    account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.accountNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.bankName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAccounts = filteredAccounts.slice(startIndex, endIndex);

  const handleEdit = (account) => {
    setEditingBankAccount(account);
    setCurrentView('bank-account-form');
  };

  const handleDelete = (accountId) => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      deleteBankAccount(accountId);
    }
  };

  return (
    <div className="page">
      <div className="table-container">
        <div className="table-header">
          <h2 className="table-title">Bank Accounts</h2>
          <div className="table-actions">
            <button className="btn-secondary">
              <i className="fas fa-columns"></i> Columns
            </button>
            <button className="btn-secondary">
              <i className="fas fa-download"></i> Export
            </button>
            <button
              className="btn-success"
              onClick={() => setCurrentView('bank-account-form')}
            >
              Add New Bank Acc
            </button>
          </div>
        </div>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {currentAccounts.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Setup</th>
                <th>Account No.</th>
                <th>Account Name</th>
                <th>IFSC Code</th>
                <th>Bank Name</th>
                <th>Branch Name</th>
                <th>Branch Address</th>
                <th>Branch Contact No.</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentAccounts.map(account => (
                <tr key={account.id}>
                  <td>
                    <i className="fas fa-cog"></i>
                  </td>
                  <td>{account.accountNo}</td>
                  <td>{account.accountName}</td>
                  <td>{account.ifscCode}</td>
                  <td>{account.bankName}</td>
                  <td>{account.branchName}</td>
                  <td>{account.branchAddress}</td>
                  <td>{account.contactNo}</td>
                  <td>{account.status}</td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => handleEdit(account)}
                      style={{ marginRight: '5px' }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => handleDelete(account.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">No bank accounts found</div>
        )}
        <div className="pagination">
          <div className="pagination-info">
            {`Rows per page: ${itemsPerPage} | ${startIndex + 1}-${Math.min(endIndex, filteredAccounts.length)} of ${filteredAccounts.length}`}
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              &lt;
            </button>
            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankAccountsList;