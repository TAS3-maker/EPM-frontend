import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, RefreshCcw } from "lucide-react";


export const SectionHeader = ({ icon: Icon, title, subtitle, showBack = false, showRefresh = false, onRefresh }) => {
  const navigate = useNavigate();

  return (
    <div className="px-5 py-3 sm:py-5 flex justify-between items-start flex-wrap gap-2 bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 rounded-t-xl">
      <div>
        <div className="flex items-center gap-2 sm:gap-3 mb-1">
          <Icon className="h-7 w-7 sm:h-10 sm:w-10 text-blue-100" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
        </div>
        <p className="text-blue-100 text-base sm:text-lg">{subtitle}</p>
      </div>
      {/*  ACTION BUTTONS (OPTIONAL) */}
      <div className="flex items-center gap-2">
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
