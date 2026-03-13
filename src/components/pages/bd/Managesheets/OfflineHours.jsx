import React, { useState, useEffect, useCallback } from 'react';
import { SectionHeader } from '../../../components/SectionHeader';
import { Loader2, User, Clock, Search, BarChart, Calendar } from 'lucide-react';
import {
  YesterdayButton,
  TodayButton,
  WeeklyButton,
  CustomButton,
  ClearButton,
  CancelButton,
  ExportButton,
  IconApproveButton,
  IconRejectButton,
  IconEditButton
} from "../../../AllButtons/AllButtons";
import { exportToExcel } from "../../../components/excelUtils";
import Pagination from "../../../components/Pagination";
import { useBDProjectsAssigned } from '../../../context/BDProjectsassigned.jsx';
import { API_URL } from '../../../utils/ApiConfig';

const getYesterday = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
};

const OfflineHours = () => {
  const { approvePerformanceSheet, rejectPerformanceSheet, showAlert } = useBDProjectsAssigned();
  
  const [offlineData, setOfflineData] = useState([]);
  const [allOfflineData, setAllOfflineData] = useState([]); // Store raw API data
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('user_name');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [startDate, setStartDate] = useState(getYesterday());
  const [endDate, setEndDate] = useState(getYesterday());
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedRow, setSelectedRow] = useState(null);

  const itemsPerPage = 10;

  // Fetch ALL data ONCE (no date filtering)
  const fetchOfflineHours = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('userToken');
      
      console.log('🔥 Fetching ALL offline hours data (no date filter)');
      
      const response = await fetch(`${API_URL}/api/get-users-offline-hours-date-wise`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const result = await response.json();
      const rawData = result.data || [];
      
      const transformedData = processOfflineData(rawData);
      setAllOfflineData(transformedData);
      setOfflineData(transformedData);

    } catch (error) {
      console.error('Error fetching offline hours:', error);
      showAlert?.({
        variant: "error",
        title: "Error",
        message: "Failed to fetch offline hours"
      });
      setOfflineData([]);
      setAllOfflineData([]);
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  const processOfflineData = (apiData) => {
    const flatData = [];
    
    apiData.forEach(dateEntry => {
      const { date, users } = dateEntry;
      
      users.forEach(user => {
        const { user_id, user_name, total_offline_hours, sheets } = user;
        
        sheets.forEach(sheet => {
          flatData.push({
            date,
            user_id,
            user_name,
            project_name: sheet.project_name,
            project_id: sheet.project_id,
            offline_hours: sheet.offline_hours,
            time: sheet.time,
            user_total_offline_hours: total_offline_hours,
            narration: sheet.narration,
            sheet_id: sheet.sheet_id,
            work_type: sheet.work_type,
            activity_type: sheet.activity_type,
            status: sheet.status || 'pending',
            tracked_hours: sheet.tracked_hours,
            not_tracked_reason: sheet.not_tracked_reason 
          });
        });
      });
    });
    
    return flatData;
  };

  // Handle Approve with refresh
  const handleApprove = async (sheetId) => {
    try {
      await approvePerformanceSheet(sheetId);
      await fetchOfflineHours(); // Refresh data after approve
    } catch (error) {
      console.error('Approve failed:', error);
    }
  };

  // Handle Reject with refresh
  const handleReject = async (sheetId) => {
    try {
      await rejectPerformanceSheet(sheetId);
      await fetchOfflineHours(); // Refresh data after reject
    } catch (error) {
      console.error('Reject failed:', error);
    }
  };

  // Client-side date filtering
  const applyDateFilter = useCallback((newStartDate, newEndDate) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    
    if (newStartDate && newEndDate) {
      const filtered = allOfflineData.filter(item => {
        const itemDate = new Date(item.date);
        const start = new Date(newStartDate);
        const end = new Date(newEndDate);
        return itemDate >= start && itemDate <= end;
      });
      setOfflineData(filtered);
    } else {
      setOfflineData(allOfflineData);
    }
  }, [allOfflineData]);

  // Client-side search + filter
  const getFilteredData = useCallback(() => {
    let filtered = offlineData;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        switch (filterBy) {
          case "user_name":
            return item.user_name?.toLowerCase().includes(query);
          case "project_name":
            return item.project_name?.toLowerCase().includes(query);
          case "date":
            return item.date?.includes(query);
          default:
            return true;
        }
      });
    }
    
    return filtered;
  }, [offlineData, searchQuery, filterBy]);

  const filteredDataItems = getFilteredData();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDataItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDataItems.length / itemsPerPage);

  // Update total when filters change
  useEffect(() => {
    const data = getFilteredData();
    setTotal(data.length);
    setCurrentPage(1);
  }, [getFilteredData]);

  // Initial data fetch
  useEffect(() => {
    fetchOfflineHours();
  }, [fetchOfflineHours]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleExport = () => {
    const exportData = filteredDataItems.map(item => ({
      Date: item.date,
      User: item.user_name,
      Project: item.project_name,
      'Offline Hours': item.offline_hours,
      'Total Time': item.time,
      'Work Type': item.work_type,
      Status: item.status
    }));
    exportToExcel(exportData, "offline_hours.xlsx");
  };

  // Date Filter Button Handlers
  const handleToday = () => {
    const today = new Date().toISOString().split("T")[0];
    applyDateFilter(today, today);
  };

  const handleYesterday = () => {
    const y = getYesterday();
    applyDateFilter(y, y);
  };

  const handleWeekly = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    applyDateFilter(start.toISOString().split("T")[0], end.toISOString().split("T")[0]);
  };

  const handleCustomDateChange = (newStart, newEnd) => {
    applyDateFilter(newStart, newEnd);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterBy('user_name');
    setStartDate(getYesterday());
    setEndDate(getYesterday());
    setOfflineData(allOfflineData);
    setCurrentPage(1);
  };

 useEffect(() => {
  if (selectedRow) {
    document.body.style.overflow = "hidden"; 
  } else {
    document.body.style.overflow = "auto"; 
  }

  return () => {
    document.body.style.overflow = "auto";
  };
}, [selectedRow]);



  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center space-x-3 bg-white rounded-xl shadow-sm py-6 px-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-700 font-medium">Loading offline hours...</span>
        </div>
      </div>
    );
  }

 

  return (
    <div className="">
      <SectionHeader
        icon={BarChart}
        title="Offline Hours"
        subtitle={`All offline hours data (${total} records)`}
      />

      {/* Filters & Controls */}
      <div className="flex flex-wrap items-center justify-start gap-2 bg-white px-4 py-2 shadow-md rounded-md">
        {/* Search */}
        <div className="flex items-center gap-3 border px-2 py-1.5 rounded-md shadow-md bg-white w-full sm:w-[280px]">
          <div className="flex items-center border border-gray-300 px-2 rounded-lg w-full">
            <Search className="h-5 w-5 text-gray-400 mr-2" />
            <input
              type="text"
              className="w-full rounded-lg focus:outline-none py-1 text-sm"
              placeholder={`Search by ${filterBy}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Select */}
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-1.5 text-sm w-full sm:w-[160px]"
        >
          <option value="user_name">User Name</option>
          <option value="project_name">Project Name</option>
          <option value="date">Date</option>
        </select>

        {/* Date Controls */}
        {!isCustomMode ? (
          <>
            <TodayButton onClick={handleToday} />
            <YesterdayButton onClick={handleYesterday} />
            <WeeklyButton onClick={handleWeekly} />
            <CustomButton onClick={() => setIsCustomMode(true)} />
          </>
        ) : (
          <>
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-4 py-1.5 text-sm"
              value={startDate}
              onChange={(e) => handleCustomDateChange(e.target.value, endDate)}
            />
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-4 py-1.5 text-sm"
              value={endDate}
              onChange={(e) => handleCustomDateChange(startDate, e.target.value)}
            />
            <ClearButton onClick={handleClearFilters} />
            <CancelButton onClick={() => {
              setIsCustomMode(false);
              handleClearFilters();
            }} />
          </>
        )}

        <ExportButton onClick={handleExport} />
        
        <div className="bg-gray-100 border border-gray-300 px-3 py-1.5 flex items-center gap-1 rounded shadow">
          <div className="text-sm font-semibold text-gray-700">Total</div>
          <div className="text-lg font-bold text-blue-600 leading-[14px]">{total}</div>
        </div>
      </div>

      {/* Global Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-4 h-[calc(100vh-184px)] flex flex-col">
        <div className="overflow-x-auto flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr className="whitespace-nowrap">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[150px]">
                  Project
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-28">
                  Total Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-28">
                  Offline Hours
                </th>
                {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">
                  Reason
                </th> */}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {searchQuery ? "No offline hours found matching your search." : "No offline hours data available."}
                  </td>
                </tr>
              ) : (
                currentItems.map((item, index) => (
                  <tr key={`${item.sheet_id}-${index}`} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedRow(item)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-[14px] h-[14px] text-blue-500" />
                        <span className="font-normal text-[12px] whitespace-nowrap">{item.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-[14px] h-[14px] text-blue-600" />
                        </div>
                        <span className="font-normal text-[12px] text-gray-900 whitespace-nowrap truncate max-w-[110px]">{item.user_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[12px] font-normal text-gray-900 truncate max-w-[110px]" title={item.project_name} >
                        {item.project_name}
                      </div>
                    </td>
                        <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-[14px] h-[14px] text-blue-500" />
                        <span className="font-normal text-[12px] text-blue-600">{item.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-[14px] h-[14px] text-orange-500" />
                        <span className="font-normal text-[12px] text-orange-600">{item.offline_hours}</span>
                      </div>
                    </td>
                
                    {/* <td className="px-6 py-4">
                      <span className="font-semibold text-lg text-gray-900">{item.not_tracked_reason}</span>
                    </td> */}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-normal ${
                        item.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : item.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        {item.status === 'rejected' ? (
                          // 🔒 Rejected: LOCKED only
                          <div className="text-gray-400 text-xs font-medium">LOCKED</div>
                        ) : item.status === 'approved' ? (
                          // ✅ Approved: Green check + EDIT icon (shows approve/reject on click)
                          <>
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-green-600 text-[10px] font-bold">✓</span>
                            </div>
                            <IconEditButton
                              size="sm"
                              onClick={() => {
                                // Toggle back to pending-like state (shows approve/reject)
                                setOfflineData(prev => prev.map(sheet => 
                                  sheet.sheet_id === item.sheet_id 
                                    ? { ...sheet, status: 'pending' }
                                    : sheet
                                ));
                              }}
                              title="Edit: Show approve/reject options"
                            />
                          </>
                        ) : (
                          // ⏳ Pending: Approve + Reject buttons
                          <>
                            <IconApproveButton
                              size="sm"
                              onClick={() => handleApprove(item.sheet_id)}
                              title="Approve this sheet"
                            />
                            <IconRejectButton
                              size="sm"
                              onClick={() => handleReject(item.sheet_id)}
                              title="Reject this sheet"
                            />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

{selectedRow && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 " onClick={() => setSelectedRow(null)}>
    
    <div className="bg-white rounded-xl shadow-xl w-[500px] p-6 relative" onClick={(e) => e.stopPropagation()}>

      {/* Close Button */}
      <button
        className="absolute top-3 right-3 text-gray-500 hover:text-black"
        onClick={() => setSelectedRow(null)}
      >
        ✕
      </button>

      <h2 className="text-lg font-bold mb-4">Offline Details</h2>

      <div className="space-y-4">

        <div>
          <div className="text-sm font-medium text-gray-600">Not Tracked Reason</div>
          <div className="text-gray-900 text-[12px] ">{selectedRow.not_tracked_reason || "-"}</div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-600">Narration</div>
          <div className="text-gray-900 text-[12px] whitespace-pre-line break-words">
            {selectedRow.narration || "-"}
          </div>
        </div>

      </div>

    </div>

  </div>
)}

        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-700">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDataItems.length)} of {filteredDataItems.length} entries
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default OfflineHours;
