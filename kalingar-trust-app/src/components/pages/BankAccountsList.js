import React, { useState } from 'react';

const BankAccountsList = ({ bankAccounts, setCurrentView, setEditingBankAccount, deleteBankAccount }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [accountsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  // Filter bank accounts based on search term
  const filteredAccounts = bankAccounts.filter(account =>
    account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.accountNo.includes(searchTerm) ||
    account.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.branchName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastAccount = currentPage * accountsPerPage;
  const indexOfFirstAccount = indexOfLastAccount - accountsPerPage;
  const currentAccounts = filteredAccounts.slice(indexOfFirstAccount, indexOfLastAccount);
  const totalPages = Math.ceil(filteredAccounts.length / accountsPerPage);

  const handleEdit = (account) => {
    setEditingBankAccount(account);
    setCurrentView('bank-account-form');
  };

  const handleDelete = async (accountId, accountName) => {
    if (window.confirm(`Are you sure you want to delete ${accountName} account?`)) {
      try {
        await deleteBankAccount(accountId);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  // NEW EXPORT FUNCTION
  const handleExport = async () => {
    try {
      setLoading(true);
      console.log('📄 Starting Bank Accounts Excel export...');

      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to export data');
        return;
      }

      const response = await fetch('http://localhost:5000/api/bank-accounts/export', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Export failed');
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'Kalingar_Trust_Bank_Accounts.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Bank Accounts Excel export completed successfully');
      alert('Bank accounts list exported successfully!');

    } catch (error) {
      console.error('❌ Export error:', error);
      alert(`Export failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Bank Accounts</h2>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={() => {/* Column functionality */}}
          >
            <i className="fas fa-columns"></i>
            Columns
          </button>
          <button
            className="btn-secondary"
            onClick={handleExport}
            disabled={loading}
          >
            <i className={loading ? "fas fa-spinner fa-spin" : "fas fa-download"}></i>
            {loading ? 'Exporting...' : 'Export'}
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              setEditingBankAccount(null);
              setCurrentView('bank-account-form');
            }}
          >
            Add Bank Account
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-controls">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search bank accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {currentAccounts.length === 0 ? (
          <div className="no-data">
            <i className="fas fa-university"></i>
            <p>No bank accounts found</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Account Number</th>
                  <th>Account Name</th>
                  <th>Bank Name</th>
                  <th>Branch Name</th>
                  <th>IFSC Code</th>
                  <th>Contact No</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentAccounts.map((account) => (
                  <tr key={account.id}>
                    <td>{account.accountNo}</td>
                    <td>{account.accountName}</td>
                    <td>{account.bankName}</td>
                    <td>{account.branchName}</td>
                    <td>{account.ifscCode}</td>
                    <td>{account.contactNo}</td>
                    <td>
                      <span className={`status-badge ${account.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                        {account.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(account)}
                          title="Edit Bank Account"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(account.id, account.accountName)}
                          title="Delete Bank Account"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">
              Rows per page: {accountsPerPage} | {indexOfFirstAccount + 1}-{Math.min(indexOfLastAccount, filteredAccounts.length)} of {filteredAccounts.length}
            </span>
            <div className="pagination-controls">
              <button
                className="btn-icon"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button
                className="btn-icon"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankAccountsList;