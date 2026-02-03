import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useParams,useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Clock, ChevronDown, Calendar, CheckCircle, XCircle, Loader2, 
  BarChart, Search, Filter 
} from 'lucide-react';
import { API_URL } from '../../../utils/ApiConfig';
import { SectionHeader } from '../../../components/SectionHeader';
import { 
  TodayButton, YesterdayButton, WeeklyButton, CustomButton, 
  ClearButton, CancelButton, ExportButton 
} from "../../../AllButtons/AllButtons";

const timeToMinutes = (time = '00:00') => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const addTimes = (times = []) => {
  let totalMinutes = 0;
  times.forEach((time) => {
    if (!time) return;
    totalMinutes += timeToMinutes(time);
  });
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
};

const getTodayDate = () => new Date().toISOString().split('T')[0];
const getPercentage = (value, total) => (!total || total === 0 ? 0 : Math.round((value / total) * 100));

// Enhanced COLOR_MAP with icons and filter types
const COLOR_MAP = {
  blue: { 
    bg: 'from-blue-50 to-indigo-50 border-blue-200 ring-blue-500/30', 
    text: 'text-blue-700', 
    bar: 'from-blue-500 to-indigo-500',

    filterType: 'all'
  },
  green: { 
    bg: 'from-emerald-50 to-green-50 border-emerald-200 ring-emerald-500/30', 
    text: 'text-emerald-700', 
    bar: 'from-emerald-500 to-green-500',

    filterType: 'Billable'
  },
  purple: { 
    bg: 'from-purple-50 to-violet-50 border-purple-200 ring-purple-500/30', 
    text: 'text-purple-700', 
    bar: 'from-purple-500 to-violet-500',
  
    filterType: 'In-House'
  },
  gray: { 
    bg: 'from-gray-50 to-slate-50 border-gray-200 ring-gray-400/30', 
    text: 'text-gray-700', 
    bar: 'from-gray-400 to-slate-500',
   
    filterType: 'No Work'
  },
  orange: { 
    bg: 'from-orange-50 to-amber-50 border-orange-200 ring-orange-500/30', 
    text: 'text-orange-700', 
    bar: 'from-orange-500 to-amber-500',

    filterType: 'Offline'
  },
  yellow: { 
    bg: 'from-yellow-50 to-amber-100 border-yellow-200 ring-yellow-500/30', 
    text: 'text-yellow-800', 
    bar: 'from-yellow-400 to-amber-400',
      filterType: 'Unfilled'
  },
  red: { 
    bg: 'from-rose-50 to-red-50 border-rose-200 ring-red-500/30', 
    text: 'text-rose-700', 
    bar: 'from-rose-500 to-red-500',
   
    filterType: 'leave'
  },
  amber: { 
    bg: 'from-amber-50 to-orange-50 border-amber-200 ring-amber-500/30', 
    text: 'text-amber-800', 
    bar: 'from-amber-400 to-orange-400',
  
    filterType: 'pending'
  },
};

const HourCard = ({ title, value, percentage, color, isActive, onClick, count = 0 }) => {
  const c = COLOR_MAP[color];
  const isCount = !value.includes(':');
  
  return (
    <div 
      className={`group relative bg-gradient-to-br ${c.bg} p-4 rounded-2xl shadow-lg border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden ${
        isActive ? 'ring-4 shadow-2xl scale-[1.02]' : 'hover:scale-[1.02]'
      }`}
      onClick={onClick}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent animate-pulse" />
      )}
      

      
      {/* Value */}
      <div className={`text-xl font-bold ${c.text} mb-1 drop-shadow-sm`}>
        {isCount ? value : value}
        {isCount && count > 0 && (
          <span className="text-[12px] font-normal ml-1">({count})</span>
        )}
      </div>
      
      {/* Title */}
      <div className="text-[12px] uppercase tracking-wider font-medium text-gray-600 mb-3">{title}</div>
      
      {/* Progress Bar */}
      {!isCount && (
        <>
          <div className="w-full bg-white/50 backdrop-blur-sm rounded-full h-2 mb-2 overflow-hidden">
            <div 
              className={`bg-gradient-to-r ${c.bar} h-2 rounded-full shadow-sm transition-all duration-700 ease-out group-hover:brightness-110`}
              style={{ width: `${percentage || 0}%` }}
            />
          </div>
          <div className={`text-xs font-bold ${c.text} drop-shadow-sm`}>
            {percentage || 0}%
          </div>
        </>
      )}
      
      {/* Filter indicator */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Filter className={`w-4 h-4 ${c.text}`} />
      </div>
    </div>
  );
};

