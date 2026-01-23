import { Eye } from "lucide-react";

const TONES = {
  indigo: {
    text: "text-indigo-800",
    shadow: "shadow-[0_8px_30px_rgba(79,70,229,0.35)]",
    active: "ring-2 ring-indigo-400/60 bg-indigo-500/15",
    hoverBg: "group-hover:bg-indigo-500/15"
  },
  green: {
    text: "text-emerald-800",
    shadow: "shadow-[0_8px_30px_rgba(16,185,129,0.35)]",
    active: "ring-2 ring-emerald-400/60 bg-emerald-500/15",
    hoverBg: "group-hover:bg-emerald-500/15"
  },
  violet: {
    text: "text-violet-800",
    shadow: "shadow-[0_8px_30px_rgba(139,92,246,0.35)]",
    active: "ring-2 ring-violet-400/60 bg-violet-500/15",
    hoverBg: "group-hover:bg-violet-500/15"
  },
  orange: {
    text: "text-orange-700",
    shadow: "shadow-[0_8px_30px_rgba(249,115,22,0.35)]",
    active: "ring-2 ring-orange-400/60 bg-orange-500/15",
    hoverBg: "group-hover:bg-orange-500/15"
  },
  blue: {
    text: "text-sky-800",
    shadow: "shadow-[0_8px_30px_rgba(14,165,233,0.35)]",
    active: "ring-2 ring-sky-400/60 bg-sky-500/15",
    hoverBg: "group-hover:bg-sky-500/15"
  },
  amber: {
    text: "text-amber-700",
    shadow: "shadow-[0_8px_30px_rgba(245,158,11,0.35)]",
    active: "ring-2 ring-amber-400/60 bg-amber-500/15",
    hoverBg: "group-hover:bg-amber-500/15"
  },
  red: {
    text: "text-rose-800",
    shadow: "shadow-[0_8px_30px_rgba(244,63,94,0.35)]",
    active: "ring-2 ring-rose-400/60 bg-rose-500/15",
    hoverBg: "group-hover:bg-rose-500/15"
  },
  gray: {
    text: "text-gray-800",
    shadow: "shadow-[0_8px_30px_rgba(0,0,0,0.25)]",
    active: "ring-2 ring-gray-400/60 bg-gray-500/10",
    hoverBg: "group-hover:bg-gray-500/10"
  }
};

const MetricsGrid = ({ metrics, activeKey, onMetricClick }) => {
  return (
    <div className="grid grid-cols-4 gap-3">
      {metrics.map((m) => {
        let resolvedTone = m.tone;

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
              group relative cursor-pointer rounded-xl p-3
              bg-white/15 backdrop-blur-lg
              border border-white/20
              transition-all duration-300
              ${tone.shadow}
              ${isActive ? tone.active : tone.hoverBg}
            `}
          >
            <p className="text-[10px] uppercase tracking-wide text-gray-500">
              {m.label ?? "Metric"}
            </p>

            <div className="mt-2 flex items-end justify-between">
              <p className={`text-xl font-medium ${tone.text}`}>
                {m.value}
                {m.type === "utilization" && "%"}
              </p>

              <Eye
                className={`
                  h-3.5 w-3.5 text-gray-600 transition-opacity
                  ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                `}
              />
            </div>

            {m.type === "utilization" && (
              <div className="mt-2 h-1 w-full rounded-full bg-black/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-current"
                  style={{ width: `${m.value}%` }}
                />
              </div>
            )}

            {/* ACTIVE badge */}
            {isActive && (
              <span className="absolute top-2 right-2 text-[9px] font-semibold text-gray-600">
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
