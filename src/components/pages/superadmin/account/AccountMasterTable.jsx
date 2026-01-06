import React, { useEffect, useState } from "react";
import { useAccount } from "../../../context/AccountContext";
import { Loader2, Search, Plus, Trash2, X, Banknote } from "lucide-react";
import { ClearButton, IconSaveButton, IconCancelTaskButton, IconEditButton, IconDeleteButton } from "../../../AllButtons/AllButtons";
import Pagination from "../../../components/Pagination";
import { useAlert } from "../../../context/AlertContext";
import { SectionHeader } from '../../../components/SectionHeader';
import { usePermissions } from "../../../context/PermissionContext";

export const AccountMasterTable = () => {
  const { accounts, isAccountLoading, fetchAccounts, addAccount, editAccount, deleteAccount, projectSources } = useAccount();
  const { showAlert } = useAlert();
const {permissions}=usePermissions()

 
  const [newSourceId, setNewSourceId] = useState("");
  const [newAccountName, setNewAccountName] = useState("");
  const [editAccountId, setEditAccountId] = useState(null);
  const [editAccountData, setEditAccountData] = useState({ sourceId: "", accountName: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editid, setEditid] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAccounts();
  }, []);

 const employeePermission=permissions?.permissions?.[0]?.account_master
  const canAddEmployee=employeePermission==="2"
  const handleAddAccount = async () => {
    if (!newSourceId) {
      showAlert({ variant: "error", title: "Error", message: "Source is required" });
      return;
    }
    if (!newAccountName.trim()) {
      showAlert({ variant: "error", title: "Error", message: "Account name is required" });
      return;
    }

    await addAccount({ sourceId: newSourceId, accountName: newAccountName });
    if (!isAccountLoading) {
      setNewSourceId("");
      setNewAccountName("");
      setIsModalOpen(false);
    }
  };

  
  const handleEditAccountClick = (account) => {
    setEditAccountId(account.id);
    setEditAccountData({
      sourceId: account.source_id?.toString() || "",
      accountName: account.account_name || "",
    });
  };

  const handleSourceIdChange = (e) => {
    setEditAccountData((prev) => ({
      ...prev,
      sourceId: e.target.value,
    }));
  };

  const handleAccountNameChange = (e) => {
    setEditAccountData((prev) => ({
      ...prev,
      accountName: e.target.value,
    }));
  };

  const handleSaveAccountClick = async () => {
    await editAccount(editAccountId, editAccountData);
    setEditAccountId(null);
    setEditAccountData({ sourceId: "", accountName: "" });
  };

  
  const handleDeleteAccountClick = (id) => {
    setEditid(id);
    setDeleteConfirm(true);
  };

  const confirmDeleteAccount = () => {
    deleteAccount(editid);
    setDeleteConfirm(false);
    setEditid(null);
  };

 
  const filteredAccounts = accounts?.filter((account) => {
    if (!account) return false;
    const sourceName = projectSources.find(s => s.id === account.source.id)?.source_name || "";
    const accountName = (account.account_name || "").toLowerCase();
    const search = searchQuery.toLowerCase().trim();
    return sourceName.toLowerCase().includes(search) || accountName.includes(search);
  }) || [];

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const paginatedAccounts = filteredAccounts.slice(
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

 
  const getSourceName = (sourceId) => {
    const source = projectSources.find(s => s.id === sourceId);
    return source ? source.source_name : "N/A";
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-md max-h-screen overflow-y-auto">
     
      <div>
        <SectionHeader 
          icon={Banknote} 
          title="Account Master Management" 
          subtitle="Add, edit and manage your project accounts" 
        />
      </div>

      
      <div className="p-8 bg-white border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="flex items-center w-full border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 ">
              {/* <Search className="left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /> */}
              <input
                type="text"
                className="w-full rounded-lg focus:outline-none py-2"
                placeholder="Search by source or account name..."
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
              Add Account
            </button>
            )}
          </div>
        </div>
      </div>

     
      <div className="overflow-hidden">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[900px]">
            <table className="w-full">
              <thead className="border-b border-gray-800 bg-black text-white">
                <tr className="table-th-tr-row table-bg-heading">
                  <th className="px-4 py-2 font-medium text-xs text-center">Source</th>
                  <th className="px-4 py-2 font-medium text-xs text-center">Account Name</th>
                  <th className="px-4 py-2 font-medium text-xs text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isAccountLoading ? (
                  <tr>
                    <td colSpan="3" className="px-12 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Accounts...</h3>
                          <p className="text-gray-500">Please wait while we fetch your data</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : paginatedAccounts.length > 0 ? (
                  paginatedAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 text-gray-800 font-medium text-xs text-center">
                        {editAccountId === account.id ? (
                          <select
                            value={editAccountData.sourceId || ""}
                            onChange={handleSourceIdChange}
                            className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 text-lg font-semibold"
                            autoFocus
                          >
                            <option value="">Select Source</option>
                            {projectSources.map((source) => (
                              <option key={source.id} value={source.id}>
                                {source.source_name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-xs">{getSourceName(account.source.id)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-medium text-xs text-center">
                        {editAccountId === account.id ? (
                          <input
                            type="text"
                            value={editAccountData.accountName || ""}
                            onChange={handleAccountNameChange}
                            className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 text-lg font-semibold"
                          />
                        ) : (
                          <div className="text-xs">{account.account_name || "N/A"}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-medium text-xs text-center">
                        <div className="flex items-center justify-center gap-3">
                          {editAccountId === account.id ? (
                            <>
                              <IconSaveButton 
                                onClick={handleSaveAccountClick}
                                className="shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                              />
                              <IconCancelTaskButton 
                                onClick={() => {
                                  setEditAccountId(null);
                                  setEditAccountData({ sourceId: "", accountName: "" });
                                }}
                                className="shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                              />
                            </>
                          ) : (
                            <>
                            {canAddEmployee&&(
                              <IconEditButton 
                                onClick={() => handleEditAccountClick(account)}
                                className="shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                              />
                            )}
                            {canAddEmployee&&(
                              <IconDeleteButton 
                                onClick={() => handleDeleteAccountClick(account.id)}
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
                    <td colSpan="3" className="px-12 py-24 text-center">
                      <div className="flex flex-col items-center gap-6">
                        <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Accounts Found</h3>
                          <p className="text-lg text-gray-600 max-w-md mx-auto">
                            Get started by adding your first account using the button above.
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

    
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4" role="dialog">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setNewSourceId("");
                  setNewAccountName("");
                }}
                className="absolute top-6 right-6 text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Account</h2>
              <p className="text-gray-600 mb-8">Enter details for the new project account</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Source *</label>
                  <select
                    value={newSourceId}
                    onChange={(e) => setNewSourceId(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                  >
                    <option value="">Select Source</option>
                    {projectSources.map((source) => (
                      <option key={source.id} value={source.id}>
                        {source.source_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Account Name *</label>
                  <input
                    type="text"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                    placeholder="e.g. 6768594322, john@company.com"
                  />
                </div>
                
                <div className="flex items-center gap-4 pt-2">
                  <button
                    onClick={handleAddAccount}
                    disabled={isAccountLoading || !newSourceId || !newAccountName.trim()}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 justify-center"
                  >
                    {isAccountLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Account"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setNewSourceId("");
                      setNewAccountName("");
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

      
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-3xl flex items-center justify-center">
                <Trash2 className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirm Delete</h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Are you absolutely sure you want to delete this account? 
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
                  onClick={confirmDeleteAccount}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-bold shadow-2xl hover:shadow-3xl hover:from-red-600 hover:to-red-700 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
