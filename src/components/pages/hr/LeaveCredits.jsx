import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Edit3, Save, X, Calendar, Clock, CheckCircle, AlertCircle, 
  TrendingUp, TrendingDown, UserCheck, Clock as ClockIcon 
} from 'lucide-react';
import { SectionHeader } from '../../components/SectionHeader';
import { useLeaveCredit } from '../../context/LeaveCreditContext';

export const LeaveCredits = () => {
  const { leaves: leaveCredits, fetchLeaves, updateLeave, loading } = useLeaveCredit();
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleEdit = (leave) => {
    setEditingId(leave.id);
    setEditData({ ...leave });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSave = async (id) => {
    try {
      await updateLeave(id, editData);
      setEditingId(null);
      setEditData({});
      fetchLeaves();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const filteredLeaves = leaveCredits.filter(leave => 
    leave.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leave.employment_status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString('en-IN') : 'N/A';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'appointed': return 'bg-green-100 text-green-800';
      case 'provisional': return 'bg-yellow-100 text-yellow-800';
      case 'notice': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeaveBalanceColor = (balance) => {
    if (balance <= 0) return 'text-red-600 font-semibold';
    if (balance <= 3) return 'text-orange-600 font-semibold';
    return 'text-green-600 font-semibold';
  };

  const getAttendanceColor = (worked, expected) => {
    const percentage = expected > 0 ? (worked / expected) * 100 : 0;
    if (percentage >= 95) return 'text-green-600';
    if (percentage >= 85) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={BarChart}
        title="Leave Credits Management"
        subtitle="Complete HR dashboard for employee leave tracking & management"
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by name or status..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredLeaves.length} of {leaveCredits.length} employees
          </div>
        </div>
      </div>

      {/* Comprehensive Leave Credits Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-[3000px] table-fixed">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="w-16 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sticky left-0 bg-blue-50 z-10">#</th>
                <th className="w-48 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sticky left-16 bg-blue-50 z-10">Employee</th>
                <th className="w-32 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="w-32 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Joining</th>
                <th className="w-28 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Month/Year</th>
                <th className="w-32 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Paid Leaves</th>
                <th className="w-32 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Leaves Taken</th>
                <th className="w-36 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Remaining Leave (Hrs)</th>
                <th className="w-32 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Notice Period</th>
                <th className="w-32 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Notice Start date</th>
                
                {/* Probation Section */}
                <th className="w-28 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Prov. Leave Limit</th>
                <th className="w-32 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Prov. Leave Taken</th>
                <th className="w-36 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Prov. Days</th>
                <th className="w-40 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Prov. Extended months</th>
                
                {/* Work Tracking */}
                <th className="w-32 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Expected Days</th>
                <th className="w-36 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Expected Hrs</th>
                <th className="w-32 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Worked Hrs</th>
                <th className="w-32 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Leave Hrs</th>
                
                {/* Leave Details */}
                <th className="w-24 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Paid</th>
                <th className="w-28 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Unpaid</th>
                <th className="w-28 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Carry Forward</th>
                
                {/* Bunch & Misc */}
                <th className="w-28 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bunch Time(Months)</th>
                <th className="w-36 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"> Balance</th>
                <th className="w-20 px-3 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLeaves.map((leave, index) => (
                <tr key={leave.id} className="hover:bg-gray-50 transition-colors group">
                  {/* Serial Number - Sticky */}
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-200">
                    {index + 1}
                  </td>

                  {/* Employee - Sticky */}
                  <td className="px-3 py-4 sticky left-16 bg-white z-10 border-r border-gray-200">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                        {leave.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate" title={leave.user.name}>
                          {leave.user.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Employment Status */}
                  <td className="px-3 py-4 whitespace-nowrap">
                    {editingId === leave.id ? (
                      <select
                        value={editData.employment_status || ''}
                        onChange={(e) => setEditData({ ...editData, employment_status: e.target.value })}
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 w-full"
                      >
                        <option value="appointed">Appointed</option>
                        <option value="provisional">Provisional</option>
                        <option value="notice">Notice</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(leave.employment_status)}`}>
                        {leave.employment_status}
                      </span>
                    )}
                  </td>

                  {/* Joining Date */}
                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                    {editingId === leave.id ? (
                      <input
                        type="date"
                        value={editData.joining_date ? new Date(editData.joining_date).toISOString().split('T')[0] : ''}
                        onChange={(e) => setEditData({ ...editData, joining_date: e.target.value })}
                        className="text-xs px-1 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 w-full"
                      />
                    ) : (
                      formatDate(leave.joining_date)
                    )}
                  </td>

                  {/* Month/Year */}
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {leave.month}/{leave.year}
                  </td>

                  {/* Paid Leaves */}
                  <td className="px-3 py-4 whitespace-nowrap">
                    {editingId === leave.id ? (
                      <input
                        type="number"
                        value={editData.paid_leaves || 0}
                        onChange={(e) => setEditData({ ...editData, paid_leaves: parseInt(e.target.value) || 0 })}
                        className="text-xs px-1 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 w-full"
                        min="0"
                      />
                    ) : (
                      <span className={`text-sm font-semibold ${getLeaveBalanceColor(leave.paid_leaves)}`}>
                        {leave.paid_leaves}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    {editingId === leave.id ? (
                      <input
                        type="number"
                        value={editData.leave_taken || 0}
                        onChange={(e) => setEditData({ ...editData, leave_taken: parseInt(e.target.value) || 0 })}
                        className="text-xs px-1 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 w-full"
                        min="0"
                      />
                    ) : (
                      <span className={`text-sm font-semibold ${getLeaveBalanceColor(leave.leave_taken)}`}>
                        {leave.leave_taken}
                      </span>
                    )}
                  </td>

                  {/* Remaining Hours */}
                  <td className="px-3 py-4 whitespace-nowrap">
                    {editingId === leave.id ? (
                      <input
                        type="number"
                        step="0.5"
                        value={editData.remaining_paid_leave_hours || 0}
                        onChange={(e) => setEditData({ ...editData, remaining_paid_leave_hours: parseFloat(e.target.value) || 0 })}
                        className="text-xs px-1 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 w-full"
                        min="0"
                      />
                    ) : (
                      <span className={`text-sm font-semibold ${getLeaveBalanceColor(leave.remaining_paid_leave_hours)}`}>
                        {leave.remaining_paid_leave_hours?.toFixed(1)}h
                      </span>
                    )}
                  </td>

                  {/* Notice Period */}
                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                    {editingId === leave.id ? (
                      <input
                        type="number"
                        value={editData.notice_period_days || 0}
                        onChange={(e) => setEditData({ ...editData, notice_period_days: parseInt(e.target.value) || 0 })}
                        className="text-xs px-1 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 w-full"
                        min="0"
                      />
                    ) : (
                      `${leave.notice_period_days || 0}d`
                    )}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                    {editingId === leave.id ? (
                      <input
                        type="number"
                        value={editData.notice_start_date || 0}
                        onChange={(e) => setEditData({ ...editData, notice_start_date: parseInt(e.target.value) || 0 })}
                        className="text-xs px-1 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 w-full"
                        min="0"
                      />
                    ) : (
                      `${leave.notice_start_date || 0}`
                    )}
                  </td>
                  

                  {/* Provisional Leave Limit */}
                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                    {editingId === leave.id ? (
                      <input
                        type="number"
                        value={editData.provisional_leave_limit || 0}
                        onChange={(e) => setEditData({ ...editData, provisional_leave_limit: parseInt(e.target.value) || 0 })}
                        className="text-xs px-1 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 w-full"
                        min="0"
                      />
                    ) : (
                      leave.provisional_leave_limit || 0
                    )}
                  </td>

                  {/* Provisional Leave Taken */}
                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                    {editingId === leave.id ? (
                      <input
                        type="number"
                        value={editData.provisional_leave_taken || 0}
                        onChange={(e) => setEditData({ ...editData, provisional_leave_taken: parseInt(e.target.value) || 0 })}
                        className="text-xs px-1 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 w-full"
                        min="0"
                      />
                    ) : (
                      leave.provisional_leave_taken || 0
                    )}
                  </td>

                  {/* Provisional Days */}
                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                    {editingId === leave.id ? (
                      <input
                        type="number"
                        value={editData.provisional_days || 0}
                        onChange={(e) => setEditData({ ...editData, provisional_days: parseInt(e.target.value) || 0 })}
                        className="text-xs px-1 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 w-full"
                        min="0"
                      />
                    ) : (
                      leave.provisional_days || 0
                    )}
                  </td>

                  {/* Provisional Extended Months */}
                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                    {editingId === leave.id ? (
                      <input
                        type="number"
                        value={editData.provisional_extended_months || 0}
                        onChange={(e) => setEditData({ ...editData, provisional_extended_months: parseInt(e.target.value) || 0 })}
                        className="text-xs px-1 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 w-full"
                        min="0"
                      />
                    ) : (
                      leave.provisional_extended_months || 0
                    )}
                  </td>

                  {/* Expected Working Days */}
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {leave.expected_working_days || 0}
                  </td>

                  {/* Expected Working Hours */}
                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                    {leave.expected_working_hours || 0}h
                  </td>
                  {/* Worked Hours */}
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getAttendanceColor(leave.worked_hours, leave.expected_working_hours)}`}>
                      {leave.worked_hours || 0}h
                    </span>
                  </td>


                  {/* Leave Taken Hours */}
                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                    {leave.leave_taken_hours || 0}h
                  </td>

                  {/* Paid Leaves Count */}
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {leave.paid || 0}
                  </td>

                  {/* Unpaid Leaves Count */}
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                    {leave.unpaid || 0}
                  </td>

                  {/* Carry Forward Balance */}
                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                    {leave.carry_forward_balance || 0}
                  </td>

                  {/* Bunch Time */}
                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                    {leave.bunch_time || 0}
                  </td>

                  {/* Bunch Payable Balance */}
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {leave.bunch_payble_balance || 0}
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-4 whitespace-nowrap text-right">
                    {editingId === leave.id ? (
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => handleSave(leave.id)}
                          disabled={loading}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-100 rounded transition-colors"
                          title="Save Changes"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(leave)}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit Leave Credits"
                      >
                        <Edit3 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty & Loading States */}
        {filteredLeaves.length === 0 && !loading && (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No leave credits found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Loading leave credits...</span>
          </div>
        )}
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{leaveCredits.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Paid Leaves</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(leaveCredits.reduce((sum, l) => sum + (l.paid_leaves || 0), 0) / leaveCredits.length) || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <ClockIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Balance Hrs</p>
              <p className="text-2xl font-bold text-gray-900">
                {leaveCredits.reduce((sum, l) => sum + (l.remaining_paid_leave_hours || 0), 0).toFixed(1)}h
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(leaveCredits.reduce((sum, l) => sum + ((l.worked_hours || 0) / Math.max((l.expected_working_hours || 1), 1) * 100), 0) / leaveCredits.length)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveCredits;
