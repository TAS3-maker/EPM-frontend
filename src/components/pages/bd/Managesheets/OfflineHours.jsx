import React, { useState, useEffect, useCallback } from 'react';
import { SectionHeader } from '../../../components/SectionHeader';
import { Loader2, User, Clock, Search, BarChart } from 'lucide-react';
import {
  YesterdayButton,
  TodayButton,
  WeeklyButton,
  CustomButton,
  ClearButton,
  CancelButton,
  ExportButton,
} from "../../../AllButtons/AllButtons";
import { exportToExcel } from "../../../components/excelUtils";
import Pagination from "../../../components/Pagination";
import { API_URL } from "../../../utils/ApiConfig";

const getYesterday = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
};

const OfflineHours = () => {
  const [offlineHours, setOfflineHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('name');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [startDate, setStartDate] = useState(getYesterday());
  const [endDate, setEndDate] = useState(getYesterday());
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedUser, setSelectedUser] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [expandedProjectRow, setExpandedProjectRow] = useState(null);

  const toggleProjectRow = (index) => {
    setExpandedProjectRow(prev => (prev === index ? null : index));
  };


  const itemsPerPage = 10;

  
  const fetchOfflineHours = useCallback(async (start, end) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('userToken');
      
      console.log('🔥 API Call with dates:', start, end); 
      
      const params = new URLSearchParams({
        start_date: start,
        end_date: end
      });

      const response = await fetch(`${API_URL}/api/get-users-offline-hours?${params}`, {
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
      const data = result.data || [];
      setOfflineHours(data);
    } catch (error) {
      console.error('Error fetching offline hours:', error);
      setOfflineHours([]);
    } finally {
      setLoading(false);
    }
  }, []); 

 
  useEffect(() => {
    if (startDate && endDate) {
      fetchOfflineHours(startDate, endDate);
    }
  }, [startDate, endDate, fetchOfflineHours]);

  
  const getFilteredData = () => {
    let filtered = offlineHours;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => {
        switch (filterBy) {
          case 'name':
            return user.user_name?.toLowerCase().includes(query);
          case 'tl_name':
            return user.tl_name?.toLowerCase().includes(query);
          case 'team_name':
            return user.team_name?.toLowerCase().includes(query);
          default:
            return user.user_name?.toLowerCase().includes(query);
        }
      });
    }
    return filtered;
  };

  
  const filteredDataItems = getFilteredData();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDataItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDataItems.length / itemsPerPage);

  
  useEffect(() => {
    const data = getFilteredData();
    setTotal(data.length);
    setCurrentPage(1);
  }, [offlineHours, searchQuery, filterBy]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // ================= MODAL HANDLERS =================
  const openUserDetails = (user) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
    setDetailModalOpen(false);
  };

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
    <div className="space-y-6">
      <SectionHeader
        icon={BarChart}
        title="Offline-Hours"
        subtitle={`List of all users offline hours (${total} total)`}
      />

     
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 shadow-md rounded-md">
        {/* Search */}
        <div className="flex items-center gap-3 border p-2 rounded-lg shadow-md bg-white w-full sm:w-[240px]">
          <div className="flex items-center border border-gray-300 px-2 rounded-lg w-full sm:w-[240px]">
            <Search className="h-5 w-5 text-gray-400 mr-2" />
            <input
              type="text"
              className="w-full rounded-lg focus:outline-none py-2"
              placeholder={`Search by ${filterBy}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-[184px]"
          >
            <option value="name">User Name</option>
            <option value="tl_name">TL Name</option>
            <option value="team_name">Department Name</option>
          </select>

          {!isCustomMode ? (
            <>
             
              <TodayButton
                onClick={() => {
                  const today = new Date().toISOString().split("T")[0];
                  console.log('📅 Today clicked:', today); 
                  setStartDate(today);
                  setEndDate(today);
                }}
              />

              
              <YesterdayButton
                onClick={() => {
                  const y = getYesterday();
                  console.log('📅 Yesterday clicked:', y); 
                  setStartDate(y);
                  setEndDate(y);
                }}
              />

           
              <WeeklyButton
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(start.getDate() - 6);
                  const s = start.toISOString().split("T")[0];
                  const e = end.toISOString().split("T")[0];
                  console.log(' Week clicked:', s, 'to', e); 
                  setStartDate(s);
                  setEndDate(e);
                }}
              />

              <CustomButton onClick={() => setIsCustomMode(true)} />
            </>
          ) : (
            <>
              <input
                type="date"
                className="border border-gray-300 rounded-lg px-4 py-2"
                value={startDate}
                onChange={(e) => {
                  const newStart = e.target.value;
                  console.log(' Custom start changed:', newStart); 
                  setStartDate(newStart);
                }}
              />

              <input
                type="date"
                className="border border-gray-300 rounded-lg px-4 py-2"
                value={endDate}
                onChange={(e) => {
                  const newEnd = e.target.value;
                  console.log(' Custom end changed:', newEnd); 
                  setEndDate(newEnd);
                }}
              />

              <ClearButton
                onClick={() => {
                  const y = getYesterday();
                  console.log(' Clear clicked:', y); 
                  setStartDate(y);
                  setEndDate(y);
                  setSearchQuery("");
                }}
              />

              <CancelButton
                onClick={() => {
                  const y = getYesterday();
                  console.log(' Cancel clicked:', y); 
                  setIsCustomMode(false);
                  setStartDate(y);
                  setEndDate(y);
                }}
              />
            </>
          )}

          <ExportButton
            onClick={() => exportToExcel(filteredDataItems, "offline_hours.xlsx")}
          />
          <div className="bg-gray-100 border border-gray-300 px-2 py-1 rounded shadow cursor-pointer transform transition-transform duration-300 hover:scale-105">
            <div className="text-sm font-semibold text-gray-700">Total</div>
            <div className="text-xs text-gray-600 text-center">{total}</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr className='whitespace-nowrap'>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Offline Hours</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Projects Breakdown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    {searchQuery ? 'No users found matching your search.' : 'No offline hours data available.'}
                  </td>
                </tr>
              ) : (
                currentItems.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap" onClick={() => openUserDetails(user)} >
                    <td className="px-4 md:px-6 py-2 md:py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 md:w-10 h-8 md:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 md:w-5 h-4 md:h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{user.user_name}</div>
                          <div className="text-xs text-gray-500">ID: {user.user_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-2 md:py-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 md:w-4 h-3 md:h-4 text-orange-500" />
                        <span className="font-semibold text-base md:text-lg text-gray-900">{user.total_offline_hours}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-2 md:py-4">
                      <div className="space-y-2">
                        {user.projects && user.projects.length > 0 ? (
                          user.projects.map((project, idx) => (
                            <div key={idx} className="flex items-center gap-1 justify-between p-2 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 md:w-3 h-2 md:h-3 bg-purple-400 rounded-full"></div>
                                <span className="text-xs md:text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                  {project.project_name}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-semibold text-xs md:text-sm text-gray-900">
                                  {project.total_offline_hours}
                                </span>
                                {project.traking_id && (
                                  <div className="text-xs text-gray-500 mt-0.5">#{project.traking_id}</div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No projects</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


     {detailModalOpen && selectedUser && (
  <div className="fixed inset-0 !m-0 z-50 flex items-center justify-center p-4">

    {/* BACKDROP */}
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-md"
      onClick={closeUserDetails}
    />

    {/* MODAL */}
    <div
      className="
        relative w-full max-w-5xl max-h-[90vh]
        rounded-3xl overflow-hidden
        bg-white/70 backdrop-blur-xl
        border border-white/30
        shadow-[0_30px_90px_rgba(0,0,0,0.35)]
        flex flex-col
      "
    >

      {/* HEADER */}
      <div className="p-6 border-b border-white/30 bg-gradient-to-r from-sky-200/40 to-indigo-200/40">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {selectedUser.user_name}
            </h2>
            <p className="text-indigo-700 font-medium mt-1">
              Total Offline Hours: {selectedUser.total_offline_hours}
            </p>
          </div>

          <button
            onClick={closeUserDetails}
            className="p-2 rounded-xl hover:bg-white/40 transition"
          >
            ✕
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-auto p-6 space-y-4">

        {/* TABLE WRAPPER */}
        <div className="w-full overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-white/50 whitespace-nowrap">
                {["Project", "Offline Hours", "Tracking ID"].map(h => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-sm font-semibold text-gray-700"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/30">
              {selectedUser.projects?.map((p, i) => {
                const isOpen = expandedProjectRow === i;

                return (
                  <React.Fragment key={i}>
                    {/* MAIN ROW */}
                    <tr
                      // onClick={() => toggleProjectRow(i)}
                      className="cursor-pointer hover:bg-white/50 transition whitespace-nowrap"
                    >
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {p.project_name}
                      </td>

                      <td className="px-5 py-4 font-mono text-gray-800">
                        {p.total_offline_hours}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600 flex justify-between items-center">
                        {p.traking_id || "—"}

                        {/* CHEVRON */}
                        {/* <span
                          className={`ml-3 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        >
                          ⌄
                        </span> */}
                      </td>
                    </tr>

                    {/* 🔽 NARRATION DROPDOWN */}
                    {/* {isOpen && (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 bg-white/40">
                          <div
                            className="
                              rounded-2xl
                              bg-white/80 backdrop-blur-lg
                              border border-white/40
                              p-5
                            "
                          >
                            <p className="text-sm font-semibold text-gray-700 mb-2">
                              Narration
                            </p>

                            <p className="text-sm text-gray-800 leading-relaxed">
                              {p.narration || "No narration provided."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )} */}
                  </React.Fragment>
                );
              })}

              {(!selectedUser.projects || selectedUser.projects.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-5 py-6 text-center text-gray-500">
                    No project data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  </div>
)}


      
{totalPages > 1 && (
  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 bg-white p-4 rounded-lg shadow-sm">
    <div className="text-sm text-gray-700">
      Showing {indexOfFirstItem + 1} to{" "}
      {Math.min(indexOfLastItem, filteredDataItems.length)} of{" "}
      {filteredDataItems.length} entries
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


