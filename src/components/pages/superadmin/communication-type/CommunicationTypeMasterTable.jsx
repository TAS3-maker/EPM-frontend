
import React, { useEffect, useState } from "react";
import { useCommunicationType } from "../../../context/CommunicationTypeContext";
import { Loader2, Search, Plus, Trash2, MessageCircle, X } from "lucide-react";
import { ClearButton, IconSaveButton, IconCancelTaskButton, IconEditButton, IconDeleteButton } from "../../../AllButtons/AllButtons";
import Pagination from "../../../components/Pagination";
import { useAlert } from "../../../context/AlertContext";
import { SectionHeader } from '../../../components/SectionHeader';
import { usePermissions } from "../../../context/PermissionContext";
import { useOutsideClick } from "../../../components/useOutsideClick";
import GlobalTable from "../../../components/GlobalTable";

export const CommunicationTypeMasterTable = () => {
  const { communicationTypes, isLoading, fetchCommunicationTypes, addCommunicationType, editCommunicationType, deleteCommunicationType } = useCommunicationType();
  const { showAlert } = useAlert();
const {permissions}=usePermissions()
  // States
  const [newMedium, setNewMedium] = useState("");
  const [newMediumDetails, setNewMediumDetails] = useState("");
  const [editTypeId, setEditTypeId] = useState(null);
  const [editTypeData, setEditTypeData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editid, setEditid] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCommunicationTypes();
  }, []);
