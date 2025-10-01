import React, { useEffect, useState } from "react";
import { useCategory } from "../../../context/CategoryContext";
import { Edit, Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Category } from './Category';
import Alert from "../../../components/Alerts";
import { SectionHeader } from '../../../components/SectionHeader';
import {
  IconSaveButton,
  IconDeleteButton,
  IconEditButton,
  IconCancelTaskButton,
  YesButton
} from "../../../AllButtons/AllButtons";

export const Categorytable = () => {
  const {
    categories,
    fetchCategories,
    deleteCategory,
    updateCategory,
    isLoading,
    alert,
  } = useCategory();

  const navigate = useNavigate();
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryCode, setEditCategoryCode] = useState("");
  const [editCategoryStock, setEditCategoryStock] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleEditClick = (category) => {
    setEditCategoryId(category.id);
    setEditCategoryName(category.name);
    setEditCategoryCode(category.category_code);
    setEditCategoryStock(category.instock?.toString() || ""); // default to string
  };

  const handleSaveClick = async () => {
    if (!editCategoryName.trim() || !editCategoryCode.trim()) return;
    setIsUpdating(true);
    await updateCategory(
      editCategoryId,
      editCategoryName,
      editCategoryCode,
      parseInt(editCategoryStock, 10)
    );
    setIsUpdating(false);
    setEditCategoryId(null);
  };

  const handleDeleteClick = async (categoryId) => {
    if (deleteConfirm === categoryId) {
      await deleteCategory(categoryId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(categoryId);
    }
  };

  const handleViewClick = (id) => {
    navigate(`/hr/accessory/manage/${id}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white shadow-lg max-h-screen overflow-y-auto">
      <SectionHeader icon={Edit} title="Category Management" subtitle="View, edit and manage categories" />

      {alert.show && (
        <Alert
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
          onClose={() => {}}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sticky top-0 bg-white z-10 shadow-md">
        <Category />
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
            <span className="text-gray-500">Loading Categories...</span>
          </div>
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <div key={category.id} className="bg-gray-50 rounded-xl border p-5 shadow-sm hover:shadow-lg transition duration-300">
              
              <div className="flex justify-between items-start">
                <div className="w-full">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {editCategoryId === category.id ? (
                      <input
                        type="text"
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1 w-full"
                      />
                    ) : (
                      category.name
                    )}
                  </h3>

                  <p className="text-sm mt-2 text-gray-700">
                    Code:{" "}
                    {editCategoryId === category.id ? (
                      <input
                        type="text"
                        value={editCategoryCode}
                        onChange={(e) => setEditCategoryCode(e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1 w-full mt-1"
                      />
                    ) : (
                      <span className="font-mono text-blue-700">{category.category_code}</span>
                    )}
                  </p>

                  <div className="flex flex-col flex-wrap gap-1 my-2 text-sm font-medium">
                    <div className="text-blue-600">
                      Total Stock:
                      <span className="ml-1 inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {category.total_stock}
                      </span>
                    </div>
                    <div className="text-green-600">
                      Available:
                      <span className="ml-1 inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {category.available_stock}
                      </span>
                    </div>
                    <div className="text-yellow-600">
                      In Use:
                      <span className="ml-1 inline-block bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                        {category.inuse}
                      </span>
                    </div>
                    <div className="text-red-600">
                      Trash:
                      <span className="ml-1 inline-block bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                        {category.trash_stock}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-gray-500 mt-1">
                    Created: {formatDate(category.created_at)}
                  </p>

                </div>

                <div className="flex flex-col gap-2 ml-3">
                  {editCategoryId === category.id ? (
                    <>
                      <IconSaveButton onClick={handleSaveClick} disabled={isUpdating} />
                      <IconCancelTaskButton onClick={() => setEditCategoryId(null)} />
                    </>
                  ) : (
                    <>
                      <IconEditButton onClick={() => handleEditClick(category)} />
                      {deleteConfirm === category.id ? (
                        <YesButton onClick={() => handleDeleteClick(category.id)} />
                      ) : (
                        <IconDeleteButton onClick={() => setDeleteConfirm(category.id)} />
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 text-right">
                <button
                  onClick={() => handleViewClick(category.category_id)}
                  className="inline-block text-white bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                >
                  Manage Accessories
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-10">
            No Categories Found
          </div>
        )}
      </div>
    </div>
  );
};
