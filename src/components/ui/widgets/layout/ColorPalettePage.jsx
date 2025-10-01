import { useEffect, useState } from 'react';

const DEFAULT_COLORS = {
  '--color-background': '#ffffff',
  '--color-text': '#000000',
  '--color-lite-blue': '#414fe6',
  '--color-dark-blue': '#2741b9',
};

const LOCAL_STORAGE_KEY = 'custom-colors';

const ColorPalettePage = () => {
  const [colors, setColors] = useState(DEFAULT_COLORS);

  // Load saved colors from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setColors(parsed);
      } catch {
        console.warn('Could not parse stored colors');
      }
    }
  }, []);

  // Apply colors to :root and save to localStorage
  useEffect(() => {
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(colors));
  }, [colors]);

  const handleColorChange = (key, value) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearColors = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setColors(DEFAULT_COLORS);
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)',
      }}
    >
      {/* Header */}
      <div className="top-heading-bg text-white rounded-xl mb-8 text-center">
        <h1 className="text-4xl font-bold">🎨 Color Palette Customization</h1>
        <p className="text-lg font-medium mt-2">Adjust your UI color scheme</p>
      </div>

      {/* Color Pickers */}
      <div className="carddesign p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(colors).map(([key, value]) => (
            <div key={key} className="flex flex-col gap-2">
              <label className="font-semibold capitalize">
                {key.replace('--color-', '').replace('-', ' ')}
              </label>
              <input
                type="color"
                value={value}
                onChange={(e) => handleColorChange(key, e.target.value)}
                className="w-full h-12 border border-gray-300 rounded cursor-pointer"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button className="clear-btn mt-6" onClick={handleClearColors}>
            Clear Colors
          </button>
        </div>
      </div>

      {/* Preview Sections */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div
          className="rounded-xl p-6 text-white shadow-md"
          style={{ backgroundColor: 'var(--color-lite-blue)' }}
        >
          <h2 className="text-2xl font-semibold mb-2">Lite Blue Section</h2>
          <p>This uses <code>--color-lite-blue</code></p>
        </div>

        <div
          className="rounded-xl p-6 text-white shadow-md"
          style={{ backgroundColor: 'var(--color-dark-blue)' }}
        >
          <h2 className="text-2xl font-semibold mb-2">Dark Blue Section</h2>
          <p>This uses <code>--color-dark-blue</code></p>
        </div>
      </div>

      {/* Table of current variables */}
      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="table-bg-heading">
              <th className="table-th-tr-row">Name</th>
              <th className="table-th-tr-row">Variable</th>
              <th className="table-th-tr-row">Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(colors).map(([key, value]) => (
              <tr key={key} className="even:bg-gray-50 odd:bg-white">
                <td className="px-4 py-2 capitalize">
                  {key.replace('--color-', '')}
                </td>
                <td className="px-4 py-2 font-mono">{key}</td>
                <td className="px-4 py-2 font-mono">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Example Button Section */}
      <div className="mt-10 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <button className="submit-btn">Submit</button>
        <button className="cancel-btn">Cancel</button>
        <button className="add-items-btn">Add</button>
        <button className="delete-btn">Delete</button>
        <button className="edit-btn">Edit</button>
        <button className="assign-btn">Assign</button>
        <button className="sync-btn">Sync</button>
        <button className="export-btn">Export</button>
        <button className="import-btn">Import</button>
      </div>
    </div>
  );
};

export default ColorPalettePage;
