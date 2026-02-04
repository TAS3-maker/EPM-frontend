import React from "react";
import { Info } from "lucide-react";

const TONES = {
  indigo: { text: "text-indigo-700", active: "bg-indigo-500/10 ring-1 ring-indigo-400/50" },
  green: { text: "text-emerald-700", active: "bg-emerald-500/10 ring-1 ring-emerald-400/50" },
  violet:{ text: "text-violet-700", active: "bg-violet-500/10 ring-1 ring-violet-400/50" },
  orange:{ text: "text-orange-700", active: "bg-orange-500/10 ring-1 ring-orange-400/50" },
  amber:{ text: "text-amber-700", active: "bg-amber-500/10 ring-1 ring-amber-400/50" },
  red:   { text: "text-rose-700", active: "bg-rose-500/10 ring-1 ring-rose-400/50" },
  gray:  { text: "text-gray-700", active: "bg-gray-500/10 ring-1 ring-gray-400/40" },
};

const METRIC_HELP = {
  approved_billable: { title: "Approved Billable", description: "Approved billable hours." },
  approved_inhouse: { title: "Approved Inhouse", description: "Approved internal hours." },
  no_work: { title: "Approved No Work", description: "Approved no-work hours." },
  pending: { title: "Pending Hours", description: "Awaiting approval." },
  backdated: { title: "Backdated Hours", description: "Submitted for past dates." },
  rejected: { title: "Rejected Hours", description: "Rejected entries." },
  utilization: {
    title: "Utilization %",
    description: "(Billable + Inhouse) ÷ Total Approved × 100",
  },
  unfilled: {
    title: "Unfilled Sheets",
    description: "Users with missing timesheets.",
  },
};

const MetricsGrid = ({ metrics, activeKey, onMetricClick }) => {
  const [openInfoKey, setOpenInfoKey] = React.useState(null);

  React.useEffect(() => {
    const close = () => setOpenInfoKey(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <div className="relative overflow-visible">
<div
  className="
    flex gap-2
    overflow-x-auto pb-1 scrollbar-hide
    md:justify-evenly
  "
>
        {metrics.map((m) => {
          const numericValue = Number(m.value);
          const hasValidValue = Number.isFinite(numericValue);

          let toneKey = m.tone || "gray";
          if (m.type === "utilization") {
            toneKey =
              numericValue >= 90 ? "green" : numericValue >= 70 ? "amber" : "red";
          }

          const tone = TONES[toneKey] || TONES.gray;
          const isActive = activeKey === m.key;
          const isInfoOpen = openInfoKey === m.key;

          return (
            <div
              key={m.key}
              onClick={() => !isInfoOpen && onMetricClick?.(m.key)}
              className={`
                relative shrink-0 w-[140px]
                ${isInfoOpen ? "min-h-[64px]" : "h-[64px]"}
                rounded-lg border px-3 py-2
                bg-white/70 backdrop-blur
                transition-all duration-200

                cursor-pointer
                ${isActive ? tone.active : "hover:bg-gray-50"}
              `}
            >
              {/* INFO ICON */}
                    {!isInfoOpen && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenInfoKey(isInfoOpen ? null : m.key);
                }}
                className="absolute top-1 right-1 p-1 rounded hover:bg-black/5"
              >
                <Info className="h-3 w-3 text-gray-400" />
              </button>
                    )}

              {/* ================= NORMAL VIEW ================= */}
              {!isInfoOpen && (
                <div className="flex flex-col gap-1">
                  <p className="text-[9px] uppercase tracking-wide text-gray-500 truncate">
                    {m.label}
                  </p>

                  <p className={`text-lg font-semibold leading-none ${tone.text}`}>
                    {hasValidValue ? numericValue : "--"}
                    {m.type === "utilization" && hasValidValue && "%"}
                  </p>

                  {m.type === "utilization" && hasValidValue && (
                    <div className="h-[3px] w-full rounded-full bg-black/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-current"
                        style={{
                          width: `${Math.min(Math.max(numericValue, 0), 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ================= DETAILS VIEW ================= */}
              {isInfoOpen && METRIC_HELP[m.key] && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-[11px] font-semibold text-gray-800 leading-tight">
                      {METRIC_HELP[m.key].title}
                    </p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenInfoKey(null);
                      }}
                      className="text-[11px] text-gray-400 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-[10px] leading-tight text-gray-600">
                    {METRIC_HELP[m.key].description}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MetricsGrid;
