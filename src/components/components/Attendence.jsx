import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/ApiConfig';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const Attendence = ({ userId, userName, teamName }) => {
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    holidays: 0,
    totalDays: 0
  });

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const userToken = localStorage.getItem('userToken');

  const MONTHS = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getCurrentMonthRange = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();

    return {
      startDate: formatDate(new Date(year, month, 1)),
      endDate: formatDate(new Date(year, month + 1, 0)),
      monthName: MONTHS[month],
      year
    };
  };

  const fetchAttendanceData = async () => {
    if (!userToken || !userId) {
      setError('Authentication or user data missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { startDate, endDate } = getCurrentMonthRange();

      const response = await axios.get(
        `${API_URL}/api/get-users-attendance?user_id=${userId}&start_date=${startDate}&end_date=${endDate}`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      const userData = response.data.data?.[0];

      if (userData?.attendance_data) {
        setAttendanceData(userData.attendance_data);

        const stats = { present: 0, absent: 0, holidays: 0, totalDays: 0 };

        Object.values(userData.attendance_data).forEach(day => {
          stats.totalDays++;

          if (day.present === 1) stats.present++;
          else if ((day.present === 0 || day.present === "") && day.is_working_day === 1 && !day.leave_type)
            stats.absent++;
          else if (day.holiday_type) stats.holidays++;
        });

        setStats(stats);
      } else {
        setAttendanceData({});
        setStats({ present: 0, absent: 0, holidays: 0, totalDays: 0 });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedMonth]);

  const handleMonthChange = (dir) => {
    setSelectedMonth(prev => {
      const d = new Date(prev);
      d.setDate(1);
      d.setMonth(prev.getMonth() + dir);
      return d;
    });
  };

  const generateCalendarDays = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const paddingDays = firstDay.getDay();

    const days = [];

    for (let i = paddingDays - 1; i >= 0; i--) {
      const prev = new Date(year, month, 0);
      prev.setDate(prev.getDate() - i);
      days.push({
        date: formatDate(prev),
        day: prev.getDate(),
        weekday: prev.getDay(),
        empty: true,
        dayData: null
      });
    }

    const total = new Date(year, month + 1, 0).getDate();

    for (let d = 1; d <= total; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = formatDate(dateObj);

      days.push({
        date: dateStr,
        day: d,
        weekday: dateObj.getDay(),
        empty: false,
        dayData: attendanceData[dateStr]
      });
    }

    while (days.length < 42) {
      const next = new Date(year, month + 1, days.length - total - paddingDays + 1);
      days.push({
        date: formatDate(next),
        day: next.getDate(),
        weekday: next.getDay(),
        empty: true,
        dayData: null
      });
    }

    return days;
  };

  const today = new Date();
  today.setHours(0,0,0,0);

  const getStatusColor = (dayData, isWeekend, isFuture) => {
    if (isFuture && (dayData?.present === "" || dayData?.present === "Not Applicable"))
      return 'bg-white text-gray-400 border-gray-200 cursor-not-allowed';

    if (dayData?.is_working_day === 0 && dayData?.present === "")
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';

    if (dayData?.present === 2)
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';

    if (dayData?.leave_type === "Full Leave")
      return 'bg-purple-100 text-purple-800 border-purple-200';

    if (["Half Day","Short Leave"].includes(dayData?.leave_type))
      return 'bg-orange-100 text-orange-800 border-orange-200';

    if (dayData?.present === 1)
      return 'bg-green-100 text-green-800 border-green-200';

    if (dayData?.present === 0 && !dayData?.leave_type && !isFuture)
      return 'bg-red-100 text-red-800 border-red-200';

    if (isWeekend)
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';

    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getStatusIcon = (dayData, isWeekend, isFuture) => {
    if (isFuture && (dayData?.present === "" || dayData?.present === "Not Applicable"))
      return null;

    if (dayData?.present === 2)
      return <AlertCircle className="w-3 h-3 text-indigo-500" />;

    if (dayData?.leave_type === "Full Leave")
      return <AlertCircle className="w-3 h-3 text-purple-500" />;

    if (["Half Day","Short Leave"].includes(dayData?.leave_type))
      return <Clock className="w-3 h-3 text-orange-500" />;

    if (dayData?.present === 1)
      return <CheckCircle className="w-3 h-3 text-green-500" />;

    if (dayData?.present === 0 && !isFuture)
      return <XCircle className="w-3 h-3 text-red-500" />;

    if (isWeekend)
      return <Clock className="w-3 h-3 text-yellow-500" />;

    return null;
  };

  const { monthName, year } = getCurrentMonthRange();
  const calendarDays = generateCalendarDays(selectedMonth);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="bg-white border rounded-3xl p-8 shadow-xl">

      <div className="flex justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold">Attendance Overview</h3>
          <p className="text-sm">{userName}</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => handleMonthChange(-1)}>
            <ChevronLeft />
          </button>
          <span>{monthName} {year}</span>
          <button onClick={() => handleMonthChange(1)}>
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3 mb-2 text-center font-semibold text-gray-600">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3">
        {calendarDays.map(day => {
          if (day.empty) return <div key={day.date} className="h-16 opacity-40" />;

          const isWeekend = day.weekday === 0 || day.weekday === 6;
          const dayData = day.dayData;

          const dayDate = new Date(year, selectedMonth.getMonth(), day.day);
          const isFuture = dayDate > today;

          const isBlocked =
            (dayData?.present === "" || dayData?.present === "Not Applicable") && isFuture;

          return (
            <div
              key={day.date}
              className={`group relative h-20 rounded-xl flex flex-col items-center justify-center border ${getStatusColor(dayData, isWeekend, isFuture)}`}
            >
              <span className="font-bold">{day.day}</span>
              {getStatusIcon(dayData, isWeekend, isFuture)}

              {!isBlocked && (
                <div className="absolute bottom-24 hidden group-hover:block w-64 bg-black text-white text-[11px] p-3 rounded-lg shadow-lg z-50">
                  <p className="font-semibold mb-1">Date: {day.date}</p>

                  {dayData?.present === 2 && <p className="text-indigo-300">Event</p>}
                  {dayData?.present === 1 && <p className="text-green-300">Present</p>}
                  {dayData?.present === 0 && <p className="text-red-300">Absent</p>}
                  {dayData?.leave_type === "Full Leave" && <p className="text-purple-300">Full Leave</p>}
                  {["Half Day","Short Leave"].includes(dayData?.leave_type) && (
                    <p className="text-orange-300">{dayData.leave_type}</p>
                  )}
                  {dayData?.is_working_day === 0 && <p className="text-yellow-300">Non-working</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 text-xs">
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div><span>Present</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div><span>Absent</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500 rounded-full"></div><span>Full Leave</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded-full"></div><span>Half / Short Leave</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-500 rounded-full"></div><span>Event</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-400 rounded-full"></div><span>Non-working</span></div>
      </div>

      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
};

export default Attendence;