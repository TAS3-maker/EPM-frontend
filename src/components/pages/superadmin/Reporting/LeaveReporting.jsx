import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SectionHeader } from "../../../components/SectionHeader";
import { 
  Loader2, User, CheckCircle, XCircle, Calendar, 
  BarChart, Users, FileText, Eye, ChevronRight, X
} from "lucide-react";
import { 
  ClearButton, TodayButton, YesterdayButton, WeeklyButton,
  CustomButton, CancelButton 
} from "../../../AllButtons/AllButtons";
import { useLeave } from "../../../context/LeaveContext";

const LeaveReporting = () => {
  const { userLeaves: rawData, attendenceOfAllUsers, loading: isLoading } = useLeave();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const token = localStorage.getItem("userToken");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);

  useEffect(() => {
    if (!startDate && !endDate && token) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6); // Last 7 days
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    }
  }, []);

  useEffect(() => {
    if (token && startDate && endDate) {
      attendenceOfAllUsers(startDate, endDate);
    }
  }, [startDate, endDate, token]);

  const filteredUsers = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    return rawData.filter(user => 
      user.user_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rawData, searchQuery]);

  const getUserSummary = useCallback((user) => {
    const attendance = user.attendance_data || {};
    const totalDays = Object.keys(attendance).length;
    const presentDays = Object.values(attendance).filter(day => day.present === 1).length;
    const leaveDays = totalDays - presentDays;
    
    return {
      totalDays,
      presentDays,
      leaveDays,
      absenteeism: totalDays > 0 ? ((leaveDays / totalDays) * 100).toFixed(1) : 0
    };
  }, []);

  const getFilteredAttendance = (attendance) => {
    if (!startDate || !endDate) return attendance;
    
    const filtered = {};
    Object.keys(attendance).forEach(date => {
      if (date >= startDate && date <= endDate) {
        filtered[date] = attendance[date];
      }
    });
    return filtered;
  };

  const setTodayFilter = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  };

  const setYesterdayFilter = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    setStartDate(yesterdayStr);
    setEndDate(yesterdayStr);
  };

  const setWeeklyFilter = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");

  };

  const openUserModal = (user) => {
    setSelectedUser({ ...user, filteredAttendance: getFilteredAttendance(user.attendance_data) });
    setShowModal(true);
  };

  const getLeaveIcon = (present, leaveType) => {
    if (present === 0 && leaveType) return <FileText className="w-4 h-4 text-orange-500" />;
    if (present === 0) return <XCircle className="w-4 h-4 text-red-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getLeaveStatus = (present, leaveType) => {
    if (present === 0 && leaveType) return `${leaveType}`;
    if (present === 0) return "Absent";
    return "Present";
  };

  return (
    <div className='w-full space-y-6 p-6'>
      <SectionHeader
        icon={BarChart}
        title="Leave Reporting"
        subtitle={`${filteredUsers.length} users found`}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white shadow-md p-6 rounded-xl border">
        <div className="flex flex-wrap items-center gap-2">
          <TodayButton onClick={setTodayFilter} />
          <YesterdayButton onClick={setYesterdayFilter} />
          <WeeklyButton onClick={setWeeklyFilter} />
          {!isCustomMode ? (
            <CustomButton onClick={() => setIsCustomMode(true)} />
          ) : (
            <>
              <input
                type="date"
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate || undefined}
              />
              <input
                type="date"
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
              />
              <ClearButton onClick={clearFilters} />
              <CancelButton onClick={() => {
                setIsCustomMode(false);
                setStartDate("");
                setEndDate("");
              }} />
            </>
          )}
        </div>

        <div className="flex-1 max-w-md">
          <div className="flex items-center border border-gray-300 px-3 py-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
            <input
              type="text"
              className="w-full outline-none bg-transparent"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="text-sm text-gray-600 font-medium">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
          {startDate && endDate && ` (${startDate} to ${endDate})`}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Users List */}
      {!isLoading && (
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No users found matching your search</p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const summary = getUserSummary(user);
              return (
                <div
                  key={user.user_id}
                  className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-gray-100 cursor-pointer group"
                  onClick={() => openUserModal(user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {user.user_name}
                        </h3>
                        <p className="text-sm text-gray-500">ID: {user.user_id}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right space-y-1 hidden sm:block">
                      <div className="text-2xl font-bold text-gray-900">{summary.leaveDays}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Leaves</div>
                    </div>

                    {/* Absenteeism Badge */}
                    <div className="ml-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        summary.absenteeism > 20 ? 'bg-red-100 text-red-700' :
                        summary.absenteeism > 10 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {summary.absenteeism}% Absent
                      </span>
                    </div>

                    {/* View Icon */}
                    <div className="ml-4 p-2 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-all">
                      <Eye className="w-5 h-5 text-blue-600 group-hover:rotate-12 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl max-h-[90vh] w-full max-w-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedUser.user_name}</h2>
                    <p className="text-blue-100">ID: {selectedUser.user_id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Leave Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(selectedUser.filteredAttendance).map(([date, dayData]) => (
                      <tr key={date} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getLeaveIcon(dayData.present, dayData.leave_type)}
                            <span className="font-medium">
                              {getLeaveStatus(dayData.present, dayData.leave_type)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {dayData.leave_type || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                          {dayData.reason || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Showing {Object.keys(selectedUser.filteredAttendance).length} days
                  {startDate && endDate && ` (${startDate} to ${endDate})`}
                </span>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveReporting;
