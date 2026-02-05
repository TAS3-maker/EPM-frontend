import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, RefreshCcw } from "lucide-react";


export const SectionHeader = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  showBack = false, 
  showRefresh = false, 
  onRefresh,
  /* 🔥 VIEW TOGGLE PROPS */
  showViewToggle = false,
  activeView,
  onViewChange,
}) => {
  const navigate = useNavigate();

  return (
    <div className="px-5 py-2 sm:py-2 flex justify-between items-start flex-wrap gap-2 bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 rounded-t-xl">
      <div className="flex items-center flex-wrap gap-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-blue-100" />
          <h2 className="text-base sm:text-xl  font-bold text-white">{title}</h2>
        </div>
        <p className="text-blue-100 text-sm sm:text-base">{subtitle}</p>
      </div>
      {/*  ACTION BUTTONS (OPTIONAL) */}
      <div className="flex items-center gap-2 flex-wrap">

       {/* 🔁 VIEW TOGGLE */}
        {showViewToggle && (
          <div className="flex gap-1 bg-sky-50 p-1 rounded-xl border border-sky-200">
            <button
              onClick={() => onViewChange("sheets")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition
                ${
                  activeView === "sheets"
                    ? "bg-sky-500 text-white"
                    : "text-sky-600 hover:bg-sky-100"
                }`}
            >
              Sheets
            </button>

            <button
              onClick={() => onViewChange("analytics")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition
                ${
                  activeView === "analytics"
                    ? "bg-sky-500 text-white"
                    : "text-sky-600 hover:bg-sky-100"
                }`}
            >
              Analytics
            </button>
          </div>
        )}



        
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs
                         bg-white/20 hover:bg-white/30 text-white rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        )}

        {showRefresh && typeof onRefresh === "function" && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1 px-3 py-1.5 text-xs
                         bg-white/20 hover:bg-white/30 text-white rounded-lg"
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
        )}
      </div>

    </div>
  );
};
