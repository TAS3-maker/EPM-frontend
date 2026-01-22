import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X, ListChecks } from "lucide-react";

const SearchableSelect = ({
  options = [],
  value = [],
  onChange,
  isLoading = false,
  placeholder = "Select",
  labelKey = "name",
  valueKey = "id",
}) => {
  const [open, setOpen] = useState(false);
  const [showSelected, setShowSelected] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  /* ---------------- CLOSE ON OUTSIDE CLICK ---------------- */
  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) {
        setOpen(false);
        setShowSelected(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------------- FILTER OPTIONS ---------------- */
  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter((o) =>
      o[labelKey]?.toLowerCase().includes(q)
    );
  }, [options, query, labelKey]);

  /* ---------------- SELECTION ---------------- */
  const toggleValue = (val) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const selectedOptions = useMemo(
    () => options.filter((o) => value.includes(o[valueKey])),
    [options, value, valueKey]
  );

const clearAll = () => {
  const selectedCount = value.length;

  onChange([]);

  if (selectedCount === 1) {
    setShowSelected(false);
  }
};


useEffect(() => {
  if (value.length === 0) {
    setShowSelected(false);
  }
}, [value]);

  return (
    <div ref={ref} className="relative w-full">
    <button
  type="button"
  disabled={isLoading}
  onClick={() => !isLoading && setOpen((p) => !p)}
  className="relative w-full h-[44px] px-3 flex items-center justify-between
             rounded-xl border border-sky-300 bg-white/85
             text-sm shadow-sm backdrop-blur-md"
>
  {/* FLOATING LABEL */}
  <span
    className={`
      absolute left-3 transition-all duration-200 bg-white px-1
      ${
        value.length || open
          ? "-top-2 text-xs text-sky-600"
          : "top-1/2 -translate-y-1/2 text-gray-400"
      }
    `}
  >
    {placeholder}
  </span>

  {/* VALUE TEXT */}
  <span className="text-gray-900">
    {value.length ? `${value.length} selected` : ""}
  </span>

  <div className="flex items-center gap-2">
    {value.length > 0 && (
      <ListChecks
        className="h-4 w-4 cursor-pointer text-gray-400 hover:text-sky-600"
        onClick={(e) => {
          e.stopPropagation();
          setShowSelected((p) => !p);
          setOpen(false);
        }}
        title="View selected"
      />
    )}
    <ChevronDown className="h-4 w-4 text-gray-400" />
  </div>
</button>


      {/* ================= SELECTED FLOATING BOX ================= */}
      {showSelected && selectedOptions.length > 0 && (
        <div
          className="absolute z-50 mt-2 w-full
                     rounded-2xl border border-sky-200
                     bg-white shadow-lg p-3"
        >
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-medium text-gray-500">
              Selected
            </p>
            <button
              onClick={clearAll}
              className="text-xs text-red-500 hover:underline"
            >
              Clear all
            </button>
          </div>

          <div className="flex flex-wrap gap-1">
            {selectedOptions.map((opt) => (
              <span
                key={opt[valueKey]}
                className="flex items-center gap-1
                           bg-sky-100 text-sky-800
                           px-2 py-0.5 rounded-lg text-xs"
              >
                {opt[labelKey]}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-500"
                  onClick={() => toggleValue(opt[valueKey])}
                />
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ================= OPTIONS DROPDOWN ================= */}
      {open && (
        <div
          className="absolute z-40 mt-2 w-full
                     rounded-2xl border border-sky-200
                     bg-white shadow-lg"
        >
          {/* SEARCH */}
          <div className="p-2 border-b border-sky-100">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 text-sm
                           rounded-lg border border-sky-200
                           focus:ring-2 focus:ring-sky-400 outline-none"
              />
            </div>
          </div>

          {/* OPTIONS */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length ? (
              filtered.map((opt) => {
                const active = value.includes(opt[valueKey]);
                return (
                  <button
                    key={opt[valueKey]}
                    onClick={() => toggleValue(opt[valueKey])}
                    className={`w-full px-4 py-2 text-left text-sm
                      ${
                        active
                          ? "bg-sky-500 text-white"
                          : "hover:bg-sky-100 text-gray-700"
                      }`}
                  >
                    {opt[labelKey]}
                  </button>
                );
              })
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
