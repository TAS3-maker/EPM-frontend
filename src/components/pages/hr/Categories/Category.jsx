import React, { useState } from "react";
import { useCategory } from "../../../context/CategoryContext";
import { X } from "lucide-react";
import { SubmitButton } from "../../../AllButtons/AllButtons";

export const Category = () => {
  const { addCategory, isLoading, message } = useCategory();

  const [categoryName, setCategoryName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (categoryName.trim() && categoryCode.trim()) {
      await addCategory({
        name: categoryName,
        category_code: categoryCode,
      });

      setCategoryName("");
      setCategoryCode("");
      setShowMessage(true);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="bg-white">
      <button
        onClick={() => setIsModalOpen(true)}
        className="add-items-btn"
      >
        Add Category
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold text-gray-800">Enter Category</h2>
            <p className="text-sm text-gray-500 mt-1">Add a new Category</p>

            {showMessage && message && (
              <div
                className={`mt-4 p-3 rounded-md text-sm font-medium text-center ${message.includes("successfully")
                  ? "bg-green-50 text-green-800 border border-green-300"
                  : "bg-red-50 text-red-800 border border-red-300"
                  }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="categoryName" className="block font-medium text-gray-700 text-sm">
                  Category Name
                </label>
                <input
                  id="categoryName"
                  placeholder="like Laptop, Mouse"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="categoryCode" className="block font-medium text-gray-700 text-sm">
                  Category Code
                </label>
                <input
                  id="categoryCode"
                  placeholder="Like L-tas"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={categoryCode}
                  onChange={(e) => setCategoryCode(e.target.value)}
                />
              </div>

              <SubmitButton disabled={isLoading} />
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
