import React, { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";

const presets = [
  { label: "Today", getRange: () => {
    const d = new Date().toISOString().slice(0,10);
    return { start: d, end: d };
  }},
  { label: "This Week", getRange: () => {
    const now = new Date();
    const start = new Date(now.setDate(now.getDate() - now.getDay()));
    const end = new Date(start); end.setDate(start.getDate() + 6);
    return {
      start: start.toISOString().slice(0,10),
      end: end.toISOString().slice(0,10)
    };
  }},
  { label: "This Month", getRange: () => {
    const d = new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return {
      start: start.toISOString().slice(0,10),
      end: end.toISOString().slice(0,10)
    };
  }},
];

const DateRangePicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const handler = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const label =
    value.start && value.end
      ? `${value.start} → ${value.end}`
      : "Date Range";

  return (
    <div ref={ref} className="relative">
      {/* FIELD */}
   <button
  onClick={() => setOpen(!open)}
className="w-full h-[40px] flex items-center gap-2 
           overflow-hidden
           px-3 rounded-xl
           bg-white/90 border border-sky-300
           text-sm text-gray-700
           shadow-sm hover:bg-white transition"

>

        <Calendar className="h-4 w-4 text-gray-400" />
     <span
  title={label}
  className={`flex-1 min-w-0 truncate whitespace-nowrap
    ${value.start ? "text-gray-800" : "text-gray-400"}`}
>
  {label}
</span>

      </button>

      {/* POPOVER */}
      {open && (
        <div className="absolute z-30 mt-2 w-80 rounded-2xl bg-white/80 border border-sky-200 shadow-xl backdrop-blur-xl p-4 space-y-3">

          {/* PRESETS */}
          <div className="flex gap-2 flex-wrap">
            {presets.map(p => (
              <button
                key={p.label}
                onClick={() => {
                  onChange(p.getRange());
                  setOpen(false);
                }}
                className="px-3 py-1.5 rounded-lg text-xs bg-sky-100 text-sky-700 hover:bg-sky-200"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* RANGE */}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
                max={today}  
              value={value.start}
              onChange={e => onChange({ ...value, start: e.target.value })}
              className="date-input"
            />
            <input
              type="date"
                max={today}  
              value={value.end}
              min={value.start}
              onChange={e => onChange({ ...value, end: e.target.value })}
              className="date-input"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => onChange({ start: "", end: "" })}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-1.5 rounded-lg bg-sky-500 text-white text-xs hover:bg-sky-600"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
