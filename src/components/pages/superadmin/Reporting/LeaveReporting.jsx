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
  // 🟡 Weekend
  if (isWeekend) return "bg-yellow-300 text-yellow-900";

  if (!dayData) return "bg-red-500 text-white";

  // 🟠 Short / Half Day Leave
  if (
    dayData.present === 0 &&
    dayData.leave_type &&
    dayData.halfday_period
  ) {
    return "bg-orange-500 text-white";
  }

  // 🟣 Full Leave
  if (dayData.present === 0 && dayData.leave_type) {
    return "bg-purple-500 text-white";
  }

  // 🟢 Present
  if (dayData.present === 1) {
    return "bg-green-500 text-white";
  }

  // 🔴 Absent
  return "bg-red-500 text-white";
};

const Legend = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <span className={`w-3 h-3 rounded ${color}`} />
    <span className="text-xs font-medium">{label}</span>
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

  const hasFetchedRef = React.useRef(false);
  const attendance = calendarData || {};

  const handleMonthYearChange = (m, y) => {
    hasFetchedRef.current = false;
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
      <div className="
        relative w-full max-w-3xl rounded-3xl
        bg-white/70 backdrop-blur-xl
        border border-white/30
        shadow-[0_20px_60px_rgba(0,0,0,0.25)]
        p-6
      ">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-center mb-4">
          {user.user_name} — Monthly Attendance
        </h2>

        {/* Month / Year */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <select
            value={calendarMonth.getMonth()}
            onChange={(e) =>
              handleMonthYearChange(
                Number(e.target.value),
                calendarMonth.getFullYear()
              )
            }
            className="px-4 py-2 rounded-xl bg-white/60 border"
          >
            {MONTHS.map((m, idx) => (
              <option key={m} value={idx}>{m}</option>
            ))}
          </select>

          <select
            value={calendarMonth.getFullYear()}
            onChange={(e) =>
              handleMonthYearChange(
                calendarMonth.getMonth(),
                Number(e.target.value)
              )
            }
            className="px-4 py-2 rounded-xl bg-white/60 border"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 gap-2 text-center mb-2">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
            <div key={d} className="text-xs font-semibold text-gray-500">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar */}
        {loadingCalendar ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {generateCalendarDays(calendarMonth).map((day) => {
              if (day.empty) return <div key={day.key} />;

             const dayData = attendance[day.date];
const isWeekend = day.weekday === 0 || day.weekday === 6;
const bg = getDayBg(dayData, isWeekend);

return (
  <div
    key={day.date}
    className={`
      relative group h-12 rounded-xl
      flex flex-col items-center justify-center
      text-xs font-medium cursor-pointer
      transition-all duration-200
      hover:scale-105 hover:shadow-lg
      ${bg}
    `}
  >
    <span>{day.day}</span>

    {/* Tooltip */}
    {dayData && (
      <div className="
        absolute bottom-14 left-1/2 -translate-x-1/2
        hidden group-hover:block
        w-72 rounded-xl bg-black text-white
        text-[11px] px-3 py-3 shadow-lg z-50
      ">
        <p className="font-semibold mb-1">
          Date: {day.date}
        </p>

        {/* STATUS */}
        {dayData.present === 1 && (
          <p className="text-green-300 font-semibold">
            Present
          </p>
        )}

        {dayData.present === 0 && dayData.leave_type && (
          <p className={`font-semibold ${
            dayData.halfday_period
              ? "text-orange-300"
              : "text-purple-300"
          }`}>
            {dayData.leave_type}
            {dayData.halfday_period &&
              ` (${dayData.halfday_period})`}
          </p>
        )}

        {dayData.present === 0 && !dayData.leave_type && (
          <p className="text-red-300 font-semibold">
            Absent
          </p>
        )}

        {/* LEAVE DETAILS */}
        {dayData.leave_type && (
          <>
            <p><b>Status:</b> {dayData.status}</p>

            {dayData.reason && (
              <p className="mt-1 text-gray-300 line-clamp-4">
                <b>Reason:</b> {dayData.reason}
              </p>
            )}
          </>
        )}
      </div>
    )}
  </div>
);

            })}
          </div>
        )}

        {/* Legend */}
       <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs text-gray-700">
  <Legend color="bg-green-500" label="Present" />
  <Legend color="bg-purple-500" label="Full Leave" />
  <Legend color="bg-orange-500" label="Short / Half Day Leave" />
  <Legend color="bg-red-500" label="Absent" />
  <Legend color="bg-yellow-300" label="Weekend" />
