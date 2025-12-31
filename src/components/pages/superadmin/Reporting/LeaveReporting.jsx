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

  const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const YEARS = Array.from(
  { length: 10 },
  (_, i) => new Date().getFullYear() - 5 + i
);

const generateCalendarDays = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days = [];

  // Empty slots before first day
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push({ empty: true, key: `e-${i}` });
  }

  // Actual days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const fullDate = new Date(year, month, d);
    days.push({
      day: d,
      date: fullDate.toISOString().split("T")[0],
      weekday: fullDate.getDay(),
      key: fullDate.toISOString(),
    });
  }

  return days;
};

const getDayBg = (dayData, isWeekend) => {
  // ✅ Weekend ALWAYS yellow
  if (isWeekend) return "bg-yellow-300 text-yellow-900";

  // Leave
  if (dayData?.present === 0 && dayData?.leave_type) {
    return "bg-purple-500 text-white";
  }

  // Present
  if (dayData?.present === 1) {
    return "bg-green-500 text-white";
  }

  // Absent
  return "bg-red-500 text-white";
};

const Legend = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <span className={`w-3 h-3 rounded ${color}`} />
    <span className="text-xs">{label}</span>
  </div>
);


const AttendanceCalendarModal = ({
  user,
  onClose,
  calendarData,
  setCalendarData,
  attendenceOfAllUsers,
}) => {
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  // 🔒 ONE ref to prevent repeated calls
  const hasFetchedRef = React.useRef(false);

  const attendance = calendarData || {};

  const handleMonthYearChange = (m, y) => {
    hasFetchedRef.current = false; // allow new fetch
    setCalendarMonth(new Date(y, m, 1));
  };

  const fetchMonthlyAttendance = async (year, month) => {
    setLoadingCalendar(true);

    const start = new Date(year, month, 1).toISOString().split("T")[0];
    const end = new Date(year, month + 1, 0).toISOString().split("T")[0];

    const data = await attendenceOfAllUsers(start, end, { silent: true });

    const userData = data.find(u => u.user_id === user.user_id);
    setCalendarData(userData?.attendance_data || {});

    setLoadingCalendar(false);
  };

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    fetchMonthlyAttendance(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth()
    );
  }, [calendarMonth]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white/70 p-6">

        <button onClick={onClose} className="absolute top-4 right-4">✕</button>

        <h2 className="text-xl font-bold text-center">{user.user_name}</h2>
        <p className="text-center text-xs text-gray-500 mb-4">
          Monthly Attendance
        </p>

        {/* Month / Year */}
        <div className="flex justify-center gap-3 mb-5">
          <select
            value={calendarMonth.getMonth()}
            onChange={(e) =>
              handleMonthYearChange(Number(e.target.value), calendarMonth.getFullYear())
            }
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>

          <select
            value={calendarMonth.getFullYear()}
            onChange={(e) =>
              handleMonthYearChange(calendarMonth.getMonth(), Number(e.target.value))
            }
          >
            {YEARS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Calendar */}
        {loadingCalendar ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {generateCalendarDays(calendarMonth).map(day => {
              if (day.empty) return <div key={day.key} />;

              const dayData = attendance[day.date];
              const isWeekend = day.weekday === 0 || day.weekday === 6;
              const bg = getDayBg(dayData, isWeekend);

              return (
                <div
                  key={day.date}
                  className={`h-12 rounded flex items-center justify-center ${bg}`}
                >
                  {day.day}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};




const LeaveReporting = () => {
  const { userLeaves: rawData, attendenceOfAllUsers, loading: isLoading } = useLeave();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const token = localStorage.getItem("userToken");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [viewMode, setViewMode] = useState("user");
const [calendarData, setCalendarData] = useState({});
const [loadingCalendar, setLoadingCalendar] = useState(false);


const lastFetchedRange = React.useRef({ start: "", end: "" });


  useEffect(() => {
    if (!startDate && !endDate && token) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6); 
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    }
  }, []);


const [weekRange, setWeekRange] = useState({
  start: "",
  end: "",
});





const fetchWeeklyAttendance = (start, end) => {
  attendenceOfAllUsers(start, end);
};




useEffect(() => {
  if (!token) return;

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);

  const startStr = start.toISOString().split("T")[0];
  const endStr = end.toISOString().split("T")[0];

  setWeekRange({ start: startStr, end: endStr });
  fetchWeeklyAttendance(startStr, endStr);
}, [token]);


useEffect(() => {
  if (!token || !startDate || !endDate) return;

  if (
    lastFetchedRange.current.start === startDate &&
    lastFetchedRange.current.end === endDate
  ) return;

  lastFetchedRange.current = { start: startDate, end: endDate };
  attendenceOfAllUsers(startDate, endDate);

}, [startDate, endDate, token]);




const getMonthRange = (year, month) => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
};

  

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
       workingDays: presentDays,
       leaveDays,
      absenteeism: totalDays > 0 ? ((leaveDays / totalDays) * 100).toFixed(1) : 0
    };
  }, []);

  // const getFilteredAttendance = (attendance) => {
  //   if (!startDate || !endDate) return attendance;
    
  //   const filtered = {};
  //   Object.keys(attendance).forEach(date => {
  //     if (date >= startDate && date <= endDate) {
  //       filtered[date] = attendance[date];
  //     }
  //   });
  //   return filtered;
  // };

