import React from "react";
export const SectionHeader = ({ icon: Icon, title, subtitle }) => {
  return (
    <div className="px-5 py-3 sm:py-5 bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 rounded-t-xl">
      <div className="flex items-center gap-2 sm:gap-3 mb-1">
        <Icon className="h-7 w-7 sm:h-10 sm:w-10 text-blue-100" />
        <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
      </div>
      <p className="text-blue-100 text-base sm:text-lg">{subtitle}</p>
    </div>
  );
};
