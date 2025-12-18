import React, { useEffect, useState } from "react";
import { Loader2, Search, BarChart } from "lucide-react";
import {
  YesterdayButton,
  TodayButton,
  WeeklyButton,
  CustomButton,
  ClearButton,
  CancelButton,
  ExportButton,
} from "../../../AllButtons/AllButtons";
import { exportToExcel } from "../../../components/excelUtils";
import Pagination from "../../../components/Pagination";
import { SectionHeader } from "../../../components/SectionHeader";
import { API_URL } from "../../../utils/ApiConfig";
export const Performahistory = () => {
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("name");

  const [isCustomMode, setIsCustomMode] = useState(false);
  const [total, setTotal] = useState(false);
const [showCalendar, setShowCalendar] = useState(false);
const [selectedUser, setSelectedUser] = useState(null);
const [calendarMonth, setCalendarMonth] = useState(new Date());
const [calendarData, setCalendarData] = useState([]); // API result

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const getYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  };

  const [startDate, setStartDate] = useState(getYesterday());
  const [endDate, setEndDate] = useState(getYesterday());

const fetchCalendarData = async (userId, monthDate) => {
  const { start, end } = getMonthRange(monthDate);
  const token = localStorage.getItem("userToken");

  const res = await fetch(
    `${API_URL}/api/get-missing-user-performa-sheet?user_id=${userId}&start_date=${start}&end_date=${end}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const json = await res.json();

  // API gives array of missing dates (strings)
  setCalendarData(new Set(json?.data || []));
};



const fetchUsers = async (start, end) => {
  try {
    setIsLoading(true);
    const token = localStorage.getItem("userToken");

    const params = new URLSearchParams();

    // RANGE → start_date & end_date
    if (start && end && start !== end) {
      params.append("start_date", start);
      params.append("end_date", end);
    } 
    // SINGLE DATE → date
    else {
      const date = start || end || getYesterday();
      params.append("date", date);
      start = date;
      end = date;
    }

    const response = await fetch(
      `${API_URL}/api/get-allusers-unfilled-performa-sheet?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const json = await response.json();

    if (json?.data) {
      const labelDate = start === end ? start : `${start} to ${end}`;

      const mapped = json.data.map((u) => ({
        user_id: u.user_id,
        name: u.name,
        date: labelDate,
        tl_id: u.tl_id,
        tl_name: u.tl_name,
        team_id: u.team_id?.join(", "),
        team_name: u.team_name,
        missing_on: Array.isArray(u.missing_on)? u.missing_on.map(date=>`<br />${date}` ).join(","):u.missing_on||"",
      }));
setTotal(json.count || 0);
      setUserData(mapped);
      setFilteredData(mapped);
    }
  } catch (err) {
    console.error("API error:", err);
  } finally {
    setIsLoading(false);
  }
};




  useEffect(() => {
    fetchUsers(startDate);
  }, []);

useEffect(() => {
  let data = [...userData];

  const q = searchQuery.toLowerCase().trim();

  if (q) {
    data = data.filter((item) => {
      const value = String(item[filterBy] ?? "").toLowerCase();
      return value.includes(q);
    });
  }

  setFilteredData(data);
  setCurrentPage(1);
}, [searchQuery, filterBy, userData]);

const getMonthRange = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
};


  const paginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);


const generateCalendarDays = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push({ empty: true, key: `e-${i}` });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d);
    days.push({
      day: d,
      date: dt.toISOString().split("T")[0],
      weekday: dt.getDay(),
    });
  }

  return days;
};

