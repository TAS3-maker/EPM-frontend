// Pagination.js
import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center mt-4 space-x-2">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        className="px-3 py-1 rounded bg-gray-200 text-gray-700"
        disabled={currentPage === 1}
      >
        Prev
      </button>

      {[...Array(totalPages).keys()].map((number) => (
        <button
          key={number}
          onClick={() => onPageChange(number + 1)}
          className={`px-3 py-1 rounded ${
            currentPage === number + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          {number + 1}
        </button>
      ))}

      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        className="px-3 py-1 rounded bg-gray-200 text-gray-700"
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
