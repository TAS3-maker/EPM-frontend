import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../utils/ApiConfig";
import { useAlert } from "./AlertContext";

const MasterClientContext = createContext();

export const MasterClientProvider = ({ children }) => {
    const { showAlert } = useAlert();
    const [isLoading, setIsLoading] = useState(false);
    const [masterClients, setMasterClients] = useState([]);
    const [paginationMeta,setPaginationMeta]=useState({
        current_page:1,
        last_page:1,
        total:0
    })
    const navigate = useNavigate();
    const token = localStorage.getItem("userToken");
const refreshCurrentPage = async () => {
  const currentParams = { page: paginationMeta.current_page, per_page: 10 };
  await fetchMasterClients(currentParams.page, currentParams.per_page);
};
    const handleUnauthorized = (response) => {
        if (response.status === 401) {
            localStorage.removeItem("userToken");
            navigate("/");
            return true;
        }
        return false;
    };

    const fetchMasterClients = async (page = 1, perPage = 10, filters = {}) => {
        setIsLoading(true);
        try {

            const params=new URLSearchParams({
                  page: page.toString(),
      per_page: perPage.toString(),
      ...(filters.search && { search: filters.search }),
      ...(filters.search_by && { search_by: filters.search_by })
            })
            const url=`${API_URL}/api/clients-master-get?${params}`







            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (handleUnauthorized(response)) return;
            const data = await response.json();
            if (response.ok) {
                setMasterClients(Array.isArray(data) ? data : data.data.data || []);
                setPaginationMeta({current_page:data.data.current_page,
                    last_page:data.data.last_page,
                    total:data.data.total
                })
                
            } else {
                console.error("Failed to fetch master clients:", data);
            }
        } catch (error) {
            console.error("❌ Error fetching master clients:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const addMasterClient = async (name, email, number) => {
  console.log("🟢 addMasterClient called with:", { name, email, number });
  setIsLoading(true);

  // 🔥 CLIENT-SIDE VALIDATION (unchanged)
  if (!name?.trim()) {
    showAlert({ variant: "error", title: "Error", message: "Name is required" });
    setIsLoading(false);
    return { success: false };
  }


if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

}


const trimmedEmail = email?.trim();
if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
  showAlert({ variant: "error", title: "Error", message: "Invalid email format" });
  setIsLoading(false);
  return { success: false };
}

  try {
            const response = await fetch(`${API_URL}/api/clients-master-add`, {

        
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        client_name: name.trim(),
        client_email: email.trim(),
        client_number: number.trim()
      })
    });

    const result = await response.json();
    await refreshCurrentPage();

    if (!result.success) {
      if (result.errors) {
        const firstErrorField = Object.keys(result.errors)[0];
        const firstErrorMessage = result.errors[firstErrorField][0];
        
        showAlert({
          variant: "error", 
          title: "Duplicate Entry", 
          message: firstErrorMessage
        });
        setIsLoading(false);
        return { success: false };
      }
      
   
      showAlert({
        variant: "error", 
        title: "Error", 
        message: result.message 
      });
      setIsLoading(false);
      return { success: false };
    }

   
    showAlert({ 
      variant: "success", 
      title: "Success", 
      message: "Client created successfully!" 
    });
    setIsLoading(false);
    return { success: true };

  } catch (error) {
    console.error("❌ API Error:", error);
    showAlert({
      variant: "error", 
      title: "Network Error", 
      message: "Failed to connect to server. Please try again."
    });
    setIsLoading(false);
    return { success: false };
  }
};

    const editMasterClient = async (id, updatedData) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/clients-master-update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedData),
            });
            if (handleUnauthorized(response)) return { success: false };
            const data = await response.json();
            if (response.ok) {
                showAlert({ 
                    variant: "success", 
                    title: "Success", 
                    message: "Master client updated successfully" 
                });
                await refreshCurrentPage();
                return { success: true };
            } else {
                showAlert({ 
                    variant: "error", 
                    title: "Error", 
                    message: data.message || "Update failed" 
                });
                return { success: false, error: data.message };
            }
        } catch (error) {
            console.error("❌ Error updating master client:", error);
            showAlert({ 
                variant: "error", 
                title: "Error", 
                message: "An error occurred while updating master client." 
            });
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const deleteMasterClient = async (id) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/clients-master-delete/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (handleUnauthorized(response)) return { success: false };
            if (response.ok) {
                showAlert({ 
                    variant: "success", 
                    title: "Success", 
                    message: "Master client deleted successfully!" 
                });
                // Optimistic update
                setMasterClients((prev) => 
                    Array.isArray(prev) ? prev.filter((client) => client.id !== id) : []
                );
                await refreshCurrentPage();
                return { success: true };
            } else {
                const data = await response.json();
                showAlert({ 
                    variant: "error", 
                    title: "Error", 
                    message: data.message || "Failed to delete master client." 
                });
                return { success: false, error: data.message };
            }
        } catch (error) {
            console.error("❌ Error deleting master client:", error);
            showAlert({ 
                variant: "error", 
                title: "Error", 
                message: "An error occurred while deleting master client." 
            });
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    


    const value = {
        masterClients,
        isLoading,
        addMasterClient,
        fetchMasterClients,
        editMasterClient,
        deleteMasterClient,
        paginationMeta,         // ✅ Add
        totalPages: paginationMeta.last_page || 1  // ✅ Add
    };

    return (
        <MasterClientContext.Provider value={value}>
            {children}
        </MasterClientContext.Provider>
    );
};

export const useMasterClient = () => {
    const context = useContext(MasterClientContext);
    if (!context) {
        throw new Error("useMasterClient must be used within MasterClientProvider");
    }
    return context;
};
