import React, { useMemo } from "react";
import { Loader2 } from "lucide-react";
import Pagination from "../components/Pagination";

const GlobalTable = ({
  data = [],
  columns = [],
  isLoading = false,
  currentPage = 1,
  totalPages = 0,
  onPageChange,
  enablePagination = true,
  hideActions = false,
  actionsComponent,
  onRowClick,
  emptyStateTitle = "No data found",
  emptyStateMessage = "No records available.",
  paginatedData, // Optional: pass pre-filtered/paginated data
  className = "",
  stickyHeader = false,
  maxHeight,
  actionHeaderClassName,
  cellCustomClassName
}) => {
  return (
    <div className={`flex-1 flex flex-col max-w-full ${className}`}
      style={maxHeight ? { maxHeight } : {}}
      >
      <div className="flex-1 overflow-y-auto">
        <table className="w-full table-auto">
          <thead className={stickyHeader 
            ? "text-xs font-semibold uppercase text-white sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-800" 
            : ""
          }>
            <tr className={`table-bg-heading table-th-tr-row ${maxHeight ? "whitespace-nowrap":"whitespace-nowrap sm:whitespace-normal"}`}>
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className={`px-4 py-2 font-medium text-[12px] ${column.headerClassName}`} 
                  style={column.width ? { width: column.width } : {}}
                >
                  {column.label}
                </th>
              ))}
              {/* <th className="px-4 py-2 font-medium text-center text-sm">Actions</th> */}
             {!hideActions && (
                <th className={`px-4 py-2 font-medium text-center text-[12px] ${ actionHeaderClassName ?? "w-[150px]" } `}>
                Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className={`divide-y divide-gray-100 ${maxHeight ? "whitespace-nowrap":""} `}>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (!hideActions ? 1 : 0)} className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                    <span className="text-gray-500">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData?.length > 0 || data.length > 0 ? (
              (paginatedData || data).map((item, index) => (
                <tr 
                  key={item.id || `row-${index}`} 
                  className="hover:bg-gray-50 transition-colors duration-150"
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                   <td className="px-3 py-2 text-center">
                      <div className={`flex text-[10px] ${column.cellCustomClassName ?? "items-center justify-center text-center" }`}>
                        {column.render ? (
                          column.render(item)
                        ) : (
                          <span className="font-medium text-gray-800 text-[10px]">
                            {item[column.key] || "N/A"}
                          </span>
                        )}
                      </div>
                    </td>
                    // <td key={column.key} className="px-4 py-3 text-center text-gray-900 text-xs">
                    //   {column.render ? (
                    //     column.render(item)
                    //   ) : (
                    //     <span className="font-medium text-gray-800 text-xs">
                    //       {item[column.key] || "N/A"}
                    //     </span>
                    //   )}
                    // </td>
                  ))}
                   {!hideActions && (
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center">
                        {actionsComponent?.right?.(item)}
                      </div>
                     </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (!hideActions ? 1 : 0)} className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="rounded-full bg-gray-100 p-3">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">{emptyStateTitle}</h3>
                    <p className="mt-1 text-sm text-gray-500">{emptyStateMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {enablePagination && totalPages > 1 && (
          <div className="border-t bg-white p-3 sticky bottom-0">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalTable;
