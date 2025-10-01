import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../utils/ApiConfig";
import { useAlert } from "./AlertContext";
const ClientContext = createContext();
export const ClientProvider = ({ children }) => {
    const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [clients, setClients] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("userToken");
  // console.log(token);
  const handleUnauthorized = (response) => {
    if (response.status === 401) {
      localStorage.removeItem("userToken");
      navigate("/");
      return true;
    }
    return false;
  };

// ---------------------------
// addClient function with detailed backend errors
// ---------------------------
const addClient = async (
  clienttype,
  name,
  hiringId,
  contactEmail,
  contactnumber,
  address,
  companyname,
  communication
  // projectType
) => {
  console.log("🟢 addClient called with:", {
    clienttype,
    name,
    hiringId,
    contactEmail,
    contactnumber,
    address,
    companyname,
    communication,
  });

  setIsLoading(true);
  setMessage("");

  // ---------------------------
  // FRONTEND VALIDATION
  // ---------------------------
  let frontendErrors = {};
  if (!clienttype?.trim()) frontendErrors.client_type = ["Client type is required"];
  if (!name?.trim()) frontendErrors.name = ["Client name is required"];
  if (!contactEmail?.trim()) frontendErrors.client_email = ["Contact email is required"];
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail))
    frontendErrors.client_email = ["Invalid email format"];
  if (!contactnumber?.trim()) frontendErrors.contact_number = ["Contact number is required"];
  if (contactnumber && !/^[0-9]{10}$/.test(contactnumber))
    frontendErrors.contact_number = ["Contact number must be 10 digits"];
  if (!communication?.trim()) frontendErrors.communication = ["Communication is required"];

  if (clienttype === "Hired on Upwork" && !hiringId?.trim())
    frontendErrors.hire_on_id = ["Hiring ID is required for Upwork clients"];

  if (clienttype === "Direct") {
    if (!companyname?.trim()) frontendErrors.company_name = ["Company name is required"];
    if (!address?.trim()) frontendErrors.company_address = ["Address is required"];
  }

  if (Object.keys(frontendErrors).length > 0) {
    console.warn("⚠️ Frontend validation errors:", frontendErrors);
    showAlert?.({
      variant: "error",
      title: "Validation Error",
      message: Object.values(frontendErrors)
        .flat()
        .join("\n"),
    });
    setIsLoading(false);
    return { success: false, errors: frontendErrors };
  }

  // ---------------------------
  // PREPARE CLIENT DATA
  // ---------------------------
  const clientData = {
    client_type: clienttype?.trim(),
    name: name?.trim(),
    client_email: contactEmail?.trim(),
    client_number: contactnumber?.trim(),
    communication: communication?.trim(),
    ...(clienttype === "Hired on Upwork"
      ? { hire_on_id: hiringId?.trim() || null }
      : {
          company_name: companyname?.trim() || null,
          company_address: address?.trim() || null,
        }),
    // project_type: projectType?.trim() || null,
  };

  console.log("🚀 Sending clientData to server:", clientData);

  try {
    const response = await fetch(`${API_URL}/api/clients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(clientData),
    });

    const rawResponse = await response.text();
    console.log("📥 Raw response from server:", rawResponse);

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error("❌ Response is not valid JSON:", rawResponse, parseError);
      showAlert({
        variant: "error",
        title: "Server Error",
        message: "The server returned an unexpected response. Please check the server.",
      });
      return { success: false, errors: { server: ["Invalid server response"] } };
    }

    // ---------------------------
    // HANDLE SERVER RESPONSE
    // ---------------------------
    if (response.ok && data.success) {
      console.log("✅ Client added successfully:", data);
      showAlert({
        variant: "success",
        title: "Success",
        message: "Client added successfully",
      });
      fetchClients(); // refresh clients list
      return { success: true, errors: {} };
    }

    // Backend validation errors (422)
    if (response.status === 422 && data.errors) {
      console.error("❌ Backend validation errors:", data.errors);
      const formattedErrors = {};
      Object.entries(data.errors).forEach(([field, messages]) => {
        formattedErrors[field] = Array.isArray(messages) ? messages : [messages];
      });

      // ✅ Show alert with actual field errors
      const errorMessage = Object.entries(formattedErrors)
        .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
        .join("\n");

      showAlert({
        variant: "error",
        title: "Validation Error",
        message: errorMessage,
      });

      return { success: false, errors: formattedErrors };
    }

    // Other backend errors
    console.error("❌ Backend error:", data);
    showAlert({
      variant: "error",
      title: "Error",
      message: data.message || "An unexpected error occurred.",
    });
    return { success: false, errors: { server: [data.message || "Unknown error"] } };
  } catch (error) {
    console.error("❌ Network / Fetch error:", error);
    showAlert({
      variant: "error",
      title: "Error",
      message: "Something went wrong. Please try again.",
    });
    return { success: false, errors: { network: [error.message] } };
  } finally {
    setIsLoading(false);
  }
};









  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/clients`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (handleUnauthorized(response)) return;
      const data = await response.json();
      if (response.ok) {
        setClients(data);
        // console.log("these are clients",clients);
      } else {
        setMessage("Failed to fetch clients.");
      }
    } catch (error) {
      setMessage("An error occurred while fetching clients.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const editClient = async (id, updatedData) => {
  
    setIsLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/api/clients/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });
      if (handleUnauthorized(response)) return;
      const data = await response.json();
      if (response.ok) {
        showAlert({ variant: "success", title: "Success", message: "Client updated successfully" });
        fetchClients();
      } else {
        showAlert({ variant: "error", title: "Error", message: data.message });
      }
    } catch (error) {
      showAlert({ variant: "error", title: "Error", message: "An error occurred while updating the client." });
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteClient = async (id) => {
    setIsLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/api/clients/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (handleUnauthorized(response)) return;
      if (response.ok) {
        showAlert({ variant: "success", title: "Success", message: "Client deleted successfully!" });
        setClients((prevClients) =>
          Array.isArray(prevClients) ? prevClients.filter((client) => client.id !== id) : []
        );
        fetchClients();
      } else {
        showAlert({ variant: "error", title: "Error", message:"Failed to delete client." });
      }
    } catch (error) {
      showAlert({ variant: "error", title: "Error", message:"An error occurred while deleting the client." });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchClients();
  }, []);
  return (
    <ClientContext.Provider value={{ addClient, fetchClients, editClient, deleteClient, clients, isLoading, message }}>
      {children}
    </ClientContext.Provider>
  );
};
export const useClient = () => useContext(ClientContext);
