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
import GlobalTable from '../../../components/GlobalTable';


export const ClientMastertable = () => {
  const {
    masterClients,
    isLoading,
    fetchMasterClients,
    addMasterClient,
    editMasterClient,
    deleteMasterClient,
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
  const [searchType, setSearchType] = useState("name");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [importType, setImportType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchMasterClients();
  }, []);

  
  const filteredClients =
    masterClients?.filter((c) => {
      const search = searchQuery.toLowerCase();

      if (searchType === "name")
        return c.client_name?.toLowerCase().includes(search);

      if (searchType === "email")
        return c.client_email?.toLowerCase().includes(search);

      if (searchType === "number")
        return c.client_number?.includes(search);

      return true;
    }) || [];

  
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

const employeePermission = permissions?.permissions?.[0]?.clients;
  const canAddEmployee = employeePermission === "2"; 
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, searchType]);

  
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages]);

  
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


// Columns for Client Master Table
const columns = [
  {
    key: 'client_name',
    label: 'Client Name',
    render: (client) => (
      <div className="text-gray-600 font-normal text-xs">
        {editingId === client.id ? (
          <input
            value={editedData.client_name}
            onChange={(e) =>
              setEditedData({
                ...editedData,
                client_name: e.target.value,
              })
            }
            className="border p-1 w-full text-left"
          />
        ) : (
          client.client_name
        )}
      </div>
    )
  },
  {
    key: 'client_email',
    label: 'Email',
    render: (client) => (
      <div className="text-gray-600 font-normal text-xs">
        {editingId === client.id ? (
          <input
            value={editedData.client_email}
            onChange={(e) =>
              setEditedData({
                ...editedData,
                client_email: e.target.value,
              })
            }
            className="border p-1 w-full text-left"
          />
        ) : (
          client.client_email
        )}
      </div>
    )
  },
  {
    key: 'client_number',
    label: 'Number',
    render: (client) => (
      <div className="text-gray-600 font-normal text-xs">
        {editingId === client.id ? (
          <input
            value={editedData.client_number}
            onChange={(e) =>
              setEditedData({
                ...editedData,
                client_number: e.target.value,
              })
            }
            className="border p-1 w-full text-left"
          />
        ) : (
          client.client_number
        )}
      </div>
    )
  }
];

// Actions renderer
const renderActions = (client) => {
  if (!canAddEmployee) return null;
  
  return (
    <div className="flex justify-center gap-2">
      {editingId === client.id ? (
        <>
          <IconSaveButton onClick={handleSaveClick} />
          <IconCancelTaskButton onClick={() => setEditingId(null)} />
        </>
      ) : (
        <>
          <IconViewButton onClick={() => handleViewClick(client.id)} />
          <IconEditButton onClick={() => handleEditClick(client)} />
          <IconDeleteButton onClick={() => deleteMasterClient(client.id)} />
        </>
      )}
    </div>
  );
};




  
  
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-md max-h-screen overflow-y-auto">
      <SectionHeader
        icon={BarChart}
        title="Client Management"
        subtitle="View, edit and manage clients"
      />

      
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 md:sticky top-0 bg-white z-10 shadow-md">
        <div className="flex gap-3">
          {canAddEmployee && (
          <button
            onClick={() => setShowAddModal(true)}
            className="add-items-btn"
          >
            Add Client
          </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white cursor-pointer focus:outline-none"
          >
            <option value="name">Client Name</option>
            <option value="email">Email</option>
            <option value="number">Phone No</option>
          </select>

          <div className="flex items-center border px-2 rounded-lg">
            <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
            <input
              type="text"
              className="rounded-lg focus:outline-none py-2"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <ClearButton onClick={() => setSearchQuery("")} />
          <ImportButton onClick={() => setShowImportOptions(true)} />
          {/* <ImportButton/> */}
          <ExportButton
            onClick={() =>
              exportToExcel(masterClients.project || [], "master-clients.xlsx")
            }
          />
        </div>
      </div>

      
     {/* Replace your entire table section with this */}
<div className="overflow-x-auto">
  <GlobalTable
    data={paginatedClients}
    columns={columns}
    paginatedData={paginatedClients}
    isLoading={isLoading}
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={setCurrentPage}
    actionsComponent={{ right: renderActions }}
    emptyStateTitle="No clients found"
    emptyStateMessage="No clients match your search criteria."
    className="border-none"
    hideActions={!canAddEmployee} // Hide actions if no permission
  />
</div>

      
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


