import React, { useEffect, useState } from "react";
import { useMasterClient } from "../../../context/MasterClientContext";
import { Loader2, Search, Plus, Trash2, BarChart } from "lucide-react";
import { exportToExcel } from "../../../components/excelUtils";
import { EditButton, SaveButton, SubmitButton, CancelButton, ClearButton, ImportButton, ExportButton, YesButton, DeleteButton, IconApproveButton, IconRejectButton, IconCancelTaskButton, IconSaveButton, IconDeleteButton, IconEditButton } from "../../../AllButtons/AllButtons";
import Pagination from "../../../components/Pagination";
import { useAlert } from "../../../context/AlertContext";
import { SectionHeader } from '../../../components/SectionHeader';

export const ClientMastertable = () => {
  const { masterClients, isLoading, fetchMasterClients, addMasterClient, editMasterClient, deleteMasterClient } = useMasterClient();
  const { showAlert } = useAlert();

  // States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientNumber, setNewClientNumber] = useState("");
  const [editMasterClientId, setEditMasterClientId] = useState(null);
  const [editMasterData, setEditMasterData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editid, setEditid] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchMasterClients();
  }, []);

  // Close Modal Function
  const closeModal = () => {
    setShowAddModal(false);
    setNewClientName("");
    setNewClientEmail("");
    setNewClientNumber("");
  };

  // Add Master Client
  const handleAddMasterClient = async () => {
    if (!newClientName.trim() || !newClientEmail.trim() || !newClientNumber.trim()) {
      showAlert({ variant: "error", title: "Error", message: "All fields are required" });
      return;
    }

    const result = await addMasterClient(newClientName, newClientEmail, newClientNumber);
    if (result.success) {
      closeModal();
    }
  };

  // Edit Master Client
  const handleEditMasterClick = (client) => {
    setEditMasterClientId(client.id);
    setEditMasterData({
      client_name: client.client_name || "",
      client_email: client.client_email || "",
      client_number: client.client_number || "",
    });
  };

  const handleMasterInputChange = (e, field) => {
    setEditMasterData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSaveMasterClick = async () => {
    await editMasterClient(editMasterClientId, editMasterData);
    setEditMasterClientId(null);
    setEditMasterData({});
  };

  // Delete Master Client
  const handleDeleteMasterClick = (id) => {
    setEditid(id);
    setDeleteConfirm(true);
  };

  const confirmDeleteMaster = () => {
    deleteMasterClient(editid);
    setDeleteConfirm(false);
    setEditid(null);
  };

  // Filter
  const filteredMasterClients = masterClients?.filter((client) => {
    if (!client) return false;
    const name = (client.client_name || "").toLowerCase();
    const email = (client.client_email || "").toLowerCase();
    const number = client.client_number || "";
    const search = searchQuery.toLowerCase().trim();
    return name.includes(search) || email.includes(search) || number.includes(search);
  }) || [];

  const totalPages = Math.ceil(filteredMasterClients.length / itemsPerPage);
  const paginatedMasterClients = filteredMasterClients.slice(
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
      <div className="">
        <SectionHeader icon={BarChart} title="Client Master Management" subtitle="Add, edit and manage your master clients" />
      </div>

      {/* Add New Client Button */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg bg-blue-600 hover:bg-blue-700 text-white transform hover:-translate-y-1"
          >
            Add Client
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search & Export */}
      <div className="p-8 bg-white border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="flex items-center w-full border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 ">
              {/* <Search className="left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /> */}
              <input
                type="text"
                className="w-full rounded-lg focus:outline-none py-2"
                placeholder="Search clients by name, email or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ClearButton onClick={clearSearch}>Clear</ClearButton>
            <ExportButton onClick={() => exportToExcel(masterClients || [], "master-clients.xlsx")} />
          </div>
        </div>
      </div>

      {/* Master Clients Table */}
      <div className="overflow-hidden">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[900px]">
            <table className="w-full">
              <thead className="border-b border-gray-800 bg-black text-white">
                <tr className="table-th-tr-row table-bg-heading">
                  <th className="px-4 py-2 font-medium text-xs text-center">Client Name</th>
                  <th className="px-4 py-2 font-medium text-xs text-center">Contact Email</th>
                  <th className="px-4 py-2 font-medium text-xs text-center">Contact Number</th>
                  <th className="px-4 py-2 font-medium text-xs text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="px-12 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Master Clients...</h3>
                          <p className="text-gray-500">Please wait while we fetch your data</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : paginatedMasterClients.length > 0 ? (
                  paginatedMasterClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 text-gray-800 font-medium text-xs text-center">
                        {editMasterClientId === client.id ? (
                          <input
                            type="text"
                            value={editMasterData.client_name || ""}
                            onChange={(e) => handleMasterInputChange(e, "client_name")}
                            className="w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <div className=" text-xs">{client.client_name || "N/A"}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-medium text-xs text-center">
                        {editMasterClientId === client.id ? (
                          <input
                            type="email"
                            value={editMasterData.client_email || ""}
                            onChange={(e) => handleMasterInputChange(e, "client_email")}
                            className="w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        ) : (
                          <div className=" text-xs ">{client.client_email || "N/A"}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-medium text-xs text-center">
                        {editMasterClientId === client.id ? (
                          <input
                            type="tel"
                            value={editMasterData.client_number || ""}
                            onChange={(e) => handleMasterInputChange(e, "client_number")}
                            className="w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        ) : (
                          <div className=" text-xs">{client.client_number || "N/A"}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-medium text-xs text-center">
                        <div className="flex items-center justify-center gap-3">
                          {editMasterClientId === client.id ? (
                            <>
                              <div className="group relative">
                                <IconSaveButton 
                                  onClick={handleSaveMasterClick}
                                  className="shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                                />
                                {/* <span className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-green-600 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg">
                                  Save Changes
                                </span> */}
                              </div>
                              <div className="group relative">
                                <IconCancelTaskButton 
                                  onClick={() => {
                                    setEditMasterClientId(null);
                                    setEditMasterData({});
                                  }}
                                  className="shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                                />
                                {/* <span className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-600 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg">
                                  Cancel Edit
                                </span> */}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="group relative">
                                <IconEditButton 
                                  onClick={() => handleEditMasterClick(client)}
                                  className="shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                                />
                                {/* <span className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-blue-600 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg">
                                  Edit Client
                                </span> */}
                              </div>
                              <div className="group relative">
                                <IconDeleteButton 
                                  onClick={() => handleDeleteMasterClick(client.id)}
                                  className="shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                                />
                                {/* <span className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-red-600 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg">
                                  Delete Client
                                </span> */}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-12 py-24 text-center">
                      <div className="flex flex-col items-center gap-6">
                        <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Master Clients Found</h3>
                          <p className="text-lg text-gray-600 max-w-md mx-auto">
                            Get started by adding your first master client using the form above.
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

      {/* Add Client Popup Modal */}
      {showAddModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50"
            onClick={closeModal}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Close Button */}
              <div className="p-8 pb-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Add New Client</h2>
                      <p className="text-gray-600">Fill in the client details below</p>
                    </div>
                  </div>
                  
                  {/* Close Button (X icon) */}
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-200 rounded-full transition-all duration-200 hover:scale-110 group"
                  >
                    <svg 
                      className="w-6 h-6 text-gray-500 group-hover:text-gray-700 transition-colors" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="clientName" className="block font-semibold text-gray-700 text-sm mb-2">
                      Client Name *
                    </label>
                    <input
                      id="clientName"
                      type="text"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      className="w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Enter full client name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="clientEmail" className="block font-semibold text-gray-700 text-sm mb-2">
                      Email *
                    </label>
                    <input
                      id="clientEmail"
                      type="email"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      className="w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="client@company.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="clientNumber" className="block font-semibold text-gray-700 text-sm mb-2">
                      Phone Number *
                    </label>
                    <input
                      id="clientNumber"
                      type="tel"
                      value={newClientNumber}
                      onChange={(e) => setNewClientNumber(e.target.value)}
                      className="w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="1234567890"
                    />
                  </div>
                </div>

                {/* Add Button Only */}
                <div className="md:col-span-2 flex justify-end space-x-3 mt-6">
                    <SubmitButton 
                        disabled={isLoading || !newClientName.trim() || !newClientEmail.trim() || !newClientNumber.trim()}
                        onClick={handleAddMasterClient}
                        loading={isLoading}
                        loadingText="Adding Client..."
                    >
                        Add Client
                    </SubmitButton>
                    </div>
              </div>
            </div>
          </div>
        </>
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
                Are you absolutely sure you want to delete this master client? 
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
                  onClick={confirmDeleteMaster}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-bold shadow-2xl hover:shadow-3xl hover:from-red-600 hover:to-red-700 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
