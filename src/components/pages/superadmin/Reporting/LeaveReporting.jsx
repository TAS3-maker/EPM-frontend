import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { SectionHeader } from "../../../components/SectionHeader";
import { 
  Loader2, User, CheckCircle, XCircle, Calendar, 
  BarChart, Users, FileText, Eye, ChevronRight, X
} from "lucide-react";
import { 
  ClearButton, TodayButton, YesterdayButton, WeeklyButton, MonthlyButton,
  CustomButton, CancelButton 
} from "../../../AllButtons/AllButtons";
import { useLeave } from "../../../context/LeaveContext";
import Pagination from "../../../components/Pagination";
import { API_URL } from '../../../utils/ApiConfig';

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

  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push({ empty: true, key: `e-${i}` });
  }

for (let d = 1; d <= lastDay.getDate(); d++) {
  const fullDate = new Date(year, month, d);

  const y = fullDate.getFullYear();
  const m = String(fullDate.getMonth() + 1).padStart(2, "0");
  const da = String(fullDate.getDate()).padStart(2, "0");
  const localDate = `${y}-${m}-${da}`;

  days.push({
    day: d,
    date: localDate,      // ✅ matches API keys
    weekday: fullDate.getDay(),
    key: localDate,       // ✅ stable key
  });
}


  return days;
};
const isShortOrHalfLeave = (leaveType) =>
  ["Short Leave", "Half Day"].includes(leaveType);

const getDayBg = (dayData, isWeekend) => {
  // 🏖️ NEW: Holiday (highest priority)
  if (dayData?.is_working_day===0 && dayData?.present==="") {
    return "bg-yellow-300 text-yellow-900";  
  }

  if (dayData?.is_working_day===1&&dayData?.present===1) {
    return "bg-green-600 text-white";  
  }
  

  if (dayData?.is_working_day===1&&dayData?.present===0&&dayData?.leave_type==="Full Leave") {
    return "bg-purple-500 text-white";
  }
  if (dayData?.is_working_day===1&&dayData?.present===2) {
    return "bg-indigo-500 text-white";
  }


  if (dayData?.is_working_day===1&&dayData?.present===0&&dayData?.leave_type==="") {
    return "bg-red-500 text-white";
  }




  // 🟠 4️⃣ Short / Half Leave (even on weekend)
  if (dayData?.is_working_day===1&&dayData?.present===0&&dayData?.leave_type==="Half Day"||dayData?.leave_type==="Short Leave") {
    return "bg-orange-500 text-white";
  }

 

  return "bg-gray-100 text-gray-400";
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
   fetchLeavesByUserId
}) => {
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  // const [leaves, setLeaves] = useState([]);

  const hasFetchedRef = React.useRef(false);

  const handleMonthYearChange = (m, y) => {
    hasFetchedRef.current = false;
    setCalendarMonth(new Date(y, m, 1));
  };

   const formatLocalDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getMonthRange = (year, month) => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  return {
    startDate: formatLocalDate(start),
    endDate: formatLocalDate(end),
  };
};

const fetchUserLeaves = async (startDate, endDate) => {
  setLoadingCalendar(true);

  try {
const response = await fetchLeavesByUserId(
  user.user_id,
  startDate,
  endDate
);

    // API returns array → find selected user
const userData = response?.[0];


    if (!userData || !userData.attendance_data) {
      setCalendarData({});
      return;
    }

    // Filter only selected month range
    const monthData = {};
    Object.entries(userData.attendance_data).forEach(
      ([date, data]) => {
        if (date >= startDate && date <= endDate) {
          monthData[date] = data;
        }
      }
    );

    setCalendarData(monthData);
  } catch (error) {
    console.error("Calendar error:", error);
    setCalendarData({});
  } finally {
    setLoadingCalendar(false);
  }
};

const today = new Date();
const currentMonth = today.getMonth();   
const currentYear = today.getFullYear();


  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

  const { startDate, endDate } = getMonthRange(
  calendarMonth.getFullYear(),
  calendarMonth.getMonth()
);

fetchUserLeaves(startDate, endDate);



  }, [calendarMonth]);




  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm !mt-0"
      onClick={onClose}
      >
      <div className="
        relative w-full max-w-3xl rounded-3xl
        bg-white/70 backdrop-blur-xl
        border border-white/30
        shadow-[0_20px_60px_rgba(0,0,0,0.25)]
        p-6
        overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-center mb-4">
          {user.user_name} — Monthly Attendance
        </h2>

        <div className="flex items-center justify-center gap-3 mb-5">
      <select
  value={calendarMonth.getMonth()}
  onChange={(e) =>
    handleMonthYearChange(
      Number(e.target.value),
      calendarMonth.getFullYear()
    )
  }
  className="px-4 py-2 rounded-xl border"
