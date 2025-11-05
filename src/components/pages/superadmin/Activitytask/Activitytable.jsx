import React, { useEffect, useMemo, useState } from "react";
import { useActivity } from "../../../context/ActivityContext";
import { Loader2, BarChart, Search } from "lucide-react";
import {
  CancelButton,
  YesButton,
  ExportButton,
  ImportButton,
  ClearButton,
  IconSaveButton,
  IconDeleteButton,
  IconEditButton,
  IconCancelTaskButton,
} from "../../../AllButtons/AllButtons";
import { SectionHeader } from '../../../components/SectionHeader';
import { Activity } from "./Activity"; // Assuming this is for adding new tags
import { useAlert } from "../../../context/AlertContext";
import Pagination from "../../../components/Pagination";
import { exportToExcel } from "../../../components/excelUtils";


export const Activitytable = () => {
  const [isUpdating, setIsUpdating] = useState(false); // Local loading state for updates (edit/delete)
  const [deleteClientModalOpen, setDeleteClientModalOpen] = useState(false); // Modal visibility for delete
  const [editingTagId, setEditingTagId] = useState(null); // ID of the tag currently being edited
  const [tagToDeleteId, setTagToDeleteId] = useState(null); // ID of the tag to be deleted
  const [newTagName, setNewTagName] = useState(""); // State for the edited tag name
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const { showAlert } = useAlert();
  const [showImportOptions, setShowImportOptions] = useState(false);

  // Destructure validationErrors and setValidationErrors from ActivityContext
  const {
    getActivityTags,
    activityTags,
    loading,
    updateActivityTag,
    deleteTagActivity,
    validationErrors,
    setValidationErrors
  } = useActivity();

  useEffect(() => {
    getActivityTags();
  }, []);

  const filteredActivityTags = useMemo(() => {
    return activityTags.filter((tag) =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activityTags, searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1); // Reset to the first page when search is cleared
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Function to handle entering edit mode
  const handleEditClick = (tag) => {
    setEditingTagId(tag.id); // Set the ID of the tag being edited
    setNewTagName(tag.name); // Populate the input with the current tag name
    setValidationErrors({}); // Crucial: Clear any previous validation errors when starting a new edit
    
  };

  const handleUpdateTag = async (id) => {
    // Client-side validation: if the input is empty, set a validation error for 'name'.
    if (!newTagName.trim()) {
      setValidationErrors(prev => ({ ...prev, name: ["Activity tag name cannot be empty."] }));
      return; // Stop the update process
    }

    setIsUpdating(true); // Set local loading state for this specific update operation

    try {
      // Call the update function from context. The context's `updateActivityTag`
      // is responsible for the API call, handling 422 errors by setting `validationErrors`,
      // and showing general alerts.
      const success = await updateActivityTag(id, newTagName);

      // If the update was successful (based on context's internal logic,
      // which might set `validationErrors` on failure, or return a boolean/status)
      if (success) { // Assuming updateActivityTag returns true on success, false on validation error
        setNewTagName(""); // Reset input field after successful update
        setEditingTagId(null);
        setValidationErrors({}); 
      }
      setEditingTagId(null);
      // If `success` is false, it implies validation errors were set by the context
      // and the input field will correctly display the error.
    } catch (error) {
      console.error("Error during tag update in component:", error);
    } finally {
      setIsUpdating(false); // Always reset loading state
    }
  };

  const handleCancelEdit = () => {
    setEditingTagId(null); // Exit edit mode
    setNewTagName(""); // Clear the input field
    setValidationErrors({}); // Clear any validation errors for the edited field
  };

  const handleConfirmDelete = async () => {
    setIsUpdating(true); // Use isUpdating for delete operation as well
    try {
      const tagToDelete = activityTags.find((tag) => tag.id === tagToDeleteId);

      if (tagToDelete) {
        await deleteTagActivity(tagToDelete.id); // Call delete API (context handles alert)
        setDeleteClientModalOpen(false);
        setTagToDeleteId(null); // Reset the delete id
      } else {
        showAlert({ variant: "error", title: "Error", message: "No tag selected for deletion." });
      }
    } catch (error) {
      console.error("Failed to delete tag activity", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Calculate total pages based on filtered activity tags
  const totalPages = Math.ceil(filteredActivityTags.length / itemsPerPage);

  // Apply pagination to filtered activity tags
  const paginatedActivityTags = filteredActivityTags.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg max-h-screen overflow-y-auto">
      <SectionHeader icon={BarChart} title="Activity Tags Management" subtitle="Manage activity tags and update details" />
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sticky top-0 bg-white z-10 shadow-md">
        <Activity /> {/* Assuming this is for adding new tags */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-2 rounded-lg shadow-md bg-white">
          <div className="flex items-center w-full border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
            <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
            <input
              type="text"
              className="w-full rounded-lg focus:outline-none py-2"
              placeholder="Search by Tag name"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to the first page on search
              }}
            />
          </div>
          <ClearButton onClick={handleClearSearch} />
          {/* <ImportButton onClick={() => setShowImportOptions(!showImportOptions)} /> */}
          <ExportButton onClick={() => exportToExcel(filteredActivityTags, "ActivityTags.xlsx")} />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <table className="w-full">
            <thead>
              <tr className="table-bg-heading table-th-tr-row">
                <th className="px-4 py-2 font-medium text-center text-sm">Created Date</th>
                <th className="px-4 py-2 font-medium text-center text-sm">Updated Date</th>
                <th className="px-4 py-2 font-medium text-center text-sm">Tag Name</th>
                <th className="px-4 py-2 font-medium text-center text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && !filteredActivityTags.length ? ( // Show loader only if initial load or no tags yet after filtering
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                      <span className="text-gray-500">Loading tags...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredActivityTags.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="rounded-full bg-gray-100 p-3">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No Tags found</h3>
                      <p className="mt-1 text-sm text-gray-500">No tags match your search or have been created yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedActivityTags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 text-center text-gray-600 text-sm">
                      <span className="flex items-center justify-center">
                        {/* <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span> */}
                        {formatDate(tag.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 text-sm">
                      {formatDate(tag.updated_at)}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-800 font-medium text-sm">
                      {editingTagId === tag.id ? (
                        <div>
                          <input
                            type="text"
                            className={`border rounded-md px-3 py-2 w-full max-w-xs focus:outline-none focus:ring-2 ${
                              validationErrors.name ? "border-red-500 ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}
                            value={newTagName}
                            onChange={(e) => {
                              setNewTagName(e.target.value);
                              // Clear the specific 'name' error from context when user types
                              setValidationErrors(prev => {
                                const newErrs = { ...prev };
                                delete newErrs.name; // Remove the 'name' error if it exists
                                return newErrs;
                              });
                            }}
                            autoFocus
                          />
                          {/* Display backend validation error message for the 'name' field */}
                          {validationErrors.name && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.name[0]}</p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
                          {tag.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        {editingTagId === tag.id ? (
                          <>
                            <div className="relative group">
                              <IconSaveButton
                                onClick={() => handleUpdateTag(tag.id)}
                                disabled={isUpdating}
                              />
                              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                                whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded
                                opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
                                    Save
                              </span>
                            </div>

                            <div className="relative group">
                              <IconCancelTaskButton onClick={handleCancelEdit} />
                              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                                whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded
                                opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
                                    Cancel
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="relative group">
                              <IconEditButton onClick={() => handleEditClick(tag)} />
                              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                                whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded
                                opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
                                    Edit
                              </span>
                            </div>
                            <div className="relative group">
                              <IconDeleteButton onClick={() => {
                                setDeleteClientModalOpen(true);
                                setTagToDeleteId(tag.id);
                              }}
                              />
                              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                                whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded
                                opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
                                    Delete
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {deleteClientModalOpen && ( // Use deleteClientModalOpen to control visibility
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-50"
          role="dialog"
          aria-labelledby="deleteModalLabel"
          aria-describedby="deleteModalDescription"
        >
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full m-2">
            <div className="flex justify-between items-center mb-4">
              <h2 id="deleteModalLabel" className="text-lg font-semibold">
                Are you sure you want to delete this Activity?
              </h2>
            </div>
            <div id="deleteModalDescription" className="text-sm text-gray-600 mb-4">
              This action cannot be undone. Please confirm if you'd like to proceed.
            </div>
            <div className="flex justify-end gap-2 my-2">
              <CancelButton onClick={() => { setDeleteClientModalOpen(false); setTagToDeleteId(null); }} />
              <YesButton onClick={handleConfirmDelete} disabled={isUpdating} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};