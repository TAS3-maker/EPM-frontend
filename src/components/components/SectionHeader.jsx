import React from "react";
export const SectionHeader = ({ icon: Icon, title, subtitle }) => {
  return (
    <div className="p-8 bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 rounded-t-xl">
      <div className="flex items-center gap-3 mb-3">
        <Icon className="h-10 w-10 text-blue-100" />
        <h2 className="text-3xl font-bold text-white">{title}</h2>
      </div>
      <p className="text-blue-100 text-lg">{subtitle}</p>
    </div>
  );
};