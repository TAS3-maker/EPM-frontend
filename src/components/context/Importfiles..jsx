import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { API_URL } from "../utils/ApiConfig";
import { useAlert } from "./AlertContext";

// Create Context
const ImportContext = createContext();

// Custom hook
export const useImport = () => useContext(ImportContext);

// Provider Component
export const ImportProvider = ({ children }) => {
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(null);
  const { showAlert } = useAlert();

  // Single import function with fixed URL
const handleImport = async (file) => {
  // console.log("Uploading file:", file);
  setImportLoading(true);
  setImportError(null);
  setImportSuccess(null);

  try {
    const token = localStorage.getItem("userToken");
    const formData = new FormData();
    formData.append("file", file); // Key must match backend expectation

    const response = await axios.post(`${API_URL}/api/clients/import-csv`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    // console.log("Import response:", response);

    const {
      inserted_count = 0,
      skipped_count = 0,
      skipped_details = [],
      message = "Client import completed.",
    } = response?.data || {};

    // Prepare alert messages
    const successMsg = inserted_count > 0
      ? `${inserted_count} client${inserted_count > 1 ? "s" : ""} imported successfully.`
      : null;

    const failedMsg = skipped_count > 0
      ? `${skipped_count} row${skipped_count > 1 ? "s were" : " was"} skipped due to errors like duplicates or invalid data.`
      : null;

    // Show success if any rows were imported
    if (inserted_count > 0) {
      setImportSuccess(message);
      showAlert({
        variant: "success",
        title: "Import Result",
        message: `${successMsg}${failedMsg ? `\n\nFailed: ${failedMsg}` : ""}`,
      });
    }

    // Show failure if all rows were skipped
    if (inserted_count === 0 && skipped_count > 0) {
      setImportError("Import failed: No new clients were added.");
      showAlert({
        variant: "error",
        title: "Import Failed",
        message: failedMsg || "No data was imported.",
      });
    }

    // Show generic error if neither success nor failure info is clear
    if (inserted_count === 0 && skipped_count === 0) {
      setImportError("No valid data found in the uploaded file.");
      showAlert({
        variant: "error",
        title: "Import Failed",
        message: "The file was processed, but no valid data was found to import.",
      });
    }

    return response.data;
  } catch (error) {
    const errMsg = error?.response?.data?.message || "Import failed due to a server error.";
    setImportError(errMsg);
    showAlert({
      variant: "error",
      title: "Import Error",
      message: errMsg,
    });
    throw error;
  } finally {
    setImportLoading(false);
  }
};




  // Reuse the same fixed import function for all
  const importClientData = handleImport;
  const importProjectData = handleImport;
  const importEmployeeData = handleImport;

  return (
    <ImportContext.Provider
      value={{
        importClientData,
        importProjectData,
        importEmployeeData,
        importLoading,
        importError,
        importSuccess,
      }}
    >
      {children}
    </ImportContext.Provider>
  );
};
