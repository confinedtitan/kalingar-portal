import React, { useState } from 'react';

const MembersList = ({ members, setCurrentView, setEditingMember, deleteMember }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  // Filter members based on search term
  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.fatherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.mobile.includes(searchTerm)
  );

  // Calculate pagination
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);

  const handleEdit = (member) => {
    setEditingMember(member);
    setCurrentView('member-form');
  };

  const handleDelete = async (memberId, memberName) => {
    if (window.confirm(`Are you sure you want to delete ${memberName}?`)) {
      try {
        await deleteMember(memberId);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  // NEW EXPORT FUNCTION
  const handleExport = async () => {
    try {
      setLoading(true);
      console.log('📄 Starting Excel export...');

      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to export data');
        return;
      }

      const response = await fetch('http://localhost:5000/api/members/export', {
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
      let filename = 'Kalingar_Trust_Members.xlsx';
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

      console.log('✅ Excel export completed successfully');
      alert('Members list exported successfully!');

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
        <h2>Members List</h2>
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
              setEditingMember(null);
              setCurrentView('member-form');
            }}
          >
            Add Member
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-controls">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {currentMembers.length === 0 ? (
          <div className="no-data">
            <i className="fas fa-users"></i>
            <p>No members found</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member ID</th>
                  <th>Name</th>
                  <th>Father Name</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Gender</th>
                  <th>Head of Family</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentMembers.map((member) => (
                  <tr key={member.id}>
                    <td>{member.memberId}</td>
                    <td>{member.name}</td>
                    <td>{member.fatherName}</td>
                    <td>{member.mobile}</td>
                    <td>{member.email}</td>
                    <td>{member.gender}</td>
                    <td>
                      <span className={`status-badge ${member.headOfFamily === 'Yes' ? 'status-active' : 'status-inactive'}`}>
                        {member.headOfFamily}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(member)}
                          title="Edit Member"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(member.id, member.name)}
                          title="Delete Member"
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
              Rows per page: {membersPerPage} | {indexOfFirstMember + 1}-{Math.min(indexOfLastMember, filteredMembers.length)} of {filteredMembers.length}
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

export default MembersList;