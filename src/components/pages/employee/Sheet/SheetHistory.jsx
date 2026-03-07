import { useEffect, useState } from "react";
import { useUserContext } from "../../../../components/context/UserContext";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const today = new Date();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

const YEARS = Array.from(
  { length: 6 },
  (_, i) => currentYear - 5 + i
);

const formatLocalDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getMonthRange = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    start: formatLocalDate(start),
    end: formatLocalDate(end),
  };
};

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
      date: formatLocalDate(dt),
      weekday: dt.getDay(),
    });
  }
  return days;
};

// ✅ NEW: API-DRIVEN COLOR LOGIC
const getDayBg = (dayData, day) => {
  // 🔒 1. FUTURE DATES (gray)
  const cellDate = new Date(day.date);
  cellDate.setHours(0, 0, 0, 0);
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  if (cellDate > todayDate) {
    return "bg-gray-300 text-gray-500 cursor-not-allowed";
  }

  // 🟡 2. NON WORKING DAY
  if (dayData?.availability === "Non Working Day") {
    return "bg-yellow-300 text-yellow-900";
  }

  // 🔵 3. SHORT HOLIDAY EVENT
  if (dayData?.holiday_type === "Short Holiday") {
    return "bg-blue-500 text-white";
  }

  // 🟣 4. HOLIDAY WITH HOURS
  const holidayHours = dayData?.holiday_hours || "00:00";
  if (holidayHours !== "00:00") {
    return "bg-indigo-500 text-white";
  }

  // 🟠 5. LEAVE HOURS
  const leaveHours = dayData?.leave_hours || "00:00";
  if (leaveHours !== "00:00") {
    return "bg-orange-500 text-white";
  }

  // 🟢 6. PRESENT (Working + working_hours !== "00:00")
  const workingHours = dayData?.working_hours || "00:00";
  if (dayData?.availability === "Working" && workingHours !== "00:00") {
    return "bg-green-500 text-white";
  }

  // 🔴 7. ABSENT (Working + working_hours === "00:00")
  if (dayData?.availability === "Working" && workingHours === "00:00") {
    return "bg-red-500 text-white";
  }

  // Default
  return "bg-gray-200 text-gray-800";
};

export default function SheetHistory({ onClose }) {
  const {
    fetchPerformaSheetsByDateRange,
    dateRangePerformaSheets,
    loading,
  } = useUserContext();

  const [calendarMonth, setCalendarMonth] = useState(
    new Date(currentYear, currentMonth, 1)
  );

  useEffect(() => {
    const selectedYear = calendarMonth.getFullYear();
    const selectedMonth = calendarMonth.getMonth();

    if (
      selectedYear > currentYear ||
      (selectedYear === currentYear && selectedMonth > currentMonth)
    ) {
      setCalendarMonth(new Date(currentYear, currentMonth, 1));
      return;
    }

    const { start, end } = getMonthRange(calendarMonth);
    fetchPerformaSheetsByDateRange(start, end);
  }, [calendarMonth]);

  const handleMonthYearChange = (month, year) => {
    const newDate = new Date(year, month, 1);
    if (
      year > currentYear ||
      (year === currentYear && month > currentMonth)
    ) {
      return;
    }
    setCalendarMonth(newDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-3xl rounded-3xl bg-white/70 backdrop-blur-xl border shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-center mb-4">
          Monthly Sheet History
        </h2>

        <div className="flex justify-center gap-3 mb-5">
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

        <div className="grid grid-cols-7 gap-2">
          {generateCalendarDays(calendarMonth).map((day) => {
            if (day.empty) return <div key={day.key} />;

            const dayData = dateRangePerformaSheets?.[day.date];
            const bg = getDayBg(dayData, day);
            
            const workingHours = dayData?.working_hours || "00:00";
            const leaveHours = dayData?.leave_hours || "00:00";
            const holidayHours = dayData?.holiday_hours || "00:00";
            const isFuture = new Date(day.date) > new Date();

            return (
              <div
                key={day.date}
                className={`relative group h-12 rounded-xl flex flex-col items-center justify-center text-xs font-medium shadow-sm hover:scale-105 transition-all cursor-pointer ${bg}`}
              >
                <span>{day.day}</span>
                
                {!isFuture && (
                  <div className="absolute bottom-14 left-1/2 -translate-x-1/2 hidden group-hover:block w-64 rounded-lg bg-black text-white text-[10px] px-3 py-2 shadow-lg z-50 whitespace-pre-wrap max-w-64">
                    <p><b>Date:</b> {day.date}</p>
                    <p><b>Status:</b> {dayData?.availability}</p>
                    
                    {dayData?.holiday_type && (
                      <>
                        <p><b>Holiday:</b> {dayData.holiday_type}</p>
                        {dayData.holiday_description && (
                          <p><b>Desc:</b> {dayData.holiday_description}</p>
                        )}
                      </>
                    )}
                    
                    {holidayHours !== "00:00" && (
                      <p><b>Holiday Hours:</b> {holidayHours}</p>
                    )}
                    
                    {leaveHours !== "00:00" && (
                      <p><b>Leave Hours:</b> {leaveHours}</p>
                    )}
                    
                    {workingHours !== "00:00" && (
                      <p><b>Worked:</b> {workingHours}</p>
                    )}
                    
                    {dayData?.unfilled_hours && dayData.unfilled_hours !== "00:00" && (
                      <p><b>Unfilled:</b> {dayData.unfilled_hours}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs text-gray-700">
          <Legend color="bg-yellow-300" label="Non Working Day" />
          <Legend color="bg-green-500" label="Present (Worked)" />
          <Legend color="bg-red-500" label="Absent" />
          <Legend color="bg-orange-500" label="Leave" />
          <Legend color="bg-blue-500" label="Short Holiday" />
          <Legend color="bg-indigo-500" label="Holiday w/ Hours" />
          <Legend color="bg-gray-300" label="Future" />
        </div>

        {loading && (
          <p className="text-center text-sm text-gray-500 mt-3">
            Loading...
          </p>
        )}
      </div>
    </div>
  );
}

const Legend = ({ color, label }) => (
  <div className="flex items-center gap-1">
    <span className={`h-3 w-3 rounded ${color}`} />
    {label}
  </div>
);