</div>

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
const [employeeToggle, setEmployeeToggle] = useState("absent"); 

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
  const dates = Object.keys(attendance);

  let presentDays = 0;
  let absentDays = 0;

  dates.forEach(date => {
    if (attendance[date]?.present === 1) {
      presentDays++;
    } else {
      absentDays++; // includes leave + absent
    }
  });

  return {
    totalDays: dates.length,
    presentDays,
    absentDays,
    absenteeism:
      dates.length > 0
        ? ((absentDays / dates.length) * 100).toFixed(1)
        : 0,
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


const absentUsers = filteredUsers.filter(user => {
  const summary = getUserSummary(user);
  return summary.absentDays > 0;
});

const presentUsers = filteredUsers.filter(user => {
  const summary = getUserSummary(user);
  return summary.absentDays === 0;
});


const UserCard = ({ user, summary, onClick }) => {
  const absenceColor =
    summary.absenteeism > 20
      ? "from-red-500/20 to-red-500/5 text-red-600"
      : summary.absenteeism > 10
      ? "from-yellow-500/20 to-yellow-500/5 text-yellow-600"
      : "from-green-500/20 to-green-500/5 text-green-600";

  return (
    <div
      onClick={onClick}
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

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 text-center mb-4">
        <div className="rounded-xl bg-white/70 border border-gray-100 py-3">
          <p className="text-lg font-bold">{summary.absentDays}</p>
          <p className="text-[11px] uppercase text-gray-500">Absent</p>
        </div>

        <div className="rounded-xl bg-white/70 border border-gray-100 py-3">
          <p className="text-lg font-bold">{summary.presentDays}</p>
          <p className="text-[11px] uppercase text-gray-500">Present</p>
        </div>
      </div>

      {/* Indicator */}
    <div
  className={`rounded-xl px-4 py-2 text-sm font-semibold text-center
    ${
      summary.absentDays > 0
        ? "bg-red-100 text-red-600"
        : "bg-green-100 text-green-600"
    }
  `}
>
  {summary.absentDays > 0 ? "Absent" : "Present"}
</div>

    </div>
  );
};





  return (
    <div className='w-full space-y-6 p-6'>
      <SectionHeader
        icon={BarChart}
        title="Leave Reporting"
        subtitle={`${filteredUsers.length} users found`}
      />

      {/* Filters */}
   <div className="
  flex flex-wrap items-center gap-4
  rounded-2xl border border-white/30
  bg-white/70 backdrop-blur-xl
  shadow-[0_8px_30px_rgba(0,0,0,0.06)]
  px-6 py-4
">
  {/* Left: Quick Filters */}
  <div className="flex flex-wrap items-center gap-2">
    <TodayButton onClick={setTodayFilter} />
    <YesterdayButton onClick={setYesterdayFilter} />
    <WeeklyButton onClick={setWeeklyFilter} />
  </div>

  {/* Middle: Search */}
  <div className="flex-1 min-w-[220px] max-w-md">
    <div className="
      flex items-center gap-2
      rounded-xl border border-gray-200
      bg-white/80 px-4 py-2
      focus-within:ring-2 focus-within:ring-blue-500
    ">
      <User className="w-4 h-4 text-gray-400" />
      <input
        type="text"
        className="w-full bg-transparent outline-none text-sm"
        placeholder="Search employee..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  </div>

  {/* Right: Toggle */}
  <div className="flex items-center">
    <div className="inline-flex rounded-xl bg-gray-100 p-1">
      <button
        type="button"
        onClick={() => setEmployeeToggle("absent")}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
          ${
            employeeToggle === "absent"
              ? "bg-red-500 text-white shadow"
              : "text-gray-600 hover:bg-white hover:text-gray-900"
          }`}
      >
        Absent ({absentUsers.length})
      </button>

      <button
        type="button"
        onClick={() => setEmployeeToggle("present")}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
          ${
            employeeToggle === "present"
              ? "bg-green-500 text-white shadow"
              : "text-gray-600 hover:bg-white hover:text-gray-900"
          }`}
      >
        Present ({presentUsers.length})
      </button>
    </div>
  </div>

  {/* Bottom Right: Date Range */}
  <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
    <Calendar className="w-4 h-4 text-blue-500" />
    <span>
      <span className="font-semibold text-gray-800">{startDate}</span>
      {" → "}
      <span className="font-semibold text-gray-800">{endDate}</span>
    </span>
  </div>
</div>


      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Users List */}
    {/* Users List */}
{/* Users List */}
{!isLoading && (
  <div className="mt-6">
    {filteredUsers.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <Users className="w-14 h-14 mb-3 opacity-40" />
        <p className="text-sm">No users found</p>
      </div>
    ) : (
      <>
        {/* 🔴 ABSENT USERS */}
        {employeeToggle === "absent" && (
          <>
            {absentUsers.length === 0 ? (
              <p className="text-center text-sm text-gray-500">
                No absent employees 
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {absentUsers.map((user) => {
                  const summary = getUserSummary(user);
                  return (
                    <UserCard
                      key={user.user_id}
                      user={user}
                      summary={summary}
                      onClick={() => openUserModal(user)}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* 🟢 PRESENT USERS */}
        {employeeToggle === "present" && (
          <>
            {presentUsers.length === 0 ? (
              <p className="text-center text-sm text-gray-500">
                No present employees
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {presentUsers.map((user) => {
                  const summary = getUserSummary(user);
                  return (
                    <UserCard
                      key={user.user_id}
                      user={user}
                      summary={summary}
                      onClick={() => openUserModal(user)}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </>
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