const employeePermission=permissions?.permissions?.[0]?.communication_type
  const canAddEmployee=employeePermission==="2"
  // Add Communication Type
  const handleAddCommunicationType = async () => {
    if (!newMedium.trim()) {
      showAlert({ variant: "error", title: "Error", message: "Medium is required" });
      return;
    }
    if (!newMediumDetails.trim()) {
      showAlert({ variant: "error", title: "Error", message: "Medium details is required" });
      return;
    }

    await addCommunicationType(newMedium, newMediumDetails);
    if (!isLoading) {
      setNewMedium("");
      setNewMediumDetails("");
      setIsModalOpen(false);
    }
  };

  // Edit Communication Type
  const handleEditTypeClick = (type) => {
    setEditTypeId(type.id);
    setEditTypeData({
      medium: type.medium || "",
      medium_details: type.medium_details || "",
    });
  };

  const handleMediumInputChange = (e) => {
    setEditTypeData((prev) => ({
      ...prev,
      medium: e.target.value,
    }));
  };

  const handleMediumDetailsInputChange = (e) => {
    setEditTypeData((prev) => ({
      ...prev,
      medium_details: e.target.value,
    }));
  };

  const handleSaveTypeClick = async () => {
    await editCommunicationType(editTypeId, editTypeData.medium, editTypeData.medium_details);
    setEditTypeId(null);
    setEditTypeData({});
  };

  // Delete Communication Type
  const handleDeleteTypeClick = (id) => {
    setEditid(id);
    setDeleteConfirm(true);
  };

  const confirmDeleteType = () => {
    deleteCommunicationType(editid);
    setDeleteConfirm(false);
    setEditid(null);
  };

  // Filter - Search in both medium and medium_details
  const filteredTypes = communicationTypes?.filter((type) => {
    if (!type) return false;
    const medium = (type.medium || "").toLowerCase();
    const details = (type.medium_details || "").toLowerCase();
    const search = searchQuery.toLowerCase().trim();
    return medium.includes(search) || details.includes(search);
  }) || [];

  const totalPages = Math.ceil(filteredTypes.length / itemsPerPage);
  const paginatedTypes = filteredTypes.slice(
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

   const handleCloseAddModal = () => {
    setIsModalOpen(false);
   
  };
  
  const addModalRef = useOutsideClick(isModalOpen, handleCloseAddModal);


// GlobalTable Columns & Actions
  const columns = [
    {
      key: "medium",
      label: "Medium",
      render: (item) => {
        if (editTypeId === item.id) {
          return (
            <input
              type="text"
              value={editTypeData.medium || ""}
              onChange={handleMediumInputChange}
              className="w-fit p-1 border"
              autoFocus
            />
          );
        }
        return (
          <div className="text-[10px] py-1 font-normal text-gray-800 text-center">
            {item.medium || "N/A"}
          </div>
        );
      },
    
    },
    {
      key: "medium_details",
      label: "Details",
      render: (item) => {
        if (editTypeId === item.id) {
          return (
            <input
              type="text"
              value={editTypeData.medium_details || ""}
              onChange={handleMediumDetailsInputChange}
              className="w-fit p-1 border"
            />
          );
        }
        return (
          <div className="text-[10px] py-1 font-normal text-gray-800 text-center">
            {item.medium_details || "N/A"}
          </div>
        );
      },
      
    }
  ];

  const actionsComponent = {
    right: (item) => (
      <div className="flex items-center justify-center gap-3">
        {editTypeId === item.id ? (
          <>
            <IconSaveButton 
              onClick={handleSaveTypeClick}
              className="shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
            />
            <IconCancelTaskButton 
              onClick={() => {
                setEditTypeId(null);
                setEditTypeData({});
              }}
              className="shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
            />
          </>
        ) : (
          <>
            {canAddEmployee && (
              <IconEditButton 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditTypeClick(item);
                }}
                className="shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
              />
            )}
            {canAddEmployee && (
              <IconDeleteButton 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTypeClick(item.id);
                }}
                className="shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
              />
            )}
          </>
        )}
      </div>
    )
  };





  
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-md max-h-screen overflow-y-auto">
      {/* Header */}
      <div>
        <SectionHeader 
          icon={MessageCircle} 
          title="Communication Type Master Management" 
          subtitle="Add, edit and manage your communication mediums" 
        />
      </div>

      {/* Search & Add Button */}
      <div className="p-2 bg-white border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
             <div className="flex items-center w-full border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
              <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
              <input
                type="text"
                className="w-full rounded-lg focus:outline-none py-1.5 text-sm"
                placeholder="Search by medium or details..."
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
              className="add-items-btn text-sm"
            >
              {/* <Plus className="w-5 h-5" /> */}
              Add Type
            </button>
            )}
          </div>
        </div>
      </div>

      {/* GlobalTable Integration */}
      <div className="p-0">
        <GlobalTable
          data={paginatedTypes}
          columns={columns}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          enablePagination={totalPages > 1}
          hideActions={false}
          actionsComponent={actionsComponent}
          emptyStateTitle="No Communication Types Found"
          emptyStateMessage="Get started by adding your first communication type using the button above."
          paginatedData={paginatedTypes}
          className="border-t border-gray-200"
        />
      </div>

      {/* Add Type Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4" role="dialog">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" ref={addModalRef}>
            <div className="p-8">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setNewMedium("");
                  setNewMediumDetails("");
                }}
                className="absolute top-6 right-6 text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Communication Type</h2>
              <p className="text-gray-600 mb-8">Enter details for the new communication medium</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Medium *</label>
                  <input
                    type="text"
                    value={newMedium}
                    onChange={(e) => setNewMedium(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                    placeholder="e.g. WhatsApp, Slack, Email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Details *</label>
                  <input
                    type="text"
                    value={newMediumDetails}
                    onChange={(e) => setNewMediumDetails(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                    placeholder="e.g. +91998877654, john@company.com"
                  />
                </div>
                
                <div className="flex items-center gap-4 pt-2">
                  <button
                    onClick={handleAddCommunicationType}
                    disabled={isLoading || !newMedium.trim() || !newMediumDetails.trim()}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 justify-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Type"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setNewMedium("");
                      setNewMediumDetails("");
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
                Are you absolutely sure you want to delete this communication type? 
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
                  onClick={confirmDeleteType}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-bold shadow-2xl hover:shadow-3xl hover:from-red-600 hover:to-red-700 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Type
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
