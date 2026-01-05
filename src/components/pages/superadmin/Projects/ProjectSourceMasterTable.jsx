// ProjectSourceMasterTable.jsx
import React, { useEffect, useState } from "react";
import { useProjectSource } from "../../../context/ProjectSourceContext";
import { Loader2, Search, Plus, Trash2, BarChart, X } from "lucide-react";
import { exportToExcel } from "../../../components/excelUtils";
import { ClearButton, IconSaveButton, IconCancelTaskButton, IconEditButton, IconDeleteButton } from "../../../AllButtons/AllButtons";
import Pagination from "../../../components/Pagination";
import { useAlert } from "../../../context/AlertContext";
import { SectionHeader } from '../../../components/SectionHeader';
import { usePermissions } from "../../../context/PermissionContext";
export const ProjectSourceMasterTable = () => {
  const { projectSources, isLoading, fetchProjectSources, addProjectSource, editProjectSource, deleteProjectSource } = useProjectSource();
  const { showAlert } = useAlert();
const {permissions}=usePermissions()
  // States
  const [newSourceName, setNewSourceName] = useState("");
  const [editSourceId, setEditSourceId] = useState(null);
  const [editSourceData, setEditSourceData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editid, setEditid] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false); // New modal state
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProjectSources();
  }, []);

const employeePermission=permissions?.permissions?.[0]?.project_source
  const canAddEmployee=employeePermission==="2"
  // Add Project Source
  const handleAddProjectSource = async () => {
    if (!newSourceName.trim()) {
      showAlert({ variant: "error", title: "Error", message: "Source name is required" });
      return;
    }

    await addProjectSource(newSourceName);
    if (!isLoading) {
      setNewSourceName("");
      setIsModalOpen(false);
    }
  };

  // Edit Project Source
  const handleEditSourceClick = (source) => {
    setEditSourceId(source.id);
    setEditSourceData({
      source_name: source.source_name || "",
    });
  };

  const handleSourceInputChange = (e) => {
    setEditSourceData((prev) => ({
      ...prev,
      source_name: e.target.value,
    }));
  };

  const handleSaveSourceClick = async () => {
    await editProjectSource(editSourceId, editSourceData.source_name);
    setEditSourceId(null);
    setEditSourceData({});
  };

  // Delete Project Source
  const handleDeleteSourceClick = (id) => {
    setEditid(id);
    setDeleteConfirm(true);
  };

  const confirmDeleteSource = () => {
    deleteProjectSource(editid);
    setDeleteConfirm(false);
    setEditid(null);
  };

  // Filter
  const filteredSources = projectSources?.filter((source) => {
    if (!source) return false;
    const name = (source.source_name || "").toLowerCase();
    const search = searchQuery.toLowerCase().trim();
    return name.includes(search);
  }) || [];

  const totalPages = Math.ceil(filteredSources.length / itemsPerPage);
  const paginatedSources = filteredSources.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-md max-h-screen overflow-y-auto">
      {/* Header */}
      <div>
        <SectionHeader 
          icon={BarChart} 
          title="Project Source Master Management" 
          subtitle="Add, edit and manage your project sources" 
        />
      </div>

      {/* Search & Add Button */}
      <div className="p-8 bg-white border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="flex items-center w-full border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 ">
              {/* <Search className="left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /> */}
              <input
                type="text"
                className="w-full rounded-lg focus:outline-none py-2"
                placeholder="Search sources by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ClearButton onClick={clearSearch}>Clear</ClearButton>
       {canAddEmployee&&(
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* <Plus className="w-5 h-5" /> */}
              Add Source
            </button>
       )}
          </div>
        </div>
      </div>

      {/* Sources Table */}
      <div className="overflow-hidden">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[700px]">
            <table className="w-full">
              <thead className="border-b border-gray-800 bg-black text-white">
                <tr className="table-th-tr-row table-bg-heading">
                  <th className="px-4 py-2 font-medium text-xs text-center">Source Name</th>
                  <th className="px-4 py-2 font-medium text-xs text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="2" className="px-12 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Project Sources...</h3>
                          <p className="text-gray-500">Please wait while we fetch your data</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : paginatedSources.length > 0 ? (
                  paginatedSources.map((source) => (
                    <tr key={source.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 text-gray-800 font-medium text-xs text-center">
                        {editSourceId === source.id ? (
                          <input
                            type="text"
                            value={editSourceData.source_name || ""}
                            onChange={handleSourceInputChange}
                            className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 text-lg font-semibold"
                            autoFocus
                          />
                        ) : (
                          <div className="text-xs">{source.source_name || "N/A"}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-medium text-xs text-center">
                        <div className="flex items-center justify-center gap-3">
                          {editSourceId === source.id ? (
                            <>
                              {/* Save Button - Removed tooltip */}
                              <IconSaveButton 
                                onClick={handleSaveSourceClick}
                                className="shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                              />
                              {/* Cancel Button - Removed tooltip */}
                              <IconCancelTaskButton 
                                onClick={() => {
                                  setEditSourceId(null);
                                  setEditSourceData({});
                                }}
                                className="shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                              />
                            </>
                          ) : (
                            <>
                              {/* Edit Button - Removed tooltip */}
                              {canAddEmployee &&(
                              <IconEditButton 
                                onClick={() => handleEditSourceClick(source)}
                                className="shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                              />
                              )}
                              {/* Delete Button - Removed tooltip */}
                              {canAddEmployee&&(
                              <IconDeleteButton 
                                onClick={() => handleDeleteSourceClick(source.id)}
                                className="shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                              />
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="px-12 py-24 text-center">
                      <div className="flex flex-col items-center gap-6">
                        <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Project Sources Found</h3>
                          <p className="text-lg text-gray-600 max-w-md mx-auto">
                            Get started by adding your first project source using the button above.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {totalPages > 1 && (
          <div className="p-8 bg-white border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Add Source Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4" role="dialog">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setNewSourceName("");
                }}
                className="absolute top-6 right-6 text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Source</h2>
              <p className="text-gray-600 mb-8">Enter details for the new project source</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Source Name *</label>
                  <input
                    type="text"
                    value={newSourceName}
                    onChange={(e) => setNewSourceName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                    placeholder="Enter source name (e.g. Upwork)"
                  />
                </div>
                
                <div className="flex items-center gap-4 pt-2">
                  <button
                    onClick={handleAddProjectSource}
                    disabled={isLoading || !newSourceName.trim()}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 justify-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Source"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setNewSourceName("");
                    }}
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-3xl flex items-center justify-center">
                <Trash2 className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirm Delete</h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Are you absolutely sure you want to delete this project source? 
                <br />
                <span className="font-semibold text-red-600">This action cannot be undone.</span>
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setDeleteConfirm(false);
                    setEditid(null);
                  }}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-800 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-400 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 shadow-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteSource}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-bold shadow-2xl hover:shadow-3xl hover:from-red-600 hover:to-red-700 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Source
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
