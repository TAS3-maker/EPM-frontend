import React, { useState, useEffect, useMemo } from 'react'; 
import { Calendar, ChevronDown } from 'lucide-react';
import { useLeave } from '../../../context/LeaveContext';
import { useParams } from 'react-router-dom';

const TotalLeaveCard = () => {
  const { id } = useParams();
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  
  const { leaves, fetchLeavesByUserId, loading } = useLeave();

  
  useEffect(() => {
    if (id) {
      console.log('📡 Fetching leaves for user:', id);
      fetchLeavesByUserId(parseInt(id));
    }
  }, [id]); 

 
  const safeLeaves = useMemo(() => {
    return Array.isArray(leaves) ? leaves : [];
  }, [leaves]);

  const filteredLeaves = useMemo(() => {
    if (safeLeaves.length === 0) return [];
    
    return safeLeaves.filter(leave => {
      const leaveStart = leave?.start_date;
      const leaveEnd = leave?.end_date;
      if (!leaveStart || !leaveEnd) return false;
      
      return leaveStart >= startDate && leaveEnd <= endDate;
    });
  }, [safeLeaves, startDate, endDate]);

  const counts = useMemo(() => {
    const leaveData = filteredLeaves.length > 0 ? filteredLeaves : safeLeaves;
    
    console.log('📊 Safe Leaves:', safeLeaves.length);
    console.log('📊 Filtered:', filteredLeaves.length);
    
    
    const pendingCount = Array.isArray(leaveData) 
      ? leaveData.filter(leave => leave?.status?.toLowerCase() === "pending").length 
      : 0;
    
    const approvedCount = Array.isArray(leaveData) 
      ? leaveData.filter(leave => leave?.status?.toLowerCase() === "approved").length 
      : 0;
    
    const rejectedCount = Array.isArray(leaveData) 
      ? leaveData.filter(leave => leave?.status?.toLowerCase() === "rejected").length 
      : 0;
    
    const totalCount = leaveData.length;
    
    console.log('✅ COUNTS:', { pendingCount, approvedCount, rejectedCount, totalCount });
    
    return { pendingCount, approvedCount, rejectedCount, totalCount };
  }, [filteredLeaves, safeLeaves]);

  const { pendingCount, approvedCount, rejectedCount, totalCount } = counts;

  const handleApplyDates = () => {
    console.log('📅 Filter applied:', startDate, 'to', endDate);
    setIsDateFilterOpen(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 animate-pulse h-64 w-full md:max-w-50%">
        <div className="h-12 bg-gray-200 rounded-t-xl"></div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-gray-100 rounded-xl"></div>
          <div className="h-24 bg-gray-100 rounded-xl"></div>
          <div className="h-24 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 transition-shadow hover:shadow-lg duration-300 w-full md:max-w-50% relative">
      
      <div className="px-5 py-2 flex items-center justify-between bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 rounded-t-xl">
        <h3 className="text-sm md:text-md font-semibold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4" />Total Leaves
        </h3>
        <div className="relative">
          <button 
            onClick={() => setIsDateFilterOpen(!isDateFilterOpen)} 
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg px-2 py-1 text-white/90 hover:text-white transition-all duration-200 group text-xs font-medium"
          >
            <span className="hidden sm:inline">{startDate} - {endDate}</span>
            <span className={`transition-transform ${isDateFilterOpen ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-3 h-3" />
            </span>
          </button>
          
          {isDateFilterOpen && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-2xl p-4 z-50">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 font-medium mb-1.5 block">Start Date</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-11 bg-white" 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium mb-1.5 block">End Date</label>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    min={startDate} 
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-11 bg-white" 
                  />
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <button 
                    onClick={handleApplyDates}
                    className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 text-sm font-medium"
                  >
                    Apply Dates
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      
      <div className="px-5 py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="group relative bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-1.02">
          <div className="flex flex-col justify-center items-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            <p className="text-xs text-gray-500">{pendingCount} {pendingCount === 1 ? 'leave' : 'leaves'}</p>
          </div>
        </div>
        
        <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-1.02">
          <div className="flex flex-col justify-center items-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Approved</p>
            <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
            <p className="text-xs text-gray-500">{approvedCount} {approvedCount === 1 ? 'leave' : 'leaves'}</p>
          </div>
        </div>
        
        <div className="group relative bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-1.02">
          <div className="flex flex-col justify-center items-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rejected</p>
            <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
            <p className="text-xs text-gray-500">{rejectedCount} {rejectedCount === 1 ? 'leave' : 'leaves'}</p>
          </div>
        </div>
      </div>
      
      
      <div className="px-5 py-2 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-b-xl">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-700 font-semibold">Total Leaves Applied</span>
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            {totalCount} {totalCount === 1 ? 'leave' : 'leaves'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TotalLeaveCard;

