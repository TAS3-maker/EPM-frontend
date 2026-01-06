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

const getMonthRange = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
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
      date: dt.toISOString().split("T")[0],
      weekday: dt.getDay(),
    });
  }

  return days;
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

    // 🔒 HARD BLOCK FUTURE MONTHS
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
      return; // ⛔ block future
    }

    setCalendarMonth(newDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white/70 backdrop-blur-xl border shadow-xl p-6">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-center mb-4">
          Monthly Sheet History
        </h2>

        {/* Month / Year */}
        <div className="flex justify-center gap-3 mb-5">
          {/* MONTH */}
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

          {/* YEAR */}
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

        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-2 text-center mb-2">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
            <div key={d} className="text-xs font-semibold text-gray-500">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div className="grid grid-cols-7 gap-2">
          {generateCalendarDays(calendarMonth).map((day) => {
            if (day.empty) return <div key={day.key} />;

            const dayData = dateRangePerformaSheets?.[day.date];

            const cellDate = new Date(day.date);
            cellDate.setHours(0, 0, 0, 0);

            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);

            const isFuture = cellDate > todayDate;
            const isWeekend = day.weekday === 0 || day.weekday === 6;

            const isLeave =
              dayData?.availability === "On Leave" ||
              (dayData?.leave_hours && dayData.leave_hours !== "00:00");

            const isPresent =
              dayData?.working_hours && dayData.working_hours !== "00:00";

            let bg = "bg-red-500 text-white"; // Absent

            if (isFuture) bg = "bg-gray-300 text-gray-500 cursor-not-allowed";
            else if (isLeave) bg = "bg-purple-500 text-white";
            else if (isWeekend && isPresent) bg = "bg-cyan-600 text-white";
            else if (isWeekend) bg = "bg-yellow-300 text-yellow-900";
            else if (isPresent) bg = "bg-green-500 text-white";

            return (
              <div
                key={day.date}
                className={`relative group h-12 rounded-xl flex flex-col items-center justify-center text-xs font-medium shadow-sm ${bg}`}
              >
                <span>{day.day}</span>

                {!isFuture && isPresent && (
                  <span className="text-[10px]">
                    {dayData.working_hours}
                  </span>
                )}

                {!isFuture && dayData && (
                  <div className="absolute bottom-14 left-1/2 -translate-x-1/2 hidden group-hover:block w-44 rounded-lg bg-black text-white text-[10px] px-2 py-1 shadow-lg z-50">
                    <p><b>Date:</b> {day.date}</p>

                    {isLeave ? (
                      <>
                        <p><b>Status:</b> Leave</p>
                        <p><b>Leave Hours:</b> {dayData.leave_hours}</p>
                      </>
                    ) : isPresent ? (
                      <>
                        <p><b>Status:</b> Present</p>
                        <p><b>Working Hours:</b> {dayData.working_hours}</p>
                      </>
                    ) : (
                      <p><b>Status:</b> Absent</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs text-gray-700">
          <Legend color="bg-green-500" label="Present" />
          <Legend color="bg-red-500" label="Absent" />
          <Legend color="bg-purple-500" label="Leave" />
          <Legend color="bg-yellow-300" label="Weekend" />
          <Legend color="bg-cyan-600" label="Weekend Worked" />
          <Legend color="bg-gray-300" label="Future Date" />
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
