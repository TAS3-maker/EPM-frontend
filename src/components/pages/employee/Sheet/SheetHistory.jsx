import { useEffect, useState } from "react";
import { useUserContext } from "../../../../components/context/UserContext";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const YEARS = Array.from(
  { length: 6 },
  (_, i) => new Date().getFullYear() - 5 + i
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

  const [calendarMonth, setCalendarMonth] = useState(new Date());

  useEffect(() => {
    const { start, end } = getMonthRange(calendarMonth);
    fetchPerformaSheetsByDateRange(start, end);
  }, [calendarMonth]);

  const handleMonthYearChange = (month, year) => {
    const newDate = new Date(year, month, 1);
    if (newDate > new Date()) return; // block future
    setCalendarMonth(newDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-3xl 
        bg-white/70 backdrop-blur-xl border border-white/30 
        shadow-[0_20px_60px_rgba(0,0,0,0.25)] p-6">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-center mb-4">
          Monthly Sheet History
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
        <div className="grid grid-cols-7 gap-2">
{generateCalendarDays(calendarMonth).map((day) => {
  if (day.empty) return <div key={day.key} />;

  const dayData = dateRangePerformaSheets?.[day.date];

  const isWeekend = day.weekday === 0 || day.weekday === 6;
  const isLeave = dayData?.availability === "On Leave";

  const hasHours =
    dayData &&
    dayData.totalHours &&
    dayData.totalHours !== "00:00";

  let bg = "bg-red-500 text-white"; // default: not filled

  // 🟡 Weekend without work
  if (isWeekend && !hasHours) {
    bg = "bg-yellow-300 text-yellow-900";
  }

  // 🔵 Weekend with work (EXTRA WORK)
  if (isWeekend && hasHours) {
    bg = "bg-cyan-600 text-white";
  }

  // 🟣 Leave (highest priority)
  if (isLeave) {
    bg = "bg-purple-500 text-white";
  }

  // 🟢 Weekday filled
  if (!isWeekend && hasHours) {
    bg = "bg-green-500 text-white";
  }

  return (
    <div
      key={day.date}
      className={`relative group h-12 rounded-xl flex flex-col 
        items-center justify-center text-xs font-medium shadow-sm ${bg}`}
    >
      <span>{day.day}</span>

      {hasHours && (
        <span className="text-[10px]">
          {dayData.totalHours}
        </span>
      )}

      {/* Tooltip */}
      {dayData && (
        <div className="
          absolute bottom-14 left-1/2 -translate-x-1/2
          hidden group-hover:block
          w-48 rounded-lg bg-black text-white text-[10px]
          px-2 py-1 shadow-lg z-50
        ">
          <p><b>Date:</b> {day.date}</p>

          {isWeekend && hasHours && (
            <p className="text-cyan-300 font-semibold">
              Extra Work (Weekend)
            </p>
          )}

          {isLeave ? (
            <>
              <p><b>Leave:</b> {dayData.leave_type}</p>
              <p><b>Leave Hours:</b> {dayData.leave_hours}</p>
            </>
          ) : (
            <>
              <p><b>Total:</b> {dayData.totalHours}</p>
              <p><b>Billable:</b> {dayData.totalBillableHours}</p>
              <p><b>Non-Billable:</b> {dayData.totalNonBillableHours}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
})}


        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 mt-6 text-xs text-gray-700">
          <Legend color="bg-green-500" label="Filled" />
          <Legend color="bg-red-500" label="Not Filled" />
          <Legend color="bg-yellow-300" label="Weekend" />
          <Legend color="bg-purple-500" label="Leave" />
            <Legend color="bg-cyan-600" label="Extra Work (Weekend)" />

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
