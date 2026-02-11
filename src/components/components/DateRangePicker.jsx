import React, { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";


const formatLocalDate = (date) => {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().split("T")[0];
};

const stripTime = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const presets = [
  {
    label: "Today",
 getRange: () => {
  const d = formatLocalDate(new Date());
  return { start: d, end: d };
},

  },
  
{
  label: "This Week",
  getRange: () => {
    const now = stripTime(new Date());

    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());

    const weekEnd = new Date(start);
    weekEnd.setDate(start.getDate() + 6);

    const end = weekEnd > now ? now : weekEnd;

    return {
      start: formatLocalDate(start),
      end: formatLocalDate(end),
    };
  },
},

{
  label: "This Month",
  getRange: () => {
    const today = stripTime(new Date());

    const start = new Date(today.getFullYear(), today.getMonth(), 1);

    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const end = monthEnd > today ? today : monthEnd;

    return {
      start: formatLocalDate(start),
      end: formatLocalDate(end),
    };
  },
},


];

const DateRangePicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
const [temp, setTemp] = useState(
  value || { start: "", end: "" }
);

  const ref = useRef(null);
const today = formatLocalDate(new Date());

useEffect(() => {
  setTemp(value ?? { start: "", end: "" });
}, [value]);

useEffect(() => {
  if (!open) return;

  const onKey = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  document.addEventListener("keydown", onKey);
  return () => document.removeEventListener("keydown", onKey);
}, [open]);

useEffect(() => {
  if (!open) return;

  const handleClickOutside = (e) => {
    const el = ref.current;
    if (!el) return;

    // if clicked inside → do nothing
    if (el.contains(e.target)) return;

    setOpen(false);
  };

  const handleEsc = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  document.addEventListener("pointerdown", handleClickOutside);
  document.addEventListener("keydown", handleEsc);

  return () => {
    document.removeEventListener("pointerdown", handleClickOutside);
    document.removeEventListener("keydown", handleEsc);
  };
}, [open]);





  const label =
    value.start && value.end
      ? `${value.start} → ${value.end}`
      : "Date Range";

  return (
    <div ref={ref} data-datepicker className="relative">
      {/* FIELD */}
      <button
  onMouseDown={(e) => e.preventDefault()}
  onClick={() => setOpen(!open)}        className="w-full h-[35px] flex items-center gap-2 px-3 rounded-lg
                   bg-white/90 border border-sky-300 text-sm text-gray-700
                   shadow-sm hover:bg-white transition"
      >
        <Calendar className="h-4 w-4 text-gray-400" />

        <span
          title={label}
          className={`flex-1 truncate ${
            value.start ? "text-gray-800" : "text-gray-400"
          }`}
        >
          {label}
        </span>
      </button>

      {/* POPOVER */}
      {open && (
        <div    onPointerDown={(e) => e.stopPropagation()}
 className="absolute z-[9999] mt-2 w-80 rounded-2xl bg-white border border-sky-200 shadow-xl p-4 space-y-3">
          {/* PRESETS */}
          <div className="flex gap-2 flex-wrap">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  const range = p.getRange();
                  setTemp(range);
                  onChange(range);
                  setOpen(false);
                }}
                className="px-3 py-1.5 rounded-lg text-xs bg-sky-100 text-sky-700 hover:bg-sky-200"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* DATE INPUTS */}
          <div className="grid grid-cols-2 gap-2">
            {/* START */}
            <input
              // ref={startRef}
              type="date"
              max={today}
              value={temp.start}
              // onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => {
                const start = e.target.value;

                setTemp((prev) => ({
                  ...prev,
                  start,
                  end:
                    prev.end && prev.end < start
                      ? ""
                      : prev.end,
                }));

              }}
              className="date-input"
            />

            {/* END */}
            <input
              // ref={endRef}
              type="date"
              max={today}
              min={temp.start}
              value={temp.end}
              // onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => {
                const end = e.target.value;

                const finalRange = {
                  start: temp.start,
                  end,
                };

                setTemp(finalRange);
                onChange(finalRange);

                // ⭐ AUTO CLOSE
                // setOpen(false);
              }}
              className="date-input"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => {
                setTemp({ start: "", end: "" });
                onChange({ start: "", end: "" });
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>

            <button
              onClick={() => {
                onChange(temp);
                setOpen(false);
              }}
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
