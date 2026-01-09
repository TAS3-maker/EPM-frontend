import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Clock, ChevronDown, Calendar, CheckCircle, XCircle, Loader2, 
  BarChart, Search 
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

const UserSheetReportingSub = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const userToken = localStorage.getItem('userToken');
  
  const urlStartDate = searchParams.get('start_date');
  const urlEndDate = searchParams.get('end_date');

  const [isCustomMode, setIsCustomMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [rawHoursData, setRawHoursData] = useState(null);
  const [dayDetailModalOpen, setDayDetailModalOpen] = useState(false);
  const [selectedDayDetails, setSelectedDayDetails] = useState(null);

  const filteredData = useMemo(() => {
    if (!rawHoursData?.sheets) return {
      filteredHours: { 
        total: '00:00', billable: '00:00', inHouse: '00:00', noWork: '00:00', 
        offline: '00:00', unfilled: '00:00', leave: '00:00', pendingSheets: 0,
        percentages: {}
      },
      filteredSheetsByDate: {},
      pendingSheetsCount: 0
    };

    let allSheets = [...rawHoursData.sheets];
    
    if (rawHoursData.pendingSheets && rawHoursData.pendingSheets.length > 0) {
      allSheets = [...allSheets, ...rawHoursData.pendingSheets];
    }
    
    let filteredSheets = allSheets;
    
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      filteredSheets = filteredSheets.filter(sheet =>
        sheet.project_name?.toLowerCase().includes(query) ||
        sheet.work_type?.toLowerCase().includes(query) ||
        sheet.activity_type?.toLowerCase().includes(query) ||
        sheet.narration?.toLowerCase().includes(query) ||
        sheet.status?.toLowerCase().includes(query)
      );
    }

    if (startDate && endDate) {
      filteredSheets = filteredSheets.filter(sheet => {
        const sheetDate = sheet.date.split('T')[0];
        return sheetDate >= startDate && sheetDate <= endDate;
      });
    }

    const filteredSheetsByDate = filteredSheets.reduce((acc, sheet) => {
      const dateKey = sheet.date.split('T')[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(sheet);
      return acc;
    }, {});

    const filteredActivities = {};
    filteredSheets
      .filter(sheet => sheet.status === 'approved') 
      .forEach(sheet => {
        const activity = sheet.activity_type;
        if (!filteredActivities[activity]) filteredActivities[activity] = '00:00';
        filteredActivities[activity] = addTimes([filteredActivities[activity], sheet.time]);
      });

    const billable = filteredActivities.Billable || '00:00';
    const inHouse = filteredActivities['In-House'] || '00:00';
    const noWork = filteredActivities['No Work'] || '00:00';
    const offline = filteredActivities.Offline || '00:00';
    const unfilled = filteredActivities.Unfilled || '00:00';
    
    const totalFiltered = addTimes([billable, inHouse, noWork, offline, unfilled]);
    const totalMinutesFiltered = timeToMinutes(totalFiltered);

    // 🔥 Count pending sheets in filtered range
    const pendingSheetsCount = filteredSheets.filter(sheet => sheet.status !== 'approved').length;

    const filteredHours = {
      total: totalFiltered,
      billable, inHouse, noWork, offline, unfilled, leave: rawHoursData.leave || '00:00',
      pendingSheets: pendingSheetsCount,
      percentages: {
        billable: getPercentage(timeToMinutes(billable), totalMinutesFiltered),
        inHouse: getPercentage(timeToMinutes(inHouse), totalMinutesFiltered),
        noWork: getPercentage(timeToMinutes(noWork), totalMinutesFiltered),
        offline: getPercentage(timeToMinutes(offline), totalMinutesFiltered),
        unfilled: getPercentage(timeToMinutes(unfilled), totalMinutesFiltered),
        leave: getPercentage(timeToMinutes(rawHoursData.leave || '00:00'), totalMinutesFiltered),
      }
    };

    return { filteredHours, filteredSheetsByDate, pendingSheetsCount };
  }, [rawHoursData, searchQuery, startDate, endDate]);

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
          pendingSheetCount: pending_sheet_count || 0,
          sheetsByDate: sheets?.reduce((acc, sheet) => {
            const dateKey = sheet.date.split('T')[0];
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(sheet);
            return acc;
          }, {}) || {}
        };
        
        setRawHoursData(rawData);
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

  return (
    <div className="space-y-6 p-6">
      <SectionHeader 
        icon={BarChart} 
        title="User Performance Report" 
        subtitle={`User ID: ${id} - Filtered hours & sheets`}
      />

      <div className="bg-white rounded-2xl shadow-md border">
        <div className="px-6 py-4 flex justify-between items-center bg-gradient-to-br from-indigo-600 to-blue-500 rounded-t-xl">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Filtered Working Hours ({Object.keys(filteredData.filteredSheetsByDate).length} days)
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
          </div>
        ) : Object.keys(filteredData.filteredSheetsByDate).length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg">No data matches your current filters</p>
            <p className="text-sm mt-1">Try adjusting search or date range</p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <HourCard title="Total Hours" value={filteredData.filteredHours.total} percentage={100} color="blue" />
            <HourCard title="Billable" value={filteredData.filteredHours.billable} percentage={filteredData.filteredHours.percentages.billable} color="green" />
            <HourCard title="In-House" value={filteredData.filteredHours.inHouse} percentage={filteredData.filteredHours.percentages.inHouse} color="purple" />
            <HourCard title="No Work" value={filteredData.filteredHours.noWork} percentage={filteredData.filteredHours.percentages.noWork} color="gray" />
            <HourCard title="Offline" value={filteredData.filteredHours.offline} percentage={filteredData.filteredHours.percentages.offline} color="orange" />
            <HourCard title="Unfilled" value={filteredData.filteredHours.unfilled} percentage={filteredData.filteredHours.percentages.unfilled} color="yellow" />
            <HourCard title="Leave Hours" value={filteredData.filteredHours.leave} percentage={filteredData.filteredHours.percentages.leave} color="red" />
            <HourCard title="Pending Sheets" value={filteredData.pendingSheetsCount.toString()} percentage={0} color="amber" />
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-md border p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center border border-gray-300 px-4 py-2 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 w-full sm:w-72">
            <Search className="h-5 w-5 text-gray-400 mr-3" />
            <input
              type="text"
              className="w-full outline-none text-sm"
              placeholder="🔍 Search projects, work types, activities, narration, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isCustomMode ? (
              <>
                <TodayButton onClick={() => {
                  const today = new Date().toISOString().split("T")[0];
                  setStartDate(today); setEndDate(today);
                }} />
                <YesterdayButton onClick={() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  const formatted = yesterday.toISOString().split("T")[0];
                  setStartDate(formatted); setEndDate(formatted);
                }} />
                <WeeklyButton onClick={() => {
                  const end = new Date();
                  const start = new Date(); start.setDate(start.getDate() - 6);
                  setStartDate(start.toISOString().split("T")[0]);
                  setEndDate(end.toISOString().split("T")[0]);
                }} />
                <CustomButton onClick={() => setIsCustomMode(true)} />
              </>
            ) : (
              <>
                <input 
                  type="date" 
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                />
                <span className="px-2 text-gray-500">→</span>
                <input 
                  type="date" 
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                />
                <ClearButton onClick={() => {
                  setStartDate(""); setEndDate(""); setSearchQuery("");
                }} />
                <CancelButton onClick={() => setIsCustomMode(false)} />
              </>
            )}
            <ExportButton onClick={() => console.log('Export:', filteredData)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Projects</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Hours</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Sheets</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.keys(filteredData.filteredSheetsByDate).length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-gray-500">
                    No sheets match your filters
                  </td>
                </tr>
              ) : (
                Object.entries(filteredData.filteredSheetsByDate).map(([date, sheetsForDate]) => {
                  const totalMinutes = sheetsForDate.reduce((sum, sheet) => {
                    const [h, m] = sheet.time.split(':').map(Number);
                    return sum + (h * 60 + m);
                  }, 0);
                  const hoursStr = `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
                  const pendingCount = sheetsForDate.filter(s => s.status !== 'approved').length;
                  
                  return (
                    <tr 
                      key={date} 
                      className="hover:bg-gray-50 cursor-pointer transition-all hover:shadow-sm" 
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {sheetsForDate.length} sheet{sheetsForDate.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          pendingCount > 0 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-green-100 text-green-800'
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
                      <tr key={index} className="hover:bg-white/50 transition cursor-default">
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
                        <td className="px-4 py-4  text-left ">
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

const COLOR_MAP = {
  blue: { bg: 'from-blue-50 to-indigo-50 border-blue-200', text: 'text-blue-600', bar: 'from-blue-500 to-indigo-500' },
  green: { bg: 'from-green-50 to-emerald-50 border-green-200', text: 'text-green-600', bar: 'from-green-500 to-emerald-500' },
  purple: { bg: 'from-purple-50 to-violet-50 border-purple-200', text: 'text-purple-600', bar: 'from-purple-500 to-violet-500' },
  gray: { bg: 'from-gray-50 to-gray-100 border-gray-300', text: 'text-gray-600', bar: 'from-gray-400 to-gray-500' },
  orange: { bg: 'from-orange-50 to-amber-50 border-orange-200', text: 'text-orange-600', bar: 'from-orange-500 to-amber-500' },
  yellow: { bg: 'from-yellow-50 to-orange-50 border-yellow-200', text: 'text-yellow-700', bar: 'from-yellow-500 to-orange-500' },
  red: { bg: 'from-red-50 to-rose-50 border-red-200', text: 'text-red-600', bar: 'from-red-500 to-rose-500' },
  amber: { bg: 'from-amber-50 to-yellow-100 border-amber-200', text: 'text-amber-600', bar: 'from-amber-400 to-yellow-400' },
};

const HourCard = ({ title, value, percentage, color }) => {
  const c = COLOR_MAP[color];
  const isCount = !value.includes(':'); 
  
  return (
    <div className={`bg-gradient-to-br ${c.bg} p-6 rounded-2xl shadow-sm border hover:shadow-xl transition-all duration-300`}>
      <div className={`text-2xl font-bold ${c.text}`}>
        {isCount ? value : value}
      </div>
      <div className="text-gray-600 text-sm uppercase tracking-wider mt-1 font-medium">{title}</div>
      {!isCount && (
        <>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
            <div className={`bg-gradient-to-r ${c.bar} h-3 rounded-full transition-all`} style={{ width: `${percentage || 0}%` }} />
          </div>
          <div className={`text-sm font-semibold mt-2 ${c.text}`}>{percentage || 0}%</div>
        </>
      )}
    </div>
  );
};

export default UserSheetReportingSub;