const UserSheetReportingSub = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const userToken = localStorage.getItem('userToken');
  
  const urlStartDate = searchParams.get('start_date');
  const urlEndDate = searchParams.get('end_date');
  const navigate = useNavigate();
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeFilter, setActiveFilter] = useState('all'); // New filter state
  
  const [loading, setLoading] = useState(true);
  const [rawHoursData, setRawHoursData] = useState(null);
  const [dayDetailModalOpen, setDayDetailModalOpen] = useState(false);
  const [selectedDayDetails, setSelectedDayDetails] = useState(null);

  // Activity hours (unfiltered for cards)
  const activityHours = useMemo(() => {
    if (!rawHoursData?.activities) {
      return {
        billable: '00:00',
        inHouse: '00:00', 
        noWork: '00:00',
        offline: '00:00',
        unfilled: '00:00'
      };
    }

    return {
      billable: rawHoursData.activities.Billable || '00:00',
      inHouse: rawHoursData.activities['In-House'] || '00:00',
      noWork: rawHoursData.activities['No Work'] || '00:00',
      offline: rawHoursData.activities.Offline || '00:00',
      unfilled: rawHoursData.activities.Unfilled || '00:00'
    };
  }, [rawHoursData?.activities]);

  const totalActivityMinutes = useMemo(() => {
    return timeToMinutes(activityHours.billable) + 
           timeToMinutes(activityHours.inHouse) + 
           timeToMinutes(activityHours.noWork) + 
           timeToMinutes(activityHours.offline) + 
           timeToMinutes(activityHours.unfilled);
  }, [activityHours]);

  const totalHours = useMemo(() => {
    return addTimes([
      activityHours.billable, 
      activityHours.inHouse, 
      activityHours.noWork, 
      activityHours.offline, 
      activityHours.unfilled,
      rawHoursData?.leave || '00:00'
    ]);
  }, [activityHours, rawHoursData?.leave]);

  const hourPercentages = useMemo(() => ({
    billable: getPercentage(timeToMinutes(activityHours.billable), totalActivityMinutes),
    inHouse: getPercentage(timeToMinutes(activityHours.inHouse), totalActivityMinutes),
    noWork: getPercentage(timeToMinutes(activityHours.noWork), totalActivityMinutes),
    offline: getPercentage(timeToMinutes(activityHours.offline), totalActivityMinutes),
    unfilled: getPercentage(timeToMinutes(activityHours.unfilled), totalActivityMinutes),
    leave: getPercentage(timeToMinutes(rawHoursData?.leave || '00:00'), totalActivityMinutes),
  }), [activityHours, rawHoursData?.leave, totalActivityMinutes]);

  // Enhanced filtered sheets with activity filter
  const filteredSheetsData = useMemo(() => {
    if (!rawHoursData?.sheets) return { filteredSheetsByDate: {}, pendingCount: 0 };

    let allSheets = [...rawHoursData.sheets, ...(rawHoursData.pendingSheets || [])];
    
    // 1. ACTIVITY FILTER (NEW)
    if (activeFilter !== 'all' && activeFilter !== 'pending') {
      allSheets = allSheets.filter(sheet => 
        sheet.activity_type === activeFilter ||
        (activeFilter === 'leave' && sheet.activity_type === 'Leave')
      );
    }
    
    // 2. PENDING FILTER
    if (activeFilter === 'pending') {
      allSheets = allSheets.filter(sheet => sheet.status !== 'approved');
    }
    
    // 3. SEARCH FILTER
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      allSheets = allSheets.filter(sheet =>
        sheet.project_name?.toLowerCase().includes(query) ||
        sheet.work_type?.toLowerCase().includes(query) ||
        sheet.activity_type?.toLowerCase().includes(query) ||
        sheet.narration?.toLowerCase().includes(query) ||
        sheet.status?.toLowerCase().includes(query)
      );
    }

    // 4. Group by date
    const filteredSheetsByDate = allSheets.reduce((acc, sheet) => {
      const dateKey = sheet.date.split('T')[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(sheet);
      return acc;
    }, {});

    const pendingCount = allSheets.filter(sheet => sheet.status !== 'approved').length;
    
    return { filteredSheetsByDate, pendingCount };
  }, [rawHoursData?.sheets, rawHoursData?.pendingSheets, searchQuery, activeFilter]);

  const pendingSheetsCount = filteredSheetsData.pendingCount || rawHoursData?.pendingSheetsCount || 0;

  // Filter handlers
  const handleFilterClick = useCallback((filterType) => {
    setActiveFilter(prev => prev === filterType ? 'all' : filterType);
  }, []);

  const fetchWorkingHours = useCallback(async (startDateParam, endDateParam) => {
    if (!userToken || !id) return;
    try {
      setLoading(true);
      const params = {
        user_id: id,
        start_date: startDateParam || '2000-01-01',
        end_date: endDateParam || getTodayDate(),
      };

      const response = await axios.get(`${API_URL}/api/get-user-performa-data-with-sheets`, {
        params,
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (response.data?.success) {
        const { activities, leave_hours, sheets, pending_sheet_count, pendingSheets = [] } = response.data.data;
        
        const rawData = {
          activities,
          leave: leave_hours || '00:00',
          sheets: sheets || [],
          pendingSheets: pendingSheets || [],
          pendingSheetsCount: pending_sheet_count || 0,
          sheetsByDate: sheets?.reduce((acc, sheet) => {
            const dateKey = sheet.date.split('T')[0];
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(sheet);
            return acc;
          }, {}) || {}
        };
        
        setRawHoursData(rawData);
        setActiveFilter('all'); // Reset filter on new data
      }
    } catch (err) {
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [id, userToken]);

  // Initialize dates
  useEffect(() => {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 6);
    const formattedStart = oneWeekAgo.toISOString().split('T')[0];
    const formattedEnd = today.toISOString().split('T')[0];
    setStartDate(formattedStart);
    setEndDate(formattedEnd);
  }, []);

  useEffect(() => {
    if (id) {
      if (urlStartDate && urlEndDate) {
        setStartDate(urlStartDate);
        setEndDate(urlEndDate);
        fetchWorkingHours(urlStartDate, urlEndDate);
      } else {
        fetchWorkingHours();
      }
    }
  }, [id, urlStartDate, urlEndDate, fetchWorkingHours]);

  const handleDateClick = (date, sheetsForDate) => {
    const totalMinutes = sheetsForDate.reduce((sum, sheet) => {
      const [h, m] = sheet.time.split(':').map(Number);
      return sum + (h * 60 + m);
    }, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalMins = totalMinutes % 60;
    
    setSelectedDayDetails({
      date: new Date(date).toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      }),
      total_hours: `${totalHours}h ${totalMins}m`,
      sheets: sheetsForDate
    });
    setDayDetailModalOpen(true);
  };

  const closeDayDetails = () => {
    setDayDetailModalOpen(false);
    setSelectedDayDetails(null);
  };

  // API CALLS ON DATE BUTTONS
  const handleTodayClick = () => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today); 
    setEndDate(today);
    fetchWorkingHours(today, today);
  };

  const handleYesterdayClick = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formatted = yesterday.toISOString().split("T")[0];
    setStartDate(formatted); 
    setEndDate(formatted);
    fetchWorkingHours(formatted, formatted);
  };

  const handleWeeklyClick = () => {
    const end = new Date();
    const start = new Date(); 
    start.setDate(start.getDate() - 6);
    const startFormatted = start.toISOString().split("T")[0];
    const endFormatted = end.toISOString().split("T")[0];
    setStartDate(startFormatted);
    setEndDate(endFormatted);
    fetchWorkingHours(startFormatted, endFormatted);
  };

  const userRole = localStorage.getItem("user_name");
  const handleViewClick = (project_id) => {
    if (project_id) {
      navigate(`/${userRole}/projects/tasks/${project_id}`);
    }
  };

  return (
    <div className="">
      <SectionHeader 
        icon={BarChart} 
        title="User Performance Report" 
        subtitle={`User ID: ${id} - Click cards to filter sheets`}
        showBack={true}
        showRefresh={true}
        onRefresh={fetchWorkingHours}
      />

      <div className="bg-white/70 backdrop-blur-xl rounded-b-2xl shadow-2xl border border-white/50 p-4 mb-3">
        <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-2xl w-fit 
                        bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 text-[10px] font-semibold mb-6">
          <Calendar className="h-3 w-3" />
          {startDate} → {endDate}
          {activeFilter !== 'all' && (
            <span className="ml-2 px-3 py-1 bg-white/50 rounded-full text-xs font-bold">
              Filtered: {activeFilter.replace(/([A-Z])/g, ' $1').trim()}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
          </div>
        ) : !rawHoursData?.activities ? (
          <div className="p-12 text-center text-gray-500">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg">No activity data available</p>
            <p className="text-sm mt-1">Check date range or user permissions</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
            <HourCard 
              title="Total Hours" 
              value={totalHours} 
              percentage={100} 
              color="blue"
              isActive={activeFilter === 'all'}
              onClick={() => handleFilterClick('all')}
            />
            <HourCard 
              title="Billable" 
              value={activityHours.billable} 
              percentage={hourPercentages.billable} 
              color="green"
              isActive={activeFilter === 'Billable'}
              onClick={() => handleFilterClick('Billable')}
            />
            <HourCard 
              title="In-House" 
              value={activityHours.inHouse} 
              percentage={hourPercentages.inHouse} 
              color="purple"
              isActive={activeFilter === 'In-House'}
              onClick={() => handleFilterClick('In-House')}
            />
            <HourCard 
              title="No Work" 
              value={activityHours.noWork} 
              percentage={hourPercentages.noWork} 
              color="gray"
              isActive={activeFilter === 'No Work'}
              onClick={() => handleFilterClick('No Work')}
            />
            <HourCard 
              title="Offline" 
              value={activityHours.offline} 
              percentage={hourPercentages.offline} 
              color="orange"
              isActive={activeFilter === 'Offline'}
              onClick={() => handleFilterClick('Offline')}
            />
            <HourCard 
              title="Unfilled" 
              value={activityHours.unfilled} 
              percentage={hourPercentages.unfilled} 
              color="yellow"
              isActive={activeFilter === 'Unfilled'}
              onClick={() => handleFilterClick('Unfilled')}
            />
            <HourCard 
              title="Leave Hours" 
              value={rawHoursData.leave} 
              percentage={hourPercentages.leave} 
              color="red"
              isActive={activeFilter === 'leave'}
              onClick={() => handleFilterClick('leave')}
            />
            <HourCard 
              title="Pending Sheets" 
              value={pendingSheetsCount.toString()} 
              color="amber"
              isActive={activeFilter === 'pending'}
              onClick={() => handleFilterClick('pending')}
              count={pendingSheetsCount}
            />
          </div>
        )}
      </div>

      {/* Rest of the component remains the same */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center border border-gray-300/50 px-4 py-2 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500 w-full sm:w-72 bg-white/50">
            <Search className="h-5 w-5 text-gray-400 mr-3" />
            <input
              type="text"
              className="w-full outline-none text-sm bg-transparent"
              placeholder="🔍 Search projects, work types, activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isCustomMode ? (
              <>
                <TodayButton onClick={handleTodayClick} />
                <YesterdayButton onClick={handleYesterdayClick} />
                <WeeklyButton onClick={handleWeeklyClick} />
                <CustomButton onClick={() => setIsCustomMode(true)} />
              </>
            ) : (
              <>
                <input 
                  type="date" 
                  className="border border-gray-300/50 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white/50"
                  value={startDate} 
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    fetchWorkingHours(e.target.value, endDate);
                  }} 
                />
                <span className="px-2 text-gray-500 font-bold">→</span>
                <input 
                  type="date" 
                  className="border border-gray-300/50 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white/50"
                  value={endDate} 
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    fetchWorkingHours(startDate, e.target.value);
                  }} 
                />
                <ClearButton onClick={() => {
                  setStartDate(""); 
                  setEndDate(""); 
                  setSearchQuery("");
                  setActiveFilter('all');
                  fetchWorkingHours();
                }} />
                <CancelButton onClick={() => setIsCustomMode(false)} />
              </>
            )}
            <ExportButton onClick={() => console.log('Export:', rawHoursData)} />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200/50">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Projects</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Hours</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Sheets</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-gray-200/50">
              {Object.keys(filteredSheetsData.filteredSheetsByDate).length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-gray-500">
                    {activeFilter === 'all' ? 'No sheets match your filters' : `No ${activeFilter} sheets found`}
                  </td>
                </tr>
              ) : (
                Object.entries(filteredSheetsData.filteredSheetsByDate).map(([date, sheetsForDate]) => {
                  const totalMinutes = sheetsForDate.reduce((sum, sheet) => {
                    const [h, m] = sheet.time.split(':').map(Number);
                    return sum + (h * 60 + m);
                  }, 0);
                  const hoursStr = `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
                  const pendingCount = sheetsForDate.filter(s => s.status !== 'approved').length;
                  
                  return (
                    <tr 
                      key={date} 
                      className="hover:bg-white/70 cursor-pointer transition-all hover:shadow-md border-b border-gray-100/50" 
                      onClick={() => handleDateClick(date, sheetsForDate)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {[...new Set(sheetsForDate.map(s => s.project_name))].join(', ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600 text-right">
                        {hoursStr}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                        {sheetsForDate.length} sheet{sheetsForDate.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          pendingCount > 0 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {pendingCount > 0 ? `${pendingCount} pending` : 'All approved'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal remains the same */}
      {dayDetailModalOpen && selectedDayDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={closeDayDetails} />
          <div className="relative w-full max-w-7xl max-h-[90vh] rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl border border-white/30 shadow-[0_30px_90px_rgba(0,0,0,0.35)] flex flex-col">
            <div className="p-6 border-b border-white/30 bg-gradient-to-r from-sky-200/40 to-indigo-200/40">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-gray-900 leading-tight">
                    Timesheets for <span className="text-indigo-600 font-semibold">{selectedDayDetails.date}</span>
                  </h2>
                  <p className="text-indigo-700 font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Total Hours: <span className="font-black text-lg">{selectedDayDetails.total_hours}</span>
                  </p>
                </div>
                <button onClick={closeDayDetails} className="p-2 rounded-xl hover:bg-white/40 text-gray-700 hover:text-gray-900">
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="w-full overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-white/50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Project</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Work Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Activity</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Narration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/30">
                    {selectedDayDetails.sheets.map((sheet, index) => (
                      <tr key={index} className="hover:bg-white/50 transition cursor-pointer" onClick={()=>handleViewClick(sheet.project_id)}>
                        <td className="px-4 py-4 font-medium text-gray-900">{sheet.project_name}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{sheet.work_type}</td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            sheet.activity_type === 'Billable' ? 'bg-green-100 text-green-800' :
                            sheet.activity_type === 'In-House' ? 'bg-purple-100 text-purple-800' :
                            sheet.activity_type === 'Offline' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {sheet.activity_type}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-indigo-600 text-left font-mono">{sheet.time}</td>
                        <td className="px-4 py-4 text-left ">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            sheet.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {sheet.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 max-w-md">
                          <div className="line-clamp-2">{sheet.narration || 'No narration provided'}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSheetReportingSub;
