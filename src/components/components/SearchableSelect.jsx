import React, { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

const SearchableSelect = ({
  options = [],
  value,
    isLoading = false,
  onChange,
  placeholder = "Select",
  labelKey = "name",
  valueKey = "id"
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

const filtered = useMemo(() => {
  if (!query) return options;

  const q = query.toLowerCase();

  return options
    .filter(opt => opt[labelKey])
    .sort((a, b) => {
      const aLabel = a[labelKey].toLowerCase();
      const bLabel = b[labelKey].toLowerCase();

      // exact / startsWith comes first
      if (aLabel.startsWith(q) && !bLabel.startsWith(q)) return -1;
      if (!aLabel.startsWith(q) && bLabel.startsWith(q)) return 1;
      return 0;
    })
    .filter(opt =>
      opt[labelKey].toLowerCase().includes(q)
    );
}, [options, query, labelKey]);

const clearSelection = () => {
  onChange("");
  setQuery("");
  setOpen(false);
};

  const selectedLabel =
    options.find(o => o[valueKey] === value)?.[labelKey] || "";

  return (
    <div ref={ref} className="relative z-50">

    <button
  disabled={isLoading}
  onClick={() => !isLoading && setOpen(!open)}
className={`w-full h-[40px] flex items-center gap-2 
  overflow-hidden
  px-3 rounded-xl
  bg-white/85 border border-sky-300
  text-sm text-gray-800
  shadow-sm backdrop-blur-md transition
  ${isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-white"}`}

>
<span
  title={selectedLabel}
  className={`flex-1 min-w-0 text-left truncate whitespace-nowrap 
    ${value ? "text-gray-900" : "text-gray-400"}`}
>
  {isLoading ? "Loading..." : selectedLabel || placeholder}
</span>


  {isLoading ? (
    <svg
      className="animate-spin h-4 w-4 text-sky-500"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  ) : (
    <>
{value ? (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      clearSelection();
    }}
    className="text-gray-400 hover:text-red-500"
  >
    ✕
  </button>
) : (
  <ChevronDown className="h-4 w-4 text-gray-400" />
)}
</>
  )}
</button>


      {/* DROPDOWN */}
      {open && (
        <div
          className="absolute z-30 mt-2 w-full rounded-2xl 
                     bg-white/90 border border-sky-200 
                     shadow-lg backdrop-blur-xl"
        >
          {/* SEARCH */}
          <div className="p-2 border-b border-sky-100 relative bg-white/80 rounded-t-2xl">
            <Search className="absolute left-4 top-5 h-4 w-4 text-gray-400" />
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-2 py-2 text-sm rounded-lg 
                         bg-white/90 border border-sky-200 
                         focus:ring-2 focus:ring-sky-400 outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* OPTIONS */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length ? (
              filtered.map(opt => (
             <button
  key={opt[valueKey]}
  onClick={() => {
    onChange(opt[valueKey]);
    setOpen(false);
    setQuery("");
  }}
  title={opt[labelKey]}
  className="w-full text-left px-4 py-2 text-sm
             text-gray-700 truncate whitespace-nowrap
             hover:bg-sky-100 transition"
>
  {opt[labelKey]}
</button>

              ))
            ) : (
              <p className="px-4 py-3 text-sm text-gray-400">
                No results found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
