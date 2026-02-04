
import React, { useMemo ,useEffect} from "react";
import { Loader2, ChevronDown, Calendar, User, Briefcase, Clock, FileText, Target, Pencil } from "lucide-react";
import Pagination from "../components/Pagination"; 
import { IconApproveButton, IconRejectButton, IconCancelTaskButton } from "../AllButtons/AllButtons";


const GlobalTable02 = ({
    // Core props 
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
    paginatedData,
    className = "",
    stickyHeader = false,
    crossIconInsteadOfPencil = false, 
    showTotalHoursArrow = false, 
    mainTableBulkActionsOnly = false,
    enableHeaderBulkActions = false,
    isAllSelected = false,
    onHeaderSelectAll,
    onHeaderBulkApprove,
    onHeaderBulkReject,

    tableType = "standard", 
    selectedRows = [],
    onSelectAll,
    onRowSelect,
    canEdit = false,
    editMode = {},
    onEditToggle,
    expandedRow = null,
    onToggleRow,
    selectedModalRows = [],
    onSelectAllModal,
    onRowSelectModal,
    onStatusChange,
    onBulkAction,
    modalData,
    colSpan = columns.length + 1,
    customEmptyMessage,

    // Icons mapping for main table
    iconsMap = {
        Date: Calendar,
        Employee: User,
        "Work Types": Target,
        Clients: Briefcase,
        "Total Hours": Clock,
        Sheets: FileText
    }
}) => {


const [showHeaderBulkMenu, setShowHeaderBulkMenu] = React.useState(false);
const [expandedNarration, setExpandedNarration] = React.useState(null);
const [selectedDropdownSheets, setSelectedDropdownSheets] = React.useState([]);


    const getMinutes = (time) => {
        if (!time || typeof time !== "string" || !time.includes(":")) return 0;
        const [h, m] = time.split(":").map((n) => parseInt(n, 10) || 0);
        return h * 60 + m;
    };

    const formatTime = (minutes) => {
        if (!minutes || isNaN(minutes)) return "00:00";
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };

    
    const renderStandardRow = (item, index) => (
        <tr
            key={item.id || `row-${index}`}
            className="hover:bg-gray-50 transition-colors duration-150"
            onClick={() => onRowClick?.(item)}
        >
            {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-center text-gray-900 text-xs">
                    {column.render ? (
                        column.render(item)
                    ) : (
                        <span className="font-medium text-gray-800 text-xs">
                            {item[column.key] || "N/A"}
                        </span>
                    )}
                </td>
            ))}
            {!hideActions && (
                <td className="px-4 py-3 text-center">
                    {actionsComponent?.right?.(item)}
                </td>
            )}
        </tr>
    );

    // MAIN TABLE RENDER (grouped data)