const isFutureMonth = (date) => {
  const now = new Date();
  return (
    date.getFullYear() > now.getFullYear() ||
    (date.getFullYear() === now.getFullYear() &&
      date.getMonth() > now.getMonth())
  );
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const YEARS = Array.from(
  { length: 6 },
  (_, i) => new Date().getFullYear() - 5 + i
);

const handleMonthYearChange = (month, year) => {
  const newDate = new Date(year, month, 1);

  // ❌ Block future month selection
  if (isFutureMonth(newDate)) return;

  setCalendarMonth(newDate);
  fetchCalendarData(selectedUser.user_id, newDate);
};


  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-md max-h-screen overflow-y-auto">
      <SectionHeader
        icon={BarChart}
        title="Unfilled Performa Sheet Users"
        subtitle="List of users who did not fill their sheet"
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 shadow-md rounded-md">

        {/* Search */}
        <div className="flex items-center gap-3 border p-2 rounded-lg shadow-md bg-white w-full sm:w-[240px]">
          <div className="flex items-center border border-gray-300 px-2 rounded-lg w-full sm:w-[240px]">
            <Search className="h-5 w-5 text-gray-400 mr-2" />
            <input
              type="text"
              className="w-full rounded-lg focus:outline-none py-2"
placeholder={`Search by ${filterBy}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-[184px]"
          >
            <option value="name">User Name</option>
            <option value="tl_name">TL Name</option>
            <option value="team_name">Department Name</option>
          </select>

          {!isCustomMode ? (
            <>
            <TodayButton
  onClick={() => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);
    fetchUsers(today, today);
  }}
/>


           <YesterdayButton
  onClick={() => {
    const y = getYesterday();
    setStartDate(y);
    setEndDate(y);
    fetchUsers(y, y);
  }}
/>


           <WeeklyButton
  onClick={() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);

    const s = start.toISOString().split("T")[0];
    const e = end.toISOString().split("T")[0];

    setStartDate(s);
    setEndDate(e);

    fetchUsers(s, e); // RANGE
  }}
/>


              <CustomButton onClick={() => setIsCustomMode(true)} />
            </>
          ) : (
            <>
                  <input
      type="date"
      className="border border-gray-300 rounded-lg px-4 py-2"
      value={startDate}
      onChange={(e) => {
        const newStart = e.target.value;
        setStartDate(newStart);
        fetchUsers(newStart, endDate || newStart);
      }}
    />

    <input
      type="date"
      className="border border-gray-300 rounded-lg px-4 py-2"
      value={endDate}
      onChange={(e) => {
        const newEnd = e.target.value;
        setEndDate(newEnd);
        fetchUsers(startDate || newEnd, newEnd);
      }}
    />

    <ClearButton
      onClick={() => {
        const y = getYesterday();
        setStartDate(y);
        setEndDate(y);
        setSearchQuery("");
        fetchUsers(y, y);
      }}
    />

    <CancelButton
      onClick={() => {
        const y = getYesterday();
        setIsCustomMode(false);
        setStartDate(y);
        setEndDate(y);
        fetchUsers(y, y);
      }}
    />
            </>
          )}

          <ExportButton
            onClick={() => exportToExcel(filteredData, "unfilled_users.xlsx")}
          />
    <div
        className="bg-gray-100 border border-gray-300 px-2 py-1 rounded shadow cursor-pointer transform transition-transform duration-300 hover:scale-105"
        // onClick={() => handleCategoryClick("no work")}
      >
        <div className="text-sm font-semibold text-gray-700">{("Total")}</div>
        <div className="text-xs text-gray-600 text-center">{total}</div>
      </div>

        </div>
      </div>


      <div className="overflow-x-auto">
        <table className="sm:table-fixed w-full border-collapse">
          <thead >
            <tr className="table-bg-heading text-white whitespace-nowrap sm:whitespace-normal">
              <th className="px-4 py-2 text-center text-sm">Date</th>
              <th className="px-4 py-2 text-center text-sm">User Name</th>
              <th className="px-4 py-2 text-center text-sm">TL Name</th>
              <th className="px-4 py-2 text-center text-sm">Department Name</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="3" className="text-center py-10">
                  <Loader2 className="animate-spin h-8 w-8 mx-auto" />
                </td>
              </tr>
            ) : (
              paginatedData().map((user, idx) => (
                <tr
                  key={idx}
                  onClick={() => {
                    console.log("user", user.user_id);
setSelectedUser(user);
    setCalendarMonth(new Date());
    setShowCalendar(true);
    fetchCalendarData(user.user_id, new Date());
  }}
                  className="hover:bg-blue-50 transition-all text-center whitespace-nowrap sm:whitespace-normal"
                >
<td 
  className="text-xs px-2 py-3 max-w-[120px]" 
  dangerouslySetInnerHTML={{ __html: user.missing_on }}
/>
                  <td className="px-2 py-3 text-xs">{user.name}</td>
                  <td className="px-2 py-3 text-xs">{user.tl_name}</td>
                  <td className="px-2 py-3 text-xs">{user.team_name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    
      <div className="p-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
{showCalendar && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    
    <div className="relative w-full max-w-3xl rounded-3xl 
      bg-white/70 backdrop-blur-xl border border-white/30 
      shadow-[0_20px_60px_rgba(0,0,0,0.25)] p-6">

      {/* Close */}
      <button
        onClick={() => setShowCalendar(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-black transition"
      >
        ✕
      </button>

      {/* User Info */}
      <div className="mb-5 text-center">
        <h2 className="text-xl font-bold tracking-wide text-gray-800">
          {selectedUser?.name}
        </h2>
        <p className="text-xs text-gray-500">
          TAS ID: <span className="font-medium">{selectedUser?.user_id}</span>
        </p>
      </div>

    
<div className="flex items-center justify-center gap-3 mb-5">

  {/* Month */}
  <select
    value={calendarMonth.getMonth()}
    onChange={(e) =>
      handleMonthYearChange(
        Number(e.target.value),
        calendarMonth.getFullYear()
      )
    }
    className="px-4 py-2 rounded-xl bg-white/60 backdrop-blur
      border border-gray-200 shadow-sm text-sm font-medium
      focus:outline-none focus:ring-2 focus:ring-blue-300"
  >
    {MONTHS.map((m, idx) => (
      <option key={m} value={idx}>{m}</option>
    ))}
  </select>

  {/* Year */}
  <select
    value={calendarMonth.getFullYear()}
    onChange={(e) =>
      handleMonthYearChange(
        calendarMonth.getMonth(),
        Number(e.target.value)
      )
    }
    className="px-4 py-2 rounded-xl bg-white/60 backdrop-blur
      border border-gray-200 shadow-sm text-sm font-medium
      focus:outline-none focus:ring-2 focus:ring-blue-300"
  >
    {YEARS.map((y) => (
      <option key={y} value={y}>{y}</option>
    ))}
  </select>

</div>


      {/* Week Days */}
      <div className="grid grid-cols-7 gap-2 text-center mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="grid grid-cols-7 gap-2">
      {generateCalendarDays(calendarMonth).map((day) => {
  if (day.empty) return <div key={day.key} />;

  const isWeekend = day.weekday === 0 || day.weekday === 6;
const isMissing = calendarData instanceof Set && calendarData.has(day.date);

  let bg = "bg-white/60 text-gray-700 border border-gray-200";

  if (isWeekend) {
    bg = "bg-yellow-200/70 text-yellow-900";
  } else if (isMissing) {
    bg = "bg-red-500 text-white";        
  } else {
    bg = "bg-green-500 text-white";      
  }

  return (
    <div
      key={day.date}
      className={`h-12 flex items-center justify-center rounded-xl
        text-sm font-medium shadow-sm transition
        hover:scale-105 ${bg}`}
    >
      {day.day}
    </div>
  );
})}

      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-6 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-green-500"></span> Filled
        </div>
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-red-500"></span> Not Filled
        </div>
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-yellow-300"></span> Weekend
        </div>
      </div>
    </div>
  </div>
)}


    </div>
  );
};
