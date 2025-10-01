import React from "react";

export const StatCardHeader = ({ title, icon: Icon, tooltip = "", className = "", onIconClick = () => { } }) => {
  return (
    <div className={`flex flex-col rounded-xl shadow-lg bg-white ${className}`}>
      <header className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl">
        <h2 className="text-sm md:text-md font-semibold text-white flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-white" />}
          {title}
        </h2>

        {tooltip && (
          <div className="relative group ml-2">
            <button
              className="block"
              onClick={onIconClick}
              aria-haspopup="true"
              aria-expanded="false"
            >
              <svg
                className="fill-current text-white"
                width="16"
                height="16"
                viewBox="0 0 16 16"
              >
                <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 12c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm1-3H7V4h2v5z" />
              </svg>
            </button>
            <div className="z-10 absolute bottom-full left-1/2 -translate-x-1/2 hidden group-hover:block">
              <div className="rounded-lg border overflow-hidden shadow-lg text-nowrap max-w-max px-3 py-2 text-gray-600 bg-white border-gray-200 mb-2 text-sm">
                {tooltip}
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};