const renderMainRow = (day) => {
  const dayKey = `${day.date}_${day.user_name}`;
  const isSelected = selectedRows.includes(dayKey);
  const isOpen = expandedRow === dayKey;

  return (
    <React.Fragment key={dayKey}>
      {/* ================= MAIN ROW (UNCHANGED) ================= */}
      <tr
        className={`
          whitespace-nowrap transition-colors
          hover:bg-gray-50
          ${isSelected ? "bg-indigo-50 ring-1 ring-indigo-200" : ""}
        `}
      >
        {/* Checkbox */}
        <td className="px-4 py-4 text-center">
          <input
            type="checkbox"
            checked={isSelected}
            onClick={(e) => e.stopPropagation()}
            onChange={() => onRowSelect?.(dayKey)}
          />
        </td>

      {columns.map(({ key, width }, colIndex) => {
  let content = "—";

  if (key === "date") content = day.date;
  else if (key === "user_name") content = day.user_name;
  else if (key === "project_names") content = day.project_names;
  else if (key === "activity_types") content = day.activity_types;
  else if (key === "submit_date") content = day.submit_date;
 /* else if (key === "total_hours") {
    content = formatTime(day.total_hours);
  }*/


else if (key === "total_hours") {
  content = (
    <div className="relative">
      {/* trigger */}
      <div
        data-dropdown-trigger
        className="flex items-center justify-center gap-1 text-indigo-600 font-medium text-xs cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onToggleRow?.(isOpen ? null : dayKey);
          setExpandedNarration(null);
        }}
      >
        {formatTime(day.total_hours)}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* ===== GLASS DROPDOWN ===== */}
      {isOpen && (
        <div
          data-dropdown
          className="
            absolute z-50 mt-3 right-0
            w-[420px]
            rounded-2xl
            backdrop-blur-xl
            bg-gradient-to-br
            from-sky-100/60
            via-white/60
            to-pink-100/60
            border border-white/40
            shadow-[0_25px_60px_rgba(0,0,0,0.18)]
            overflow-hidden
          "
        >
          {/* Header */}
          <div className="px-4 py-2 border-b border-white/30">
            <p className="text-[11px] font-semibold tracking-wide text-gray-600 uppercase">
              Time entries
            </p>
          </div>

          {/* Content */}
          <div className="divide-y divide-white/40">
            {day.sheets.map((sheet) => {
              const isNarrationOpen = expandedNarration === sheet.id;

              return (
                <div
                  key={sheet.id}
                  onClick={() =>
                    setExpandedNarration(
                      isNarrationOpen ? null : sheet.id
                    )
                  }
                  className="
                    px-4 py-3
                    cursor-pointer
                    hover:bg-white/40
                    transition
                  "
                >
                  {/* Row 1 */}
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[12px] font-medium text-gray-900 truncate">
                      {sheet.project_name}
                    </p>

                    <span className="text-[11px] font-mono text-indigo-700">
                      {sheet.time}
                    </span>
                  </div>

                  {/* Row 2 */}
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500">
                      {day.date}
                    </span>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-2 w-2 rounded-full
                            ${
                              sheet.status?.toLowerCase() === "approved"
                                ? "bg-green-500"
                                : sheet.status?.toLowerCase() === "rejected"
                                ? "bg-red-500"
                                : "bg-yellow-400"
                            }`}
                        />
                        <span className="text-[10px] text-gray-600 capitalize">
                          {sheet.status}
                        </span>
                      </div>

                      {canEdit && (
                        <div className="flex gap-1">
                          <IconApproveButton
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusChange?.(sheet.id, "approved");
                            }}
                          />
                          <IconRejectButton
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusChange?.(sheet.id, "rejected");
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Narration */}
                  {isNarrationOpen && (
                    <div className="
                      mt-2
                      rounded-xl
                      bg-white/70
                      border border-white/50
                      p-3
                      max-h-[130px]
                      overflow-y-auto
                    ">
                      <p className="text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                        Narration
                      </p>
                      <pre className="text-[11px] text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {sheet.narration || "No narration provided."}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

          
  

  return (
    <td
      key={key || colIndex}
      className={`px-4 py-4 text-center text-xs text-gray-600 ${width || ""}`}
    >
      {content}
    </td>
  );
})}


<td
  className="px-4 py-4 items-center text-center text-xs text-gray-600 font-normal"
  onClick={(e) => e.stopPropagation()}
>
  {canEdit ? (
    mainTableBulkActionsOnly ? (
      <div className="flex gap-2 justify-center">
        {day.sheets.every(s => s.status?.toLowerCase() === "rejected") ? (
          <IconRejectButton
            onClick={() => {}}
            disabled={true}
            className="opacity-60 cursor-not-allowed"
          />
        ) : day.sheets.every(s => s.status?.toLowerCase() === "approved") ? (
          editMode[dayKey] ? (
            <div className="flex gap-2 justify-center">
              <IconApproveButton
                onClick={(e) => {
                  e.stopPropagation();
                  onBulkAction?.("approved", day.sheets);
                }}
              />
              <IconRejectButton
                onClick={(e) => {
                  e.stopPropagation();
                  onBulkAction?.("rejected", day.sheets);
                }}
              />
              <IconCancelTaskButton onClick={() => onEditToggle(dayKey)} />
            </div>
          ) : (
            <div className="flex gap-2 justify-center">
              <IconApproveButton
                onClick={() => {}}
                disabled={true}
                className="opacity-60 cursor-not-allowed"
              />
              <Pencil
                className="w-4 h-4"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditToggle(dayKey);
                }}
              />
            </div>
          )
        ) : (
          <>
            <IconApproveButton
              onClick={async () => {
                if (onBulkAction) {
                  await onBulkAction("approved", day.sheets);
                }
              }}
            />
            <IconRejectButton
              onClick={async () => {
                if (onBulkAction) {
                  await onBulkAction("rejected", day.sheets);
                }
              }}
            />
          </>
        )}
      </div>
    ) : editMode[dayKey] ? (
      <div className="flex gap-2 justify-center">
        <IconApproveButton
          onClick={(e) => {
            e.stopPropagation();
            onBulkAction?.("approved", day.sheets);
          }}
        />
        <IconRejectButton
          onClick={(e) => {
            e.stopPropagation();
            onBulkAction?.("rejected", day.sheets);
          }}
        />
        <IconCancelTaskButton onClick={() => onEditToggle(dayKey)} />
      </div>
    ) : (
      <div className="flex gap-2 justify-center">
        <IconApproveButton
          onClick={(e) => {
            e.stopPropagation();
            onBulkAction?.("approved", day.sheets);
          }}
        />
        <Pencil
          className="w-4 h-4"
          onClick={(e) => {
            e.stopPropagation();
            onEditToggle(dayKey);
          }}
        />
      </div>
    )
  ) : (
    "No access"
  )}
</td>



      </tr>
    </React.Fragment>
  );
};
    const renderModalRow = (sheet) => {
        const isOpen = expandedRow === sheet.id;
        const isSelected = selectedModalRows.includes(sheet.id);

        const ApproveButton = ({ onClick }) => (
            <button onClick={onClick} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold shadow-lg shadow-green-600/30 transition-all">
                ✓ Approve
            </button>
        );

        const RejectButton = ({ onClick }) => (
            <button onClick={onClick} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-lg shadow-red-600/30 transition-all">
                ✕ Reject
            </button>
        );

        return (
            <React.Fragment key={sheet.id}>
                <tr
                    onClick={() => onToggleRow?.(sheet.id)}
                    className={`
            cursor-pointer hover:bg-white/50 transition
            ${isSelected ? "bg-indigo-50/60 ring-1 ring-indigo-200" : ""}
          `}
                >
                    {/* Select */}
                    <td className="px-4 py-4">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => onRowSelectModal?.(sheet.id)}
                        />
                    </td>

                    {/* Dynamic columns */}
                    {columns.map(({ label, key }, colIndex) => {
                        let content = "N/A";
                        if (label === "Project") content = sheet.project_name;
                        else if (label === "Work Type") content = sheet.work_type;
                        else if (label === "Activity") content = sheet.activity_type;
                        else if (label === "Time") content = sheet.time;
                        else if (label === "Submitted on") {
                            content = sheet.created_at ? new Date(sheet.created_at).toLocaleDateString() : "N/A";
                        }
                        else if (label === "Status") {
                            content = (
                                <span className={`
                  px-3 py-1 rounded-full text-xs font-semibold
                  ${sheet.status === "approved" ? "bg-green-200/70 text-green-900"
                                        : sheet.status === "rejected" ? "bg-red-200/70 text-red-900"
                                            : "bg-yellow-200/70 text-yellow-900"}
                `}>
                                    {sheet.status}
                                </span>
                            );
                        }

                        return (
                            <td key={key || colIndex} className={`px-4 py-4 ${label === "Project" ? "font-medium truncate" : label === "Time" ? "font-mono" : label === "Submitted on" ? "text-xs text-gray-500" : ""}`}>
                                {content}
                            </td>
                        );
                    })}

                    {/* Actions */}
                    <td className="px-4 py-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                        {sheet.status?.toLowerCase() === "rejected" && (
                            <ApproveButton
                            onClick={async () => {
                                await onStatusChange?.(sheet.id, "approved");
                            }}
                            />
                        )}

                        {sheet.status?.toLowerCase() === "approved" && (
                            <RejectButton
                            onClick={async () => {
                                await onStatusChange?.(sheet.id, "rejected");
                            }}
                            />
                        )}

                        {sheet.status?.toLowerCase() === "pending" && ( 
                            <>
                                <ApproveButton onClick={async () => {await onStatusChange?.(sheet.id, "approved")}} />
                                <RejectButton onClick={async () => {await onStatusChange?.(sheet.id, "rejected")}} />
                            </>
                            )}
                    </td>

                    {/* Expand */}
                    <td className="px-4 py-4 text-right">
                        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </td>
                </tr>

                {/* Expanded Narration */}
                {isOpen && (
                    <tr>
                        <td colSpan="10" className="px-6 py-4 bg-white/40 w-full">
                            <div className="rounded-2xl bg-white/80 backdrop-blur-lg border border-white/40 p-5">
                                <p className="text-sm font-semibold text-gray-700 mb-2">Narration</p>
                                <p className="text-sm text-gray-800 leading-relaxed">
                                    {sheet.narration || "No narration provided."}
                                </p>
                            </div>
                        </td>
                    </tr>
                )}
            </React.Fragment>
        );
    };

    const tableData = useMemo(() => {
        if (tableType === "main") return paginatedData || data;
        if (tableType === "modal") return modalData?.sheets || data;
        return paginatedData || data;
    }, [tableType, paginatedData, data, modalData]);

    const renderTableBody = () => {
        if (isLoading) {
            return (
                <tr>
                    <td colSpan={colSpan} className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                            <span className="text-gray-500">Loading...</span>
                        </div>
                    </td>
                </tr>
            );
        }

        if (tableData.length === 0) {
            return (
                <tr>
                    <td colSpan={colSpan} className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                            <div className="rounded-full bg-gray-100 p-3">
                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">{emptyStateTitle}</h3>
                            <p className="mt-1 text-sm text-gray-500">{emptyStateMessage || customEmptyMessage}</p>
                        </div>
                    </td>
                </tr>
            );
        }

        switch (tableType) {
            case "main":
                return tableData.map(renderMainRow);
            case "modal":
                return tableData.map(renderModalRow);
            default:
                return tableData.map(renderStandardRow);
        }
    };

    const renderTableHeader = () => (
        <thead className={stickyHeader
            ? "text-xs font-semibold uppercase text-white sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-800"
            : tableType === "main" ? "border-b border-gray-800 bg-black text-white"
                : tableType === "modal" ? "bg-white/50" : ""
        }>
            <tr className={tableType === "main" ? "table-th-tr-row table-bg-heading whitespace-nowrap sm:whitespace-normal" : "bg-white/60 backdrop-blur table-th-tr-row whitespace-nowrap sm:whitespace-normal"}>
                {(tableType === "main" || tableType === "modal") && (
                            <th className="px-4 py-2 font-medium text-sm w-[80px] relative text-center">
                                
                                {/* ✅ MAIN TABLE HEADER */}
                                {tableType === "main" ? (
                                <div className="flex items-center justify-center gap-1">
                                    <input
                                        type="checkbox"
                                        checked={!!isAllSelected}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            if (onHeaderSelectAll) {
                                            onHeaderSelectAll();
                                            }
                                        }}
                                        />

                                    {/* 🔥 BULK MENU */}
                                    {enableHeaderBulkActions && selectedRows?.length > 0 && (
                                    <div className="relative">
                                        <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowHeaderBulkMenu(prev => !prev);
                                        }}
                                        className="w-6 h-6 flex items-center justify-center text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                        ⋮⋮
                                        </button>

                                        {showHeaderBulkMenu && (
                                        <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-30 min-w-[140px]">
                                            <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowHeaderBulkMenu(false);
                                                onHeaderBulkApprove?.();
                                            }}
                                            className="block w-full text-left px-3 py-2 text-sm text-green-700 hover:bg-green-50"
                                            >
                                            Approve All ({selectedRows.length})
                                            </button>

                                            <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowHeaderBulkMenu(false);
                                                onHeaderBulkReject?.();
                                            }}
                                            className="block w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                                            >
                                            Reject All ({selectedRows.length})
                                            </button>
                                        </div>
                                        )}
                                    </div>
                                    )}
                                </div>
                                ) : (
                                /* ✅ MODAL HEADER (UNCHANGED) */
                                <input type="checkbox" onChange={onSelectAllModal} />
                                )}
                            </th>
                            )}


                {/* {columns.map((column) => (
            
          <th 
            key={column.key}
            className={`px-4 py-2 font-medium text-sm ${column.headerClassName} ${tableType === "main" ? "items-center" : ""}`} 
            style={column.width ? { width: column.width } : {}}
          >
            {column.label}
          </th>
        ))} */}

                {columns.map((column) => {
                    const HeaderIcon = iconsMap[column.label];

                    return (
                        <th
                            key={column.key}
                            className={`px-4 py-2 font-medium text-sm 
                                        ${tableType === "modal" ? "text-gray-700" : ""}
                                        ${column.headerClassName}
                                    `}
                            style={column.width ? { width: column.width } : {}}
                        >
                            <div className={`flex items-center gap-2
                                    ${tableType === "modal" && column.label === "Project"
                                        ? "justify-start"
                                        : "justify-center"}
                                    `}>
                                {HeaderIcon && <HeaderIcon className="h-4 w-4" />}
                                <span>{column.label}</span>
                            </div>
                        </th>
                    );
                })}

                {!hideActions && (
                    <th
                        className={`px-4 py-2 font-medium text-sm text-center
                        ${tableType === "modal" ? "text-gray-700" : ""}
                        `}
                    >
                        Actions
                    </th>
                    )}


                {tableType === "modal" && <th className="px-4 py-2"></th>} 
            </tr>
        </thead>
    );

useEffect(() => {
  const handleMouseDown = (e) => {
    if (
      e.target.closest("[data-dropdown]") ||
      e.target.closest("[data-dropdown-trigger]")
    ) {
      return;
    }

    // otherwise close
    onToggleRow?.(null);
    setExpandedNarration(null);
  };

  window.addEventListener("mousedown", handleMouseDown);
  return () => window.removeEventListener("mousedown", handleMouseDown);
}, []);




    return (
        <div className={`max-w-full overflow-x-auto ${className}`}>
            <div className="">
                <table className={`w-full ${tableType === "main" ? "min-w-max border-collapse table-auto" : "table-auto"}`}>
                    {renderTableHeader()}
                    <tbody className={tableType === "main" ? "bg-white divide-y divide-gray-200"
                        : tableType === "modal" ? "divide-y divide-white/30"
                            : "divide-y divide-gray-100"}>
                        {renderTableBody()}
                    </tbody>
                </table>

                {enablePagination && totalPages > 1 && (
                    <div className="p-4">
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

export default GlobalTable02;
