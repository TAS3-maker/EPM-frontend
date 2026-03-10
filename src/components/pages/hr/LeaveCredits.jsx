import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Edit3, Save, X, Calendar, Clock, CheckCircle, AlertCircle,
  TrendingUp, TrendingDown, UserCheck, Clock as ClockIcon
} from 'lucide-react';
import { SectionHeader } from '../../components/SectionHeader';
import { useLeaveCredit } from '../../context/LeaveCreditContext';
import { useAlert } from "../../context/AlertContext";
import { usePermissions } from "../../context/PermissionContext.jsx";

export const LeaveCredits = () => {
  const { leaves: leaveCredits, fetchLeaves, updateLeave, loading ,resetLeave} = useLeaveCredit();
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
const { showAlert } = useAlert();
  const {permissions}=usePermissions()

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

const employeePermission = permissions?.permissions?.[0]?.leave_credit;
  const canAddEmployee = employeePermission === "2"


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

  // const handleModalSave = async () => {
  //   try {
  //     await updateLeave(selectedLeave.id, editData);
  //     setIsModalOpen(false);
  //     setSelectedLeave(null);
  //     fetchLeaves();
  //   } catch (error) {
  //     console.error("Update failed:", error);
  //   }
  // };


  const handleModalSave = async () => {
  try {
    const payload = {
      employment_status: editData.employment_status,
      joining_date: editData.joining_date,
      paid_leaves: Number(editData.paid_leaves) || 0,
      notice_period_days: Number(editData.notice_period_days) || 0,
      notice_start_date: editData.notice_start_date,
      notice_end_date: editData.notice_end_date,
      provisional_leave_limit: Number(editData.provisional_leave_limit) || 0,
      provisional_days: Number(editData.provisional_days) || 0,
      provisional_extended_months: Number(editData.provisional_extended_months) || 0,
      bunch_time: Number(editData.bunch_time) || 0,
    };

    await updateLeave(selectedLeave.id, payload);

    showAlert({
      variant: "success",
      title: "Success",
      message: "Leave updated successfully",
    });

    fetchLeaves();
    setIsModalOpen(false);
    setSelectedLeave(null);

  } catch (error) {
    showAlert({
      variant: "error",
      title: "Error",
      message: "Failed to update leave",
    });
  }
};


const handleReset=async()=>{

try {
  await resetLeave()
  
} catch (error) {
  showAlert({
    variant:"error",
    title:"error",
    message:"Failed to reset leaves"
  })
}


}




  return (
    <div className="space-y-3">
      <SectionHeader
        icon={BarChart}
        title="Leave Credits Management"
        subtitle="Complete HR dashboard for employee leave tracking & management"
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sticky top-0 z-40">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by name or status..."
              className="w-full pl-10 pr-4 py-2 border text-[13px] border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
      
         <button
                  onClick={handleReset}
                  className="px-4 py-2 mt-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Reset to current month
                </button>
        </div>
      </div>

      {/* Comprehensive Leave Credits Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-150px)] overflow-y-auto">
          <table className="w-[3000px] table-fixed">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 sticky top-0 z-30">
              <tr>
                <th className="w-16 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sticky left-0 bg-blue-50 z-10">#</th>
                <th className="w-48 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sticky left-16 bg-blue-50 z-10">Employee</th>
                <th className="w-32 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="w-32 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Joining</th>
                <th className="w-28 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Month/Year</th>
                <th className="w-32 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Paid Leaves</th>
                <th className="w-32 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Leaves Taken</th>
                <th className="w-36 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Remaining Leave (Hrs)</th>
                   {/* Leave Details */}
                <th className="w-24 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Paid</th>
                <th className="w-28 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Unpaid</th>
                <th className="w-28 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Carry Forward</th>
                <th className="w-32 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Notice Period</th>
                <th className="w-32 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Notice Start date</th>
                <th className="w-32 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Notice End date</th>

                {/* Probation Section */}
                <th className="w-28 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Prov. Leave Limit</th>
                <th className="w-32 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Prov. Leave Taken</th>
                <th className="w-36 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Prov. Days</th>

                <th className="w-36 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Expected Hrs</th>
                <th className="w-32 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Worked Hrs</th>
                <th className="w-32 px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Leave Hrs</th>

             

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
                      <div className="h-[30px] w-[30px] bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                        {leave.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3 min-w-0">
                        <div className="text-xs font-medium text-gray-900 truncate" title={leave.user.name}>
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
                  <td className="px-3 py-4 whitespace-nowrap text-xs">
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
                  <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-900">
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
                        value={editData.deducted_days || 0}
                        onChange={(e) => setEditData({ ...editData, deducted_days: parseInt(e.target.value) || 0 })}
                        className="text-xs px-1 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 w-full"
                        min="0"
                      />
                    ) : (
                      <span className={`text-xs font-semibold ${getLeaveBalanceColor(leave.deducted_days || 0)}`}>
                        {leave.deducted_days || 0}
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
                      <span className={`text-xs font-semibold ${getLeaveBalanceColor(leave.remaining_paid_leave_hours)}`}>
                        {leave.remaining_paid_leave_hours?.toFixed(1)}h
                      </span>
                    )}
                  </td>
                  
                  {/* Paid Leaves Count */}
                  <td className="px-3 py-4 whitespace-nowrap text-xs font-medium text-green-600">
                    {leave.paid_hours || 0}h
                  </td>

                  {/* Unpaid Leaves Count */}
                  <td className="px-3 py-4 whitespace-nowrap text-xs font-medium text-red-600">
                    {leave.unpaid_hours || 0}h
                  </td>

                  {/* Carry Forward Balance */}
                  <td className="px-3 py-4 whitespace-nowrap text-xs">
                    {leave.carry_forward_balance || 0}
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
                  <td className="px-3 py-4 whitespace-nowrap text-xs">
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
                  <td className="px-3 py-4 whitespace-nowrap text-xs">
                    {editingId === leave.id ? (
                      <input
                        type="number"
                        value={editData.notice_end_date || 0}
                        onChange={(e) => setEditData({ ...editData, notice_end_date: parseInt(e.target.value) || 0 })}
                        className="text-xs px-1 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 w-full"
                        min="0"
                      />
                    ) : (
                      `${leave.notice_end_date || 0}`
                    )}
                  </td>


                  {/* Provisional Leave Limit */}
                  <td className="px-3 py-4 whitespace-nowrap text-xs">
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
                  <td className="px-3 py-4 whitespace-nowrap text-xs">
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
                  <td className="px-3 py-4 whitespace-nowrap text-xs">
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

              
                  {/* Expected Working Hours */}
                  <td className="px-3 py-4 whitespace-nowrap text-xs">
                    {leave.expected_working_hours || 0}h
                  </td>
                  {/* Worked Hours */}
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getAttendanceColor(leave.worked_hours, leave.expected_working_hours)}`}>
                      {leave.worked_hours || 0}h
                    </span>
                  </td>


                  {/* Leave Taken Hours */}
                  <td className="px-3 py-4 whitespace-nowrap text-xs">
                    {leave.total_deducted_hours || 0}h
                  </td>


                  {/* Bunch Time */}
                  <td className="px-3 py-4 whitespace-nowrap text-xs">
                    {leave.bunch_time || 0}
                  </td>

                  {/* Bunch Payable Balance */}
                  <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-900">
                    {leave.bunch_payble_balance || 0}
                  </td>

                  {/* Actions */}
                  {canAddEmployee&&(
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
                        onClick={() => {
                          setSelectedLeave(leave);
                          setEditData({ ...leave });
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit Leave Credits"
                      >
                        <Edit3 size={16} />
                      </button>
                      
                    )}
                  </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
           onClick={() => setIsModalOpen(false)}
          >
            <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg p-6 max-h-[90vh] overflow-y-auto"
             onClick={(e) => e.stopPropagation()}
            >

              <h2 className="text-lg font-semibold mb-6">Edit Leave Credits</h2>

              <div className="grid grid-cols-2 gap-4">

                {/* Employment Status */}
                <div>
                  <label className="text-sm font-medium">Employment Status</label>
                  <select
                    value={editData.employment_status || ""}
                    onChange={(e) => setEditData({ ...editData, employment_status: e.target.value })}
                    className="w-full mt-1 border px-3 py-2 rounded"
                  >
                    <option value="appointed">Appointed</option>
                    <option value="provisional">Provisional</option>
                    <option value="notice">Notice</option>
                  </select>
                </div>

                {/* Joining Date */}
                <div>
                  <label className="text-sm font-medium">Joining Date</label>
                  <input
                    type="date"
                    value={editData.joining_date ? new Date(editData.joining_date).toISOString().split("T")[0] : ""}
                    onChange={(e) => setEditData({ ...editData, joining_date: e.target.value })}
                    className="w-full mt-1 border px-3 py-2 rounded"
                  />
                </div>

                {/* Paid Leaves */}
                <div>
                  <label className="text-sm font-medium">Paid Leaves</label>
                  <input
                    type="number"
                    value={editData.paid_leaves || 0}
                    onChange={(e) => setEditData({ ...editData, paid_leaves: parseInt(e.target.value) || 0 })}
                    className="w-full mt-1 border px-3 py-2 rounded"
                  />
                </div>

                {/* Notice Period */}
                <div>
                  <label className="text-sm font-medium">Notice Period (Days)</label>
                  <input
                    type="number"
                    value={editData.notice_period_days || 0}
                    onChange={(e) => setEditData({ ...editData, notice_period_days: parseInt(e.target.value) || 0 })}
                    className="w-full mt-1 border px-3 py-2 rounded"
                  />
                </div>

                {/* Notice Start Date */}
                <div>
                  <label className="text-sm font-medium">Notice Start Date</label>
                  <input
                    type="date"
                    value={editData.notice_start_date ? new Date(editData.notice_start_date).toISOString().split("T")[0] : ""}
                    onChange={(e) => setEditData({ ...editData, notice_start_date: e.target.value })}
                    className="w-full mt-1 border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Notice End Date</label>
                  <input
                    type="date"
                    value={editData.notice_end_date ? new Date(editData.notice_end_date).toISOString().split("T")[0] : ""}
                    onChange={(e) => setEditData({ ...editData, notice_end_date: e.target.value })}
                    className="w-full mt-1 border px-3 py-2 rounded"
                  />
                </div>

                {/* Provisional Leave Limit */}
                <div>
                  <label className="text-sm font-medium">Prov. Leave Limit</label>
                  <input
                    type="number"
                    value={editData.provisional_leave_limit || 0}
                    onChange={(e) => setEditData({ ...editData, provisional_leave_limit: parseInt(e.target.value) || 0 })}
                    className="w-full mt-1 border px-3 py-2 rounded"
                  />
                </div>

                {/* Provisional Days */}
                <div>
                  <label className="text-sm font-medium">Prov. Days</label>
                  <input
                    type="number"
                    value={editData.provisional_days || 0}
                    onChange={(e) => setEditData({ ...editData, provisional_days: parseInt(e.target.value) || 0 })}
                    className="w-full mt-1 border px-3 py-2 rounded"
                  />
                </div>

                {/* Provisional Extended Months */}
                <div>
                  <label className="text-sm font-medium">Prov. Extended Months</label>
                  <input
                    type="number"
                    value={editData.provisional_extended_months || 0}
                    onChange={(e) => setEditData({ ...editData, provisional_extended_months: parseInt(e.target.value) || 0 })}
                    className="w-full mt-1 border px-3 py-2 rounded"
                  />
                </div>

                {/* Bunch Time */}
                <div>
                  <label className="text-sm font-medium">Bunch Time (Months)</label>
                  <input
                    type="number"
                    value={editData.bunch_time || 0}
                    onChange={(e) => setEditData({ ...editData, bunch_time: parseInt(e.target.value) || 0 })}
                    className="w-full mt-1 border px-3 py-2 rounded"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleModalSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
               
              </div>

            </div>
          </div>
        )}



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

      {/* Key Metrics Summary
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
      </div> */}
    </div>
  );
};

export default LeaveCredits;
