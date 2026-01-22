import React from "react";
import { Eye, Info } from "lucide-react";

const TONES = {
  indigo: {
    text: "text-indigo-800",
    shadow: "shadow-[0_8px_30px_rgba(79,70,229,0.35)]",
    active: "ring-2 ring-indigo-400/60 bg-indigo-500/15",
        ribbon: "bg-indigo-700",
    hoverBg: "group-hover:bg-indigo-500/15"
  },
  green: {
    text: "text-emerald-800",
    shadow: "shadow-[0_8px_30px_rgba(16,185,129,0.35)]",
    active: "ring-2 ring-emerald-400/60 bg-emerald-500/15",
        ribbon: "bg-emerald-700",
    hoverBg: "group-hover:bg-emerald-500/15"
  },
  violet: {
    text: "text-violet-800",
    shadow: "shadow-[0_8px_30px_rgba(139,92,246,0.35)]",
    active: "ring-2 ring-violet-400/60 bg-violet-500/15",
         ribbon: "bg-violet-700",
    hoverBg: "group-hover:bg-violet-500/15"
  },
  orange: {
    text: "text-orange-700",
    shadow: "shadow-[0_8px_30px_rgba(249,115,22,0.35)]",
    active: "ring-2 ring-orange-400/60 bg-orange-500/15",
       ribbon: "bg-orange-700",
    hoverBg: "group-hover:bg-orange-500/15"
  },
  blue: {
    text: "text-sky-800",
    shadow: "shadow-[0_8px_30px_rgba(14,165,233,0.35)]",
    active: "ring-2 ring-sky-400/60 bg-sky-500/15",
       ribbon: "bg-sky-700",
    hoverBg: "group-hover:bg-sky-500/15"
  },
  amber: {
    text: "text-amber-700",
    shadow: "shadow-[0_8px_30px_rgba(245,158,11,0.35)]",
    active: "ring-2 ring-amber-400/60 bg-amber-500/15",
       ribbon: "bg-amber-700",
    hoverBg: "group-hover:bg-amber-500/15"
  },
  red: {
    text: "text-rose-800",
    shadow: "shadow-[0_8px_30px_rgba(244,63,94,0.35)]",
    active: "ring-2 ring-rose-400/60 bg-rose-500/15",
       ribbon: "bg-rose-700",
    hoverBg: "group-hover:bg-rose-500/15"
  },
  gray: {
    text: "text-gray-800",
    shadow: "shadow-[0_8px_30px_rgba(0,0,0,0.25)]",
    active: "ring-2 ring-gray-400/60 bg-gray-500/10",
       ribbon: "bg-gray-700",
    hoverBg: "group-hover:bg-gray-500/10"
  }
};

/* ================= METRIC INFO ================= */
const METRIC_HELP = {
  approved_billable: {
    title: "Approved Billable",
    description:
      "Approved hours spent on billable client work. These hours are chargeable to the client."
  },
  approved_inhouse: {
    title: "Approved Inhouse",
    description:
      "Approved internal hours such as meetings, planning, training, or internal tasks."
  },
  no_work: {
    title: "Approved No Work",
    description:
      "Approved time where no active work was done (leave, holidays, idle or no-work entries)."
  },
  pending: {
    title: "Pending Hours",
    description:
      "Hours submitted by employees that are still awaiting approval."
  },
backdated: {
  title: "Backdated Hours",
  description:
    "Hours that were entered or submitted for dates in the past, after the actual work date."
}
,
  rejected: {
    title: "Rejected Hours",
    description:
      "Hours that were reviewed and rejected by the manager or admin."
  },
  utilization: {
    title: "Utilization %",
    description:
      "Productivity percentage.\n\nFormula:\n(Billable + Inhouse) ÷ (Billable + Inhouse + No Work) × 100"
  },
unfilled: {
    title: "Unfilled Sheets",
    description:
      "Employees who have not submitted their timesheets for one or more required working days. " +
      "These missing entries indicate incomplete reporting and may impact approvals, payroll, and utilization metrics."
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
    <div className="grid grid-cols-4 gap-3">
      {metrics.map((m) => {
        let resolvedTone = m.tone;
const numericValue = Number(m.value);
const hasValidValue = Number.isFinite(numericValue);

        if (m.type === "utilization") {
          resolvedTone =
            m.value >= 90 ? "green" : m.value >= 70 ? "amber" : "red";
        }

        if (!TONES[resolvedTone]) resolvedTone = "gray";
        const tone = TONES[resolvedTone];
        const isActive = activeKey === m.key;

        return (
          <div
            key={m.key}
            onClick={() => onMetricClick?.(m.key)}
            className={`
                relative ${openInfoKey === m.key ? "z-50" : "z-10"}
              group relative cursor-pointer rounded-xl p-3
              bg-white/15 backdrop-blur-lg
              border border-white/20
              transition-all duration-300
              ${tone.shadow}
   ${isActive ? tone.activeBg : tone.hoverBg}

            `}
          >
            {/* INFO ICON */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenInfoKey(openInfoKey === m.key ? null : m.key);
              }}
              className="absolute top-2 right-2 p-1 rounded-full
                         hover:bg-black/5 transition"
            >
              <Info className="h-3.5 w-3.5 text-gray-500" />
            </button>

            <p className="text-[10px] uppercase tracking-wide text-gray-500">
              {m.label ?? "Metric"}
            </p>

            <div className="mt-2 flex items-end justify-between">
            <p className={`text-xl font-medium ${tone.text}`}>
  {hasValidValue ? numericValue : "--"}
  {m.type === "utilization" && hasValidValue && "%"}
</p>


              {/* <Eye
                className={`
                  h-3.5 w-3.5 text-gray-600 transition-opacity
                  ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                `}
              /> */}
            </div>

           {m.type === "utilization" && hasValidValue && (
  <div className="mt-2 h-1 w-full rounded-full bg-black/10 overflow-hidden">
    <div
      className="h-full rounded-full bg-current transition-all"
      style={{ width: `${Math.min(Math.max(numericValue, 0), 100)}%` }}
    />
  </div>
)}



            {openInfoKey === m.key && METRIC_HELP[m.key] && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute z-20 top-8 right-2 w-64

                           rounded-xl border border-gray-200
                           bg-white shadow-xl p-3 text-xs text-gray-700"
              >
                <p className="font-semibold text-gray-800 mb-1">
                  {METRIC_HELP[m.key].title}
                </p>
                <p className="whitespace-pre-line text-gray-600">
                  {METRIC_HELP[m.key].description}
                </p>
              </div>
            )}

  {isActive && (
  <span
    className={`
      absolute -top-1 -left-1
      px-3 py-[2px]
      text-[9px] font-semibold text-white
      rounded-br-lg rounded-tl-xl
      ${tone.ribbon}
      shadow-md
    `}
  >
    ACTIVE
  </span>
)}

          </div>
        );
      })}
    </div>
  );
};

export default MetricsGrid;
