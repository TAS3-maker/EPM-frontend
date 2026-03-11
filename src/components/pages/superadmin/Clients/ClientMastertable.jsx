import React, { useEffect, useState } from "react";
import { useMasterClient } from "../../../context/MasterClientContext";
import { useImport } from "../../../context/Importfiles.";
import { Loader2, Search, BarChart, Loader } from "lucide-react";
import { FaFileCsv } from "react-icons/fa";
import { exportToExcel } from "../../../components/excelUtils";
import {
  ClearButton,
  ExportButton,
  ImportButton,
  IconCancelTaskButton,
  IconSaveButton,
  IconDeleteButton,
  IconEditButton,
  SubmitButton,
  CancelButton,
  IconViewButton,
} from "../../../AllButtons/AllButtons";
import { useNavigate } from "react-router-dom";

import Pagination from "../../../components/Pagination";
import { useAlert } from "../../../context/AlertContext";
import { SectionHeader } from "../../../components/SectionHeader";
import { usePermissions } from "../../../context/PermissionContext";
import { useOutsideClick } from "../../../components/useOutsideClick";
export const ClientMastertable = () => {
  const {
    masterClients,
    isLoading,
    fetchMasterClients,
    addMasterClient,
    editMasterClient,
    deleteMasterClient,
    paginationMeta,
    totalPages
  } = useMasterClient();
const userRole = localStorage.getItem("user_name");
  const { importClientData, importLoading } = useImport();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

 const {permissions}=usePermissions()
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientNumber, setNewClientNumber] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});

  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("client_name");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [importType, setImportType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
fetchMasterClients(1, 10);  
  }, []);


const handlePageChange = (page) => {
  setCurrentPage(page);
  fetchMasterClients(page, 10);
};
useEffect(() => {
  if (paginationMeta?.current_page) {
    setCurrentPage(paginationMeta.current_page);
  }
}, [paginationMeta?.current_page]);


const employeePermission = permissions?.permissions?.[0]?.clients;
  const canAddEmployee = employeePermission === "2"; 

  
  const handleEditClick = (client) => {
    setEditingId(client.id);
    setEditedData({
      client_name: client.client_name,
      client_email: client.client_email,
      client_number: client.client_number,
    });
  };

   const handleViewClick = (clientId) => {
    navigate(`/${userRole}/clients/client-data/${clientId}`);
  };


  const handleSaveClick = async () => {
    await editMasterClient(editingId, editedData);
    setEditingId(null);
    setEditedData({});
  };

  const handleAddClient = async () => {
    if (!newClientName ) {
      showAlert({
        variant: "error",
        title: "Error",
        message: "All fields are required",
      });
      return;
    }

    await addMasterClient(newClientName, newClientEmail, newClientNumber);
    setShowAddModal(false);
    setNewClientName("");
    setNewClientEmail("");
    setNewClientNumber("");
    setCurrentPage(1);
  };

  const handleImportSubmit = async () => {
    if (!selectedFile) return;

    await importClientData(selectedFile);
    setImportType("");
    setSelectedFile(null);
    fetchMasterClients();
    setCurrentPage(1);
  };

  const handleCloseAddModal = () => {
  setShowAddModal(false);
  setNewClientName("");
  setNewClientEmail("");
  setNewClientNumber("");
};

const addModalRef = useOutsideClick(showAddModal, handleCloseAddModal);


const handleCloseImportOptions = () => {
  setShowImportOptions(false);
  setImportType("");
  setSelectedFile(null);
};

