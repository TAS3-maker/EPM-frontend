import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, CheckCircle, TrendingUp, TrendingDown, 
  Clock as ClockIcon, Loader2 
} from 'lucide-react';
import { useLeaveCredit } from '../../../context/LeaveCreditContext.jsx';
import { StatCardHeader } from "../../../components/CardsDashboard";

function DashboardCard08() {
  const { leaves, fetchLeaves, loading } = useLeaveCredit();
  const [currentLeave, setCurrentLeave] = useState(null);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  useEffect(() => {
    if (leaves && leaves.length > 0) {
      setCurrentLeave(leaves[0]);
    }
  }, [leaves]);

  if (loading || !currentLeave) {
    return (
      <div className="col-span-full xl:col-span-12 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-blue-200">
        <StatCardHeader 
          icon={Calendar} 
          title="My Leave Balance" 
          {/* tooltip="Your current leave credits and balance"  */}
        />
        <div className="pt-0 pb-6 sm:pb-8 md:pb-10">
          <div className="flex flex-col items-center justify-center space-y-4 py-16">
            <Loader2 className="h-14 w-14 animate-spin text-gray-500" />
            <span className="text-2xl font-semibold text-gray-600">Loading leave balance...</span>
          </div>
        </div>
      </div>
    );
  }

  const {
    paid_leaves = "0",           // First: Paid leaves (1.00)
    carry_forward_balance = 0,    // Then: Carry forward (3)
    total_deducted_hours = 0,     // Leaves taken (from total_deducted_hours)
    remaining_paid_leave_hours = 0, // Remaining hours
    leave_taken_hours = 0,
    
    deducted_days = 0,
    bunch_time = 0,
    bunch_payble_balance = "0",
    expected_working_hours = 0,
    expected_working_days,
    user: { name = "Employee" } = {}
  } = currentLeave;

  // Pure display - No calculations, API handles everything
  const paidDays = (paid_leaves || 0);
  const carryDays = (carry_forward_balance || 0);
  const totalLeavesTakenDays =deducted_days
  const daysLeft = (remaining_paid_leave_hours || 0) / 8.5;

  return (
    <div className="col-span-full xl:col-span-12 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-blue-200">
      
      <StatCardHeader 
        icon={Calendar} 
        title="My Leave Balance Per Month" 
        tooltip="Your current leave credits and balance" 
      />

      <div className="pt-0 pb-6 sm:pb-8 md:pb-10">
        
        {/* Stats Grid - User Friendly Order */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-6 mt-2">

          {/* 4th: Days Left */}
          <div className={`p-4 rounded-xl hover:shadow-md transition-all border-2 ${
            daysLeft <= 0 ? 'border-red-300 bg-red-50' : 
            daysLeft <= 3 ? 'border-orange-300 bg-orange-50' : 
            'border-green-300 bg-green-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${
                daysLeft <= 0 ? 'bg-red-100' : 
                daysLeft <= 3 ? 'bg-orange-100' : 
                'bg-green-100'
              }`}>
                <ClockIcon className={`h-6 w-6 ${
                  daysLeft <= 0 ? 'text-red-600' : 
                  daysLeft <= 3 ? 'text-orange-600' : 
                  'text-green-600'
                }`} />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Paid Leaves Left</p>
                <p className={`text-xl font-bold mt-1 ${
                  daysLeft <= 0 ? 'text-red-600' : 
                  daysLeft <= 3 ? 'text-orange-600' : 
                  'text-green-600'
                }`}>
                  {daysLeft.toFixed(2)} <span className="text-sm">days</span>
                </p>
              </div>
            </div>
             <p className="text-sm text-gray-500 mt-2">{remaining_paid_leave_hours}h total</p>
          </div>


          {/* 3rd: Leaves Taken (total_deducted_hours) */}
          <div className={`p-4 rounded-xl hover:shadow-md transition-all border-2 ${
            totalLeavesTakenDays > 0 ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${
                totalLeavesTakenDays > 0 ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <TrendingDown className={`h-6 w-6 ${
                  totalLeavesTakenDays > 0 ? 'text-red-600' : 'text-gray-500'
                }`} />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Leaves Taken</p>
                <p className={`text-xl font-bold mt-1 ${
                  totalLeavesTakenDays > 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {totalLeavesTakenDays} <span className="text-sm">days</span>
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{total_deducted_hours}h total</p>
          </div>

          
          {/* 1st: Paid Leaves */}
          <div className="group p-4 rounded-xl hover:shadow-md transition-all bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Paid Leaves</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">
                  {paidDays} <span className="text-sm">days</span>
                </p>
              </div>
            </div>
          </div>

          {/* 2nd: Carry Forward */}
          <div className="group p-4 rounded-xl hover:shadow-md transition-all bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-blue-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Carry Forward</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {carryDays} <span className="text-sm">days</span>
                </p>
              </div>
            </div>
          </div>

          

          
        </div>

        {/* Bottom Details - Clean & Simple */}
        <div className="px-4 sm:px-6 mt-6 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              <span>Total Used: <span className="font-semibold text-gray-900">{total_deducted_hours}h</span></span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-gray-400" />
              <span>Leave Cycle: <span className="font-semibold text-blue-600">{bunch_time} months</span></span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
              <span>Total Working days <span className="font-semibold text-gray-900">{expected_working_days}d</span></span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            {name} • March 2026
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardCard08;
