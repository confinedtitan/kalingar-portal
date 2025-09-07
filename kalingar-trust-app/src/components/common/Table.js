import React, { useState } from 'react';

const Table = ({ columns, data, onEdit, onDelete, searchable = true, title }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = searchable ? data.filter(item => {
    return Object.values(item).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) : data;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  return (
    <div className="table-container">
      {title && (
        <div className="table-header">
          <h2 className="table-title">{title}</h2>
        </div>
      )}
      {searchable && (
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}
      {currentData.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key}>{col.title}</th>
              ))}
              {(onEdit || onDelete) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {currentData.map((item, index) => (
              <tr key={item.id || index}>
                {columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(item[col.key], item) : item[col.key]}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td>
                    {onEdit && (
                      <button
                        className="btn-secondary"
                        onClick={() => onEdit(item)}
                        style={{ marginRight: '5px' }}
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="btn-cancel"
                        onClick={() => onDelete(item.id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-data">No data found</div>
      )}
      <div className="pagination">
        <div className="pagination-info">
          {`Rows per page: ${itemsPerPage} | ${startIndex + 1}-${Math.min(endIndex, filteredData.length)} of ${filteredData.length}`}
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
  );
};

export default Table;