const importOptionsRef = useOutsideClick(showImportOptions, handleCloseImportOptions);

  
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-md max-h-screen overflow-y-auto">
      <SectionHeader
        icon={BarChart}
        title="Client Management"
        subtitle="View, edit and manage clients"
      />

      
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 md:sticky top-0 bg-white z-10 shadow-md">
        <div className="flex gap-3">
          {canAddEmployee && (
          <button
            onClick={() => setShowAddModal(true)}
            className="add-items-btn text-sm"
          >
            Add Client
          </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="px-3 py-1.5 border rounded-md bg-white cursor-pointer focus:outline-none"
          >
            <option value="client_name">Client Name</option>
            <option value="client_email">Email</option>
            <option value="client_number">Phone No</option>
          </select>

          <div className="flex items-center border px-2 rounded-lg">
            <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
           <input
  type="text"
  className="rounded-lg focus:outline-none py-1.5 text-sm"
  placeholder={`Search ${searchType.toUpperCase()}...`}
  value={searchQuery}
  onChange={(e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
    // ✅ Server-side search
    fetchMasterClients(1, 10, {
      search: e.target.value,
      search_by: searchType  // "name", "email", "number"
    });
  }}
/>

          </div>

          <ClearButton 
  onClick={() => {
    setSearchQuery("");
    setSearchType("client_name");
    setCurrentPage(1);
    fetchMasterClients(1, 10, {});  // ✅ Clear filters
  }} 
/>

          <ImportButton onClick={() => setShowImportOptions(true)} />
          {/* <ImportButton/> */}
          <ExportButton
            onClick={() =>
              exportToExcel(masterClients.project || [], "master-clients.xlsx")
            }
          />
        </div>
      </div>

      
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-800 bg-black text-white">
            <tr className="table-th-tr-row table-bg-heading">
              <th className="px-4 py-2 font-medium text-xs text-center">Client Name</th>
              <th className="px-4 py-2 font-medium text-xs text-center">Email</th>
              <th className="px-4 py-2 font-medium text-xs text-center">Number</th>
              <th className="px-4 py-2 font-medium text-xs text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan="4" className="py-10 text-center">
                  <Loader2 className="animate-spin mx-auto" />
                </td>
              </tr>
            ) : masterClients.length ? (
              masterClients.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors duration-150" onClick={(e) => {handleViewClick(c.id)}}>
                  <td className="px-6 py-3 text-gray-600 font-normal text-[10px] leading-[14px] text-center">
                    {editingId === c.id ? (
                      <input
                        value={editedData.client_name}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            client_name: e.target.value,
                          })
                        }
                        className="border p-1 w-full"
                      />
                    ) : (
                      c.client_name
                    )}
                  </td>

                  <td className="px-6 py-4 text-gray-600 font-normal text-[10px] leading-[14px] text-center">
                    {editingId === c.id ? (
                      <input
                        value={editedData.client_email}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            client_email: e.target.value,
                          })
                        }
                        className="border p-1 w-full"
                      />
                    ) : (
                      c.client_email
                    )}
                  </td>

                  <td className="px-6 py-4 text-gray-600 font-normal text-[10px] leading-[14px] text-center">
                    {editingId === c.id ? (
                      <input
                        value={editedData.client_number}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            client_number: e.target.value,
                          })
                        }
                        className="border p-1 w-full"
                      />
                    ) : (
                      c.client_number
                    )}
                  </td>
{canAddEmployee&&(
                  <td className="px-6 py-4 text-gray-600 font-normal text-[10px] leading-[14px] text-center">
             
                    {editingId === c.id ? (
                      <div className="flex justify-center gap-2">
                        {/* <IconSaveButton onClick={handleSaveClick} /> */}
                        <IconSaveButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveClick();
                          }}
                        />
                        <IconCancelTaskButton
                          onClick={(e) => {
                            e.stopPropagation(); 
                            setEditingId(null)
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex justify-center gap-2">
                          <IconViewButton  
                            onClick={(e)=>{
                               e.stopPropagation(); 
                               handleViewClick(c.id)
                            }} 
                            />
                        <IconEditButton 
                          onClick={(e) => {
                            e.stopPropagation(); 
                            handleEditClick(c)
                           }} 
                           />
                        <IconDeleteButton
                          onClick={(e) => {
                            e.stopPropagation(); 
                            deleteMasterClient(c.id)
                           }}
                        />
                      </div>
                      
                    )}
                  </td>
)}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-10 text-center text-gray-500">
                  No clients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      
      {showImportOptions && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div ref={importOptionsRef} className="bg-white p-6 rounded-lg w-96">
            <h3 className="font-semibold mb-4 text-center">
              Select Import Type
            </h3>

            <button
              onClick={() => {
                setImportType("excel");
                setShowImportOptions(false);
              }}
              className="flex items-center justify-center gap-3 border p-3 rounded w-full"
            >
              <FaFileCsv className="text-green-600 text-xl" />
              Import CSV / Excel
            </button>

            <div className="mt-4 text-center">
              <CancelButton onClick={() => setShowImportOptions(false)} />
            </div>
          </div>
        </div>
      )}

     
      {importType === "excel" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          {!importLoading ? (
            <div className="bg-white p-6 rounded-lg w-96">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="border p-2 w-full mb-4"
              />

              <button
                onClick={handleImportSubmit}
                disabled={!selectedFile}
                className="bg-blue-600 text-white w-full py-2 rounded"
              >
                Upload
              </button>

              <div className="mt-3 text-center">
                <CancelButton onClick={() => setImportType("")} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Loader className="animate-spin text-white w-10 h-10" />
              <p className="text-white">Importing...</p>
            </div>
          )}
        </div>
      )}

      
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div ref={addModalRef} className="bg-white p-6 rounded-xl w-96">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Add New Client
            </h3>

            <input
              className="border w-full p-2 mb-2"
              placeholder="Client Name"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
            />
            <input
              className="border w-full p-2 mb-2"
              placeholder="Client Email"
              value={newClientEmail}
              onChange={(e) => setNewClientEmail(e.target.value)}
            />
            <input
              className="border w-full p-2 mb-4"
              placeholder="Client Number"
              value={newClientNumber}
              onChange={(e) => setNewClientNumber(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <CancelButton onClick={() => setShowAddModal(false)} />
              <SubmitButton className="!mb-0" onClick={handleAddClient} />
            </div>
          </div>
        </div>
      )}



    </div>
  );
};