const setTodayFilter = () => {
  const today = new Date().toISOString().split("T")[0];
  setWeekRange({ start: today, end: today });
  fetchWeeklyAttendance(today, today);
};

const setYesterdayFilter = () => {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const d = y.toISOString().split("T")[0];
  setWeekRange({ start: d, end: d });
  fetchWeeklyAttendance(d, d);
};

const setWeeklyFilter = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);

  const s = start.toISOString().split("T")[0];
  const e = end.toISOString().split("T")[0];

  setWeekRange({ start: s, end: e });
  fetchWeeklyAttendance(s, e);
};


 const clearFilters = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);

  setStartDate(start.toISOString().split("T")[0]);
  setEndDate(end.toISOString().split("T")[0]);
  setIsCustomMode(false);
};


const openUserModal = (user) => {
  setCalendarData({});      // clear old user data
  setSelectedUser(user);
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
        <div className="mt-6">
  {filteredUsers.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <Users className="w-14 h-14 mb-3 opacity-40" />
      <p className="text-sm">No users found</p>
    </div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredUsers.map((user) => {
        const summary = getUserSummary(user);

        const absenceColor =
          summary.absenteeism > 20
            ? "from-red-500/20 to-red-500/5 text-red-600"
            : summary.absenteeism > 10
            ? "from-yellow-500/20 to-yellow-500/5 text-yellow-600"
            : "from-green-500/20 to-green-500/5 text-green-600";

        return (
          <div
            key={user.user_id}
            onClick={() => openUserModal(user)}
            className="
              relative cursor-pointer rounded-2xl p-5
              backdrop-blur-xl bg-white/60
              border border-white/30
              shadow-[0_8px_30px_rgba(0,0,0,0.05)]
              hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]
              hover:-translate-y-1
              transition-all duration-300
            "
          >
            {/* Top */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow">
                  <User className="w-5 h-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.user_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID #{user.user_id}
                  </p>
                </div>
              </div>

              <Eye className="w-4 h-4 text-gray-400" />
            </div>

            {/* Attendance Summary */}
            <div className="grid grid-cols-2 gap-4 text-center mb-4">
              <div className="rounded-xl bg-white/70 border border-gray-100 py-3">
                <p className="text-lg font-bold text-gray-900">
                  {summary.leaveDays}
                </p>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  Leaves
                </p>
              </div>

              <div className="rounded-xl bg-white/70 border border-gray-100 py-3">
                <p className="text-lg font-bold text-gray-900">
                 {summary.presentDays}

                </p>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  Working
                </p>
              </div>
            </div>

            {/* Absence Indicator */}
            <div
              className={`rounded-xl px-4 py-2 text-sm font-semibold text-center bg-gradient-to-r ${absenceColor}`}
            >
              {summary.absenteeism}% Absent
            </div>
          </div>
        );
      })}
    </div>
  )}
</div>

      )}

{showModal && selectedUser && (
  <AttendanceCalendarModal
    user={selectedUser}
    calendarData={calendarData}
    setCalendarData={setCalendarData}
    attendenceOfAllUsers={attendenceOfAllUsers}
    onClose={() => setShowModal(false)}
  />
)}


    </div>
  );
};

export default LeaveReporting;
