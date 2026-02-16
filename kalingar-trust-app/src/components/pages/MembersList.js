import React, { useState } from 'react';

const MembersList = ({ members, setCurrentView, setEditingMember, deleteMember }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.fatherName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMembers = filteredMembers.slice(startIndex, endIndex);

  const handleEdit = (member) => {
    setEditingMember(member);
    setCurrentView('member-form');
  };

  const handleDelete = (memberId) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      deleteMember(memberId);
    }
  };

  return (
    <div className="page">
      <div className="table-container">
        <div className="table-header">
          <h2 className="table-title">Members List</h2>
          <div className="table-actions">
            <button className="btn-secondary">
              <i className="fas fa-columns"></i> Columns
            </button>
            <button className="btn-secondary">
              <i className="fas fa-download"></i> Export
            </button>
            <button
              className="btn-success"
              onClick={() => setCurrentView('member-form')}
            >
              Add Member
            </button>
          </div>
        </div>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {currentMembers.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Setup</th>
                <th>Member ID</th>
                <th>Name</th>
                <th>Father Name</th>
                <th>Mobile No.</th>
                <th>Home Address</th>
                <th>Gender</th>
                <th>Family Head</th>
                <th>Family Head Name</th>
                <th>Old Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentMembers.map(member => (
                <tr key={member.id}>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>
                    <i className="fas fa-cog"></i>
                  </td>
                  <td>{member.memberId}</td>
                  <td>{member.name}</td>
                  <td>{member.fatherName}</td>
                  <td>{member.mobile}</td>
                  <td>{member.address}</td>
                  <td>{member.gender}</td>
                  <td>{member.headOfFamily}</td>
                  <td>{member.headOfFamily === 'Yes' ? member.name : ''}</td>
                  <td>{member.oldBalance || 0}</td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => handleEdit(member)}
                      style={{ marginRight: '5px' }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => handleDelete(member.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">No members found</div>
        )}
        <div className="pagination">
          <div className="pagination-info">
            {`Rows per page: ${itemsPerPage} | ${startIndex + 1}-${Math.min(endIndex, filteredMembers.length)} of ${filteredMembers.length}`}
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

export default MembersList;