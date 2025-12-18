// Pagination.js
import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const siblingCount = 1;

  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, currentPage - siblingCount);
    const end = Math.min(totalPages, currentPage + siblingCount);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const goToFirst = () => onPageChange(1);
  const goToLast = () => onPageChange(totalPages);
  const goToPrev = () => onPageChange(Math.max(1, currentPage - 1));
  const goToNext = () => onPageChange(Math.min(totalPages, currentPage + 1));

  const btnBase =
    "px-2 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition md:px-3 md:text-sm text-xs md:py-1.5 py-1";

  const numBase =
    "px-2 py-1 rounded text-xs border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition md:px-3 md:text-sm md:py-1.5 py-1 min-w-[2rem]";

  const numActive =
    "px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 font-semibold border border-blue-300 md:px-3 md:text-sm md:py-1.5 py-1 min-w-[2rem]";

  return (
    <div className="flex justify-center mt-4 md:space-x-2 space-x-0.5">
     
      <button
        onClick={goToFirst}
        disabled={currentPage === 1}
        className={`hidden md:block ${btnBase}`}
      >
        « First
      </button>

     
      <button
        onClick={goToPrev}
        disabled={currentPage === 1}
        className={btnBase}
      >
        Prev
      </button>

    
      {currentPage > 2 + siblingCount && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className={numBase}
          >
            1
          </button>
          <span className="px-1 py-1 text-gray-500 md:text-sm text-xs md:px-2 px-0.5">...</span>
        </>
      )}

     
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={page === currentPage ? numActive : numBase}
        >
          {page}
        </button>
      ))}

    
      {currentPage < totalPages - (1 + siblingCount) && (
        <>
          <span className="px-1 py-1 text-gray-500 md:text-sm text-xs md:px-2 px-0.5">...</span>
          <button
            onClick={() => onPageChange(totalPages)}
            className={numBase}
          >
            {totalPages}
          </button>
        </>
      )}

    
      <button
        onClick={goToNext}
        disabled={currentPage === totalPages}
        className={btnBase}
      >
        Next
      </button>

      
      <button
        onClick={goToLast}
        disabled={currentPage === totalPages}
        className={`hidden md:block ${btnBase}`}
      >
        Last »
      </button>
    </div>
  );
};

export default Pagination;

