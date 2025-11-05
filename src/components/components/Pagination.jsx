// Pagination.js
import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center mt-4 space-x-2">
     
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
        disabled={currentPage === 1}
      >
        Prev
      </button>

      <span className="px-4 py-1 bg-blue-100 text-blue-800 rounded font-semibold">
        Page {currentPage}
      </span>

      
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