>
  {MONTHS.map((m, idx) => {
    const disable =
      calendarMonth.getFullYear() === currentYear &&
      idx > currentMonth;

    return (
      <option key={m} value={idx} disabled={disable}>
        {m}
      </option>
    );
  })}
</select>


  <select
  value={calendarMonth.getFullYear()}
  onChange={(e) =>
    handleMonthYearChange(
      calendarMonth.getMonth(),
      Number(e.target.value)
    )
  }
  className="px-4 py-2 rounded-xl border"
>
  {YEARS.map((y) => (
    <option key={y} value={y} disabled={y > currentYear}>
      {y}
    </option>
  ))}
</select>

        </div>

        <div className="grid grid-cols-7 gap-2 text-center mb-2">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
            <div key={d} className="text-xs font-semibold text-gray-500">
              {d}
            </div>
          ))}
        </div>

        {loadingCalendar ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {generateCalendarDays(calendarMonth).map((day) => {
              if (day.empty) return <div key={day.key} />;

            const dayData = calendarData[day.date];
              const isWeekend = day.weekday === 0 || day.weekday === 6;
              const bg = getDayBg(dayData, isWeekend);
const todayDate = new Date();
todayDate.setHours(0, 0, 0, 0);

const dayDate = new Date(
  calendarMonth.getFullYear(),
  calendarMonth.getMonth(),
  day.day
);

const isLeftEdge = day.weekday <= 1;  
const isRightEdge = day.weekday >= 5; 


const isFutureDate = dayDate > todayDate;

 const workingHours =
    dayData?.working_hours && dayData.working_hours !== "00:00"
      ? dayData.working_hours
      : null;

  const leaveHours =
    dayData?.leave_hours && dayData.leave_hours !== "00:00"
      ? dayData.leave_hours
      : null;

const isBlockedByAPI =
  dayData && (dayData.present === "" || dayData.present === "Not Applicable")&& isFutureDate;



const isBlocked = isBlockedByAPI &&!isWeekend ;


              return (
             <div
  key={day.date}
  className={`
    relative group h-12 rounded-xl
    flex flex-col items-center justify-center
    text-xs font-medium
    transition-all duration-200
    ${isLeftEdge ? "left-edge" : ""}
    ${isRightEdge ? "right-edge" : ""}
    ${
      isBlocked
        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
        : `${bg} cursor-pointer hover:scale-105 hover:shadow-lg`
    }
  `}
>

                  <span>{day.day}</span>

          {!isBlocked && (
  <div
    className="
      absolute bottom-14
    hidden group-hover:block
    w-72 rounded-xl bg-black text-white
    text-[11px] px-3 py-3 shadow-lg z-50

    left-1/2 -translate-x-1/2
    group-hover:left-1/2

    group-[.left-edge]:left-0 group-[.left-edge]:translate-x-0
    group-[.right-edge]:right-0 group-[.right-edge]:left-auto group-[.right-edge]:translate-x-0
    "
  >
    <p className="font-semibold mb-1">
      Date: {day.date}
    </p>

       {dayData?.present == "Not Applicable"  && dayData.reason==="User is inactive"&& (
      <p className="text-gray-100 font-semibold">
        Inactive
      </p>
    )}
    {isWeekend && !dayData && (
      <p className="text-yellow-300 font-semibold">
        Weekend
      </p>
    )}
    

    {dayData?.holiday_type && (
  <p className="text-indigo-300 font-semibold">
    {dayData.holiday_type} — {dayData.description || "Holiday"}
  </p>
)}

    {dayData?.leave_type === "Full Leave" && (
      <p className="text-purple-300 font-semibold">
        Full Leave
      </p>
    )}

    {["Half Day", "Short Leave"].includes(dayData?.leave_type) && (
      <p className="text-orange-300 font-semibold">
        {dayData.leave_type}
      </p>
    )}

    {dayData?.present === 1 && (
      <p className="text-green-300 font-semibold">
        Present
      </p>
    )}

    {dayData?.present === 0 && !dayData?.leave_type && (
      <p className="text-red-300 font-semibold">
        Absent
      </p>
    )}
 
    {/* HOURS */}
    {(dayData?.working_hours || dayData?.leave_hours) && (
      <div className="mt-2 space-y-1">
        {dayData?.working_hours &&
          dayData.working_hours !== "00:00" && (
            <p>
              <b>Working Hours:</b> {dayData.working_hours}
            </p>
          )}

        {dayData?.leave_hours &&
          dayData.leave_hours !== "00:00" && (
            <p>
              <b>Leave Hours:</b> {dayData.leave_hours}
            </p>
          )}
      </div>
    )}




  </div>
)}

                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs text-gray-700">
          
           <Legend color="bg-indigo-500" label="Event" />
          <Legend color="bg-green-500" label="Present" />
          <Legend color="bg-purple-500" label="Full Leave" />
          <Legend color="bg-orange-500" label="Short / Half Day Leave" />
          <Legend color="bg-red-500" label="Absent" />
          <Legend color="bg-yellow-300" label="Non-Working" />
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

  //  PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 12;


  const lastFetchedRange = React.useRef({ start: "", end: "" });
  const [weekRange, setWeekRange] = useState({
    start: "",
    end: "",
  });

     const formatLocalDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};










const fetchLeavesByUserId = useCallback(
  async (userId, start, end) => {
    const token = localStorage.getItem("userToken");
    if (!token) return [];

    const params = new URLSearchParams();
    if (start) params.append("start_date", start);
    if (end) params.append("end_date", end);
    if (userId) params.append("user_id", userId);

    try {
      const url = `${API_URL}/api/get-users-attendance?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch leaves");

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Error fetching leaves:", error);
      return [];
    }
  },
  []
);

  const filteredUsers = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    return rawData.filter(user => 
      user.user_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rawData, searchQuery]);
const isShortOrHalfLeave = (leaveType) =>
  ["Short Leave", "Half Day"].includes(leaveType);

  //  getUserSummary - TOP MEIN DECLARE KIYA (hoisting fix)
const getUserSummary = useCallback((user) => {
  const attendance = user.attendance_data || {};
  const dates = Object.keys(attendance);

  let presentDays = 0;
  let absentDays = 0;
  let fullLeaveDays = 0;
  let halfLeaveDays = 0;

  dates.forEach(date => {
    const day = attendance[date];

    // Full day leave
    if (day.present === 0 && day.leave_type) {
      fullLeaveDays++;
      absentDays++;
      return;
    }

    // Half day leave
    if (day.leave_type === "Half Day") {
      halfLeaveDays++;
      absentDays++; // treat as absent in absent sheet
      return;
    }

    // Pure absent
    if (day.present === 0) {
      absentDays++;
      return;
    }

    // Present
    if (day.present === 1) {
      presentDays++;
    }
  });

  return {
    totalDays: dates.length,
    presentDays,
    absentDays,
    fullLeaveDays,
    halfLeaveDays,
    absenteeism:
      dates.length > 0
        ? ((absentDays / dates.length) * 100).toFixed(1)
        : 0,
  };
}, []);

const fullDayLeaveUsers = useMemo(() => {
  return filteredUsers.filter(user => {
    const attendance = user.attendance_data || {};
    return Object.values(attendance).some(
      d => d.present === 0 && d.leave_type && !d.halfday_period
    );
  });
}, [filteredUsers]);


const halfDayLeaveUsers = useMemo(() => {
  return filteredUsers.filter(user => {
    const attendance = user.attendance_data || {};
    return Object.values(attendance).some(
      d => d.leave_type === "Half Day" || d.halfday_period
    );
  });
}, [filteredUsers]);





  useEffect(() => {
    if (!startDate && !endDate && token) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6); 
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    }
  }, []);

  const fetchWeeklyAttendance = (start, end) => {
    attendenceOfAllUsers(start, end);
  };

useEffect(() => {
  if (!token) return;

  const today = new Date();
  const todayStr = formatLocalDate(today);

  setStartDate(todayStr);
  setEndDate(todayStr);

  attendenceOfAllUsers(todayStr, todayStr);
}, [token]);

useEffect(()=>{
setCurrentPage(1)
},[employeeToggle])
  useEffect(() => {
    if (!token || !startDate || !endDate) return;

    if (
      lastFetchedRange.current.start === startDate &&
      lastFetchedRange.current.end === endDate
    ) return;

    lastFetchedRange.current = { start: startDate, end: endDate };
    attendenceOfAllUsers(startDate, endDate);
  }, [startDate, endDate, token]);





const absentUsers = useMemo(() => {
  return filteredUsers.filter(user => {
    const attendance = user.attendance_data || {};
    return Object.values(attendance).some(d =>
      d.present === 0 ||
      isShortOrHalfLeave(d.leave_type)
    );
  });
}, [filteredUsers]);



const shortLeaveUsers = useMemo(() => {
  return filteredUsers.filter(user => {
    const attendance = user.attendance_data || {};
    return Object.values(attendance).some(
      d => d.leave_type === "Short Leave"
    );
  });
}, [filteredUsers]);


  const presentUsers = useMemo(() => {
    return filteredUsers.filter(user => {
      const summary = getUserSummary(user);
      return summary.absentDays === 0;
    });
  }, [filteredUsers, getUserSummary]);

const currentUsersList = useMemo(() => {
  switch (employeeToggle) {
    case "absent":
      return absentUsers;          // 🔥 parent
    case "full":
      return fullDayLeaveUsers;    // sub
    case "half":
      return halfDayLeaveUsers;    // sub
    case "short":
      return shortLeaveUsers;      // sub
    case "present":
      return presentUsers;
    default:
      return [];
  }
}, [
  employeeToggle,
  absentUsers,
  fullDayLeaveUsers,
  halfDayLeaveUsers,
  shortLeaveUsers,
  presentUsers
]);




  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    const endIndex = startIndex + USERS_PER_PAGE;
    return currentUsersList.slice(startIndex, endIndex);
  }, [currentUsersList, currentPage]);

  const totalPages = Math.ceil(currentUsersList.length / USERS_PER_PAGE);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const setTodayFilter = () => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
  setEndDate(today);
  setIsCustomMode(false);
    setWeekRange({ start: today, end: today });
    fetchWeeklyAttendance(today, today);
    setCurrentPage(1);
  };

  const setYesterdayFilter = () => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const d = y.toISOString().split("T")[0];
    setStartDate(d);
    setEndDate(d);
    setIsCustomMode(false);
    setWeekRange({ start: d, end: d });
    fetchWeeklyAttendance(d, d);
    setCurrentPage(1);
  };


  const setMonthlyFilter = () => {
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
const startStr = formatLocalDate(start);
const endStr = formatLocalDate(end);


  setStartDate(startStr);
  setEndDate(endStr);
  setIsCustomMode(false);

  attendenceOfAllUsers(startStr, endStr);
  setCurrentPage(1);
};



  const openUserModal = (user) => {
    setCalendarData({});      
    setSelectedUser(user);
    setShowModal(true);
  };





  const UserCard = ({ user, summary, onClick }) => {
    const absenceColor =
      summary.absenteeism > 20
        ? "from-red-500/20 to-red-500/5 text-red-600"
        : summary.absenteeism > 10
        ? "from-yellow-500/20 to-yellow-500/5 text-yellow-600"
        : "from-green-500/20 to-green-500/5 text-green-600";


const getUserOverallStatus = (attendance = {}) => {
  const days = Object.values(attendance);

  if (days.some(d => d.leave_type === "Full Leave")) {
    return { label: "Full Leave", color: "bg-purple-100 text-purple-700" };
  }

  if (days.some(d => d.leave_type === "Half Day")) {
    return { label: "Half Day", color: "bg-orange-100 text-orange-700" };
  }

  if (days.some(d => d.leave_type === "Short Leave")) {
    return { label: "Short Leave", color: "bg-blue-100 text-blue-700" };
  }

  if (days.some(d => d.present === 0)) {
    return { label: "Absent", color: "bg-red-100 text-red-600" };
  }

  return { label: "Present", color: "bg-green-100 text-green-600" };
};



    return (
      <div
        onClick={onClick}
        className="
          relative cursor-pointer rounded-xl p-3
          backdrop-blur-xl bg-white/60
          border border-white/30
          shadow-[0_8px_30px_rgba(0,0,0,0.05)]
          hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]
          hover:-translate-y-1
          transition-all duration-300
        "
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow">
              <User className="w-4 h-4" />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">
                {user.user_name}
              </p>
              <p className="text-[10px] text-gray-500">
                ID #{user.user_id}
              </p>
            </div>
          </div>

          <Eye className="w-4 h-4 text-gray-400" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-center mb-4">
          <div className="rounded-xl bg-white/70 border border-gray-100 py-3">
            <p className="text-base font-bold">{summary.absentDays}</p>
            <p className="text-[10px] uppercase text-gray-500">Absent</p>
          </div>

          <div className="rounded-xl bg-white/70 border border-gray-100 py-3">
            <p className="text-base font-bold">{summary.presentDays}</p>
            <p className="text-[10px] uppercase text-gray-500">Present</p>
          </div>
        </div>

{(() => {
  const status = getUserOverallStatus(user.attendance_data);

  return (
    <div
      className={`rounded-xl px-4 py-2 text-sm font-semibold text-center ${status.color}`}
    >
      {status.label}
    </div>
  );
})()}


      </div>
    );
  };

  return (
    <div className='w-full'>
      <SectionHeader
        icon={BarChart}
        title="Leave Reporting"
        subtitle={`${filteredUsers.length} users found`}
      />

      <div className="
        flex flex-wrap items-center gap-4
        rounded-b-xl border border-white/30
        bg-white/70 backdrop-blur-xl
        shadow-[0_8px_30px_rgba(0,0,0,0.06)]
        px-3 py-2
      ">
        <div className="flex flex-wrap items-center gap-2">
          <TodayButton onClick={setTodayFilter} />
          <YesterdayButton onClick={setYesterdayFilter} />
          {/* <WeeklyButton onClick={setWeeklyFilter} /> */}
           <MonthlyButton onClick={setMonthlyFilter} />
        </div>

        <div className="flex-1 min-w-[220px] max-w-md">
          <div className="
            flex items-center gap-2
            rounded-lg border border-gray-200
            bg-white/80 px-3 py-1.5
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

        <div className="flex items-center">
<div className="flex items-center gap-2">

  {/* PARENT */}
  <button
    onClick={() => setEmployeeToggle("absent")}
    className={`
      px-4 py-1.5 rounded-md text-sm font-semibold
      transition-all
      ${
        employeeToggle === "absent"
          ? "bg-red-500 text-white shadow"
          : "bg-red-100 text-red-700 hover:bg-red-200"
      }
    `}
  >
    Absent ({absentUsers.length})
  </button>

  {/* SUB-CATEGORIES */}
  <div className="flex items-center gap-1 pl-3 border-l border-red-300">
    <button
      onClick={() => setEmployeeToggle("full")}
      className={`
        px-3 py-1.5 rounded-md text-xs font-medium
        ${
          employeeToggle === "full"
            ? "bg-purple-500 text-white"
            : "bg-purple-100 text-purple-700 hover:bg-purple-200"
        }
      `}
    >
      Full ({fullDayLeaveUsers.length})
    </button>

    <button
      onClick={() => setEmployeeToggle("half")}
      className={`
        px-3 py-1.5 rounded-md text-xs font-medium
        ${
          employeeToggle === "half"
            ? "bg-orange-500 text-white"
            : "bg-orange-100 text-orange-700 hover:bg-orange-200"
        }
      `}
    >
      Half ({halfDayLeaveUsers.length})
    </button>

    <button
      onClick={() => setEmployeeToggle("short")}
      className={`
        px-3 py-1.5 rounded-md text-xs font-medium
        ${
          employeeToggle === "short"
            ? "bg-blue-500 text-white"
            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
        }
      `}
    >
      Short ({shortLeaveUsers.length})
    </button>
  </div>

  {/* PRESENT (SEPARATE CATEGORY) */}
  <button
    onClick={() => setEmployeeToggle("present")}
    className={`
      ml-3 px-4 py-1.5 rounded-md text-sm font-semibold
      ${
        employeeToggle === "present"
          ? "bg-green-500 text-white shadow"
          : "bg-green-100 text-green-700 hover:bg-green-200"
      }
    `}
  >
    Present ({presentUsers.length})
  </button>

</div>


        </div>

        <div className="ml-auto flex items-center gap-2 text-[12px] text-gray-600">
          <Calendar className="w-3 h-3 text-blue-500" />
          <span>
            <span className="font-semibold text-gray-800">{startDate}</span>
            {" → "}
            <span className="font-semibold text-gray-800">{endDate}</span>
          </span>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {!isLoading && (
        <div className="mt-2">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Users className="w-14 h-14 mb-3 opacity-40" />
              <p className="text-sm">No users found</p>
            </div>
          ) : currentUsersList.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-12">
              No {employeeToggle === "absent" ? "absent" : "present"} employees
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedUsers.map((user) => {
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
              
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
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
            fetchLeavesByUserId={fetchLeavesByUserId}
          attendenceOfAllUsers={attendenceOfAllUsers}
          onClose={() => setShowModal(false)}
        />
      )}

    </div>
  );
};

export default LeaveReporting;
