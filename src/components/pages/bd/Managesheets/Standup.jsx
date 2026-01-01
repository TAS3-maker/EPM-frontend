import React, { useEffect, useMemo, useState } from "react";
import { Clipboard, BarChart, Calendar } from "lucide-react";
import { SectionHeader } from "../../../components/SectionHeader";
import {
  TodayButton,
  YesterdayButton,
  WeeklyButton,
  CustomButton,
  ClearButton,
  CancelButton,
} from "../../../AllButtons/AllButtons";
import { useBDProjectsAssigned } from "../../../context/BDProjectsassigned";

const CategoryBlock = ({ title, color, items }) => {
  const rows = Array.isArray(items) ? items : [];

  const colorMap = {
    green: {
      border: "border-green-500",
      header: "bg-green-50 text-green-700",
    },
    indigo: {
      border: "border-indigo-500",
      header: "bg-indigo-50 text-indigo-700",
    },
    red: {
      border: "border-red-500",
      header: "bg-red-50 text-red-700",
    },
  };

  return (
    <div className={`mt-5 rounded-xl border ${colorMap[color].border} overflow-hidden`}>
      
      {/* TABLE HEADER */}
      <div
        className={`px-4 py-2 text-sm font-semibold flex justify-between ${colorMap[color].header}`}
      >
        <span>{title}</span>
        <span className="text-xs font-medium text-gray-500">
          {rows.length} {rows.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {/* TABLE BODY */}
      {rows.length > 0 ? (
        <div className="divide-y divide-gray-100 bg-white">
          {rows.map((i, idx) => {
            const hrs = String(Math.floor(i.minutes / 60)).padStart(2, "0");
            const mins = String(i.minutes % 60).padStart(2, "0");

            return (
              <div
                key={idx}
                className="grid grid-cols-12 gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition"
              >
                {/* PROJECT */}
                <div className="col-span-6 font-medium text-gray-900 truncate">
                  {i.project}
                </div>

                {/* USER */}
                <div className="col-span-4 text-gray-600 truncate">
                  {i.user}
                </div>

                {/* HOURS */}
                <div className="col-span-2 text-right font-semibold text-gray-800">
                  {hrs}:{mins}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-4 text-sm italic text-gray-400 bg-white">
          No entries available
        </div>
      )}
    </div>
  );
};





const Standup = () => {
  const { fetchStandupPerformanceDetails, standupPerformanceData } =
    useBDProjectsAssigned();

  const today = new Date().toISOString().split("T")[0];

  const [isCustomMode, setIsCustomMode] = useState(false);
  const [date, setDate] = useState(today);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  /* ---------------- API CALL ---------------- */
  useEffect(() => {
    if (isCustomMode) {
      fetchStandupPerformanceDetails({
        start_date: startDate,
        end_date: endDate,
      });
    } else {
      fetchStandupPerformanceDetails({ date });
    }
  }, [date, startDate, endDate, isCustomMode]);

  /* ---------------- DATA TRANSFORM ---------------- */
/* ---------------- DATA TRANSFORM (FIXED) ---------------- */
const { blocks, summary, copyText } = useMemo(() => {
  const managers = {};
  let totalMinutes = 0;
let billableMinutes = 0;
let inHouseMinutes = 0;
let othersMinutes = 0;


  standupPerformanceData?.forEach(user => {
    user?.sheets?.forEach(sheet => {
      const pmList =
        Array.isArray(sheet.project_managers) && sheet.project_managers.length
          ? sheet.project_managers
          : [{ name: "Global / Others" }];

      pmList.forEach(pmObj => {
        const pm = pmObj.name;

        if (!managers[pm]) {
          managers[pm] = {
            billable: {},
            inHouse: {},
            others: {},
          };
        }

        const key = `${sheet.project_name}__${user.user_name}`;
        const minutes = 8 * 60; // TODO: replace with real API hours later

        totalMinutes += minutes;

        switch (sheet.activity_type?.toLowerCase()) {
          case "billable":
            managers[pm].billable[key] =
              (managers[pm].billable[key] || 0) + minutes;
                billableMinutes += minutes;

            break;

          case "inhouse":
            managers[pm].inHouse[key] =
              (managers[pm].inHouse[key] || 0) + minutes;
              
            inHouseMinutes += minutes;
            break;

          default:
            managers[pm].others[key] =
              (managers[pm].others[key] || 0) + minutes;
            othersMinutes += minutes;
        }
      });
    });
  });

  const normalize = obj =>
    Object.entries(obj).map(([key, minutes]) => {
      const [project, user] = key.split("__");
      return { project, user, minutes };
    });

  const normalizedBlocks = {};
  Object.entries(managers).forEach(([pm, d]) => {
    normalizedBlocks[pm] = {
      billable: normalize(d.billable),
      inHouse: normalize(d.inHouse),
      others: normalize(d.others),
    };
  });

  const format = min =>
    `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

  /* -------- COPY TEXT -------- */
  let text = `Good Morning to all,\nBelow is the Morning standup of today.\n\n`;

  Object.entries(normalizedBlocks).forEach(([pm, d]) => {
    const print = arr =>
      arr.length
        ? arr.map(i => `${i.project} (${i.user}) - ${format(i.minutes)}`).join(", ")
        : "N/A";

    text += `Project Manager: ${pm}\n`;
    text += `Billable Projects : ${print(d.billable)}\n`;
    text += `In-House : ${print(d.inHouse)}\n`;
    text += `Others / No Work / R&D : ${print(d.others)}\n`;
    text += `Awaiting Feedback : \n\n`;
  });

  text += `Summary :
- Total Team Hours : ${format(totalMinutes)}
- Total In-House Hours : ${format(inHouseMinutes)}
- Total No work/R&D On Projects : ${format(othersMinutes)}
- Leave/Short Leave for today : N/A`;

  return {
    blocks: normalizedBlocks,
    summary: {
      team: format(totalMinutes),
        billable: format(billableMinutes),
      inHouse: format(inHouseMinutes),
      noWork: format(othersMinutes),
    },
    copyText: text,
  };
}, [standupPerformanceData]);


  /* ---------------- COPY ---------------- */
  const handleCopy = () => {
    navigator.clipboard.writeText(copyText);
    alert("Standup copied successfully ✅");
  };

  const SummaryItem = ({ label, value }) => (
  <div className="rounded-lg bg-white/70 backdrop-blur px-3 py-2 border border-white/40">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-semibold text-gray-900">{value}</p>
  </div>
);

const hasAnyStandup = Object.values(blocks || {}).some(
  d =>
    (d.billable?.length || 0) +
    (d.inHouse?.length || 0) +
    (d.others?.length || 0) >
    0
);


return (
    <div className="w-full space-y-6 p-6">

    {/* HEADER */}
    <div className="px-6 py-5 border-b border-white/30">
      <SectionHeader
        icon={BarChart}
        title="Morning Standup"
        subtitle="Daily consolidated team report"
      />
    </div>

  {/* ===== STANDUP HEADER ===== */}
{/* ===== HEADER ===== */}
<div className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50
                border border-gray-200 rounded-2xl shadow-lg p-6 mb-6">

  {/* TOP ROW */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

    {/* TITLE */}
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-xl bg-blue-600 text-white shadow-md">
        <BarChart className="h-6 w-6" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
          Morning Standup
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {startDate === endDate
            ? `Date: ${startDate}`
            : `From ${startDate} → ${endDate}`}
        </p>
      </div>
    </div>

    {/* DATE BADGE */}
    <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full
                    bg-blue-100 text-blue-800 text-sm font-semibold">
      <Calendar className="h-4 w-4" />
      {startDate} → {endDate}
    </div>
  </div>

  {/* DIVIDER */}
  <div className="my-5 border-t border-gray-200" />

  {/* BOTTOM ROW */}
  <div className="flex flex-wrap items-center justify-between gap-4">

    {/* FILTERS */}
    <div className="flex flex-wrap items-center gap-2">
      <TodayButton onClick={() => {
        setIsCustomMode(false);
        setDate(today);
      }} />

      <YesterdayButton onClick={() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        setIsCustomMode(false);
        setDate(d.toISOString().split("T")[0]);
      }} />

      <WeeklyButton onClick={() => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 6);
        setStartDate(start.toISOString().split("T")[0]);
        setEndDate(end.toISOString().split("T")[0]);
        setIsCustomMode(true);
      }} />

      {!isCustomMode ? (
        <CustomButton onClick={() => setIsCustomMode(true)} />
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white
                       focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white
                       focus:ring-2 focus:ring-blue-500"
          />
          <ClearButton onClick={() => setIsCustomMode(false)} />
          <CancelButton onClick={() => setIsCustomMode(false)} />
        </div>
      )}
    </div>

    {/* COPY BUTTON */}
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2
                 text-sm font-medium text-white shadow hover:bg-blue-700"
    >
      <Clipboard size={16} />
      Copy Standup
    </button>
  </div>
</div>



    {/* COPY */}
   
    {/* ===== SUMMARY STRIP ===== */}
<div className="flex gap-4 mb-6 overflow-x-auto pb-2">

  <div className="bg-white p-5 rounded-xl shadow-sm border">
    <div className="text-2xl font-bold text-blue-600">{summary.team}</div>
    <div className="text-xs text-gray-600 uppercase tracking-wider mt-1">
      Total Team Hours
    </div>
  </div>
   <div className="bg-white p-5 rounded-xl shadow-sm border">
    <div className="text-2xl font-bold text-blue-600">{summary.billable}</div>
    <div className="text-xs text-gray-600 uppercase tracking-wider mt-1">
      Billable Hours
    </div>
  </div>

  <div className="bg-white p-5 rounded-xl shadow-sm border">
    <div className="text-2xl font-bold text-indigo-600">{summary.inHouse}</div>
    <div className="text-xs text-gray-600 uppercase tracking-wider mt-1">
      In-House Hours
    </div>
  </div>
  

  <div className="bg-white p-5 rounded-xl shadow-sm border">
    <div className="text-2xl font-bold text-red-600">{summary.noWork}</div>
    <div className="text-xs text-gray-600 uppercase tracking-wider mt-1">
      No Work / R&D
    </div>
  </div>

  <div className="bg-white p-5 rounded-xl shadow-sm border">
    <div className="text-2xl font-bold text-green-600">N/A</div>
    <div className="text-xs text-gray-600 uppercase tracking-wider mt-1">
      Leave / Short Leave
    </div>
  </div>

</div>


  <div className="px-6 py-4 text-sm text-gray-800">
  

  {/* EMPTY STATE */}
  {!hasAnyStandup ? (
    <>

  
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">☕</div>
      <h3 className="text-lg font-semibold text-gray-800">
        No standup available
      </h3>
      <p className="text-sm text-gray-500 mt-1">
        Currently no standup is present for the selected date.
      </p>
    </div>
        </>
  ) : (
<>
  <div className="mb-6 rounded-xl bg-white/60 backdrop-blur border border-gray-200 px-5 py-4">
    <p className="text-sm text-gray-700 leading-5">
      <span className="font-semibold text-gray-900">Good Morning to all,</span>
      <br />
      Below is the <span className="font-semibold">Morning Standup</span>.
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {Object.entries(blocks).map(([pm, d]) => (
      <div
        key={pm}
        className="
          relative rounded-2xl
          bg-white/70 backdrop-blur-xl
          border border-gray-200
          shadow-md hover:shadow-xl
          transition-all duration-300
          p-5
        "
      >
        {/* PM HEADER */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500">
              Project Manager
            </p>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              {pm}
            </h3>
          </div>

          <span className="rounded-full bg-blue-100 text-blue-700 text-[11px] font-semibold px-3 py-1">
            Standup
          </span>
        </div>

        {/* DIVIDER */}
        <div className="mb-4 border-t border-gray-100" />

        {/* CATEGORIES */}
        <div className="space-y-4">
          <CategoryBlock title="Billable" color="green" items={d.billable} />
          <CategoryBlock title="In-House" color="indigo" items={d.inHouse} />
          <CategoryBlock
            title="Others / No Work / R&D"
            color="red"
            items={d.others}
          />
        </div>

        {/* FOOTER */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs italic text-gray-400">
            Awaiting Feedback :
          </p>
        </div>
      </div>
    ))}
  </div>
</>

  )}
</div>

  </div>
);

};

export default Standup;
