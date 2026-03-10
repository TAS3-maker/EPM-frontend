
import React, { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../utils/ApiConfig";
import { useNavigate } from "react-router-dom";
import { useAlert } from "./AlertContext";

const CommunicationTypeContext = createContext();

export const CommunicationTypeProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [communicationTypes, setCommunicationTypes] = useState([]);
  const [paginationMeta,setPaginationMeta]=useState({
    current_page:1,
    last_page:1,
    total:0
  })
  const { showAlert } = useAlert();
  const token = localStorage.getItem("userToken");
  const navigate = useNavigate();
const refreshCurrentPage = async () => {
  const currentParams = { page: paginationMeta.current_page, per_page: 10 };
  await fetchCommunicationTypes(currentParams.page, currentParams.per_page);
};
  const handleUnauthorized = (response) => {
    if (response.status === 401) {
      localStorage.removeItem("userToken");
      navigate("/");
      return true;
    }
    return false;
  };

  const addCommunicationType = async (medium, mediumDetails) => {
    if (!medium || medium.trim() === "") {
      showAlert({ variant: "warning", title: "Missing Field", message: "Please enter medium." });
      return;
    }
    
    if (!mediumDetails || mediumDetails.trim() === "") {
      showAlert({ variant: "warning", title: "Missing Field", message: "Please enter medium details." });
      return;
    }

    setIsLoading(true);
    
    const requestBody = {
      medium: medium.trim(),
      medium_details: mediumDetails.trim()
    };

    try {
      const response = await fetch(`${API_URL}/api/communication-type`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (response.ok) {
        showAlert({ variant: "success", title: "Success", message: "Communication type added successfully!" });
        await refreshCurrentPage();
      } else {
        showAlert({ variant: "error", title: "Error", message: data.message || "Failed to add communication type." });
      }
    } catch (error) {
      console.error("Add communication type error:", error);
      showAlert({ variant: "error", title: "Error", message: error?.message || "An error occurred while adding communication type." });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCommunicationTypes = async (page=1,perPage,filters={}) => {
    setIsLoading(true);
    try {
      const params=new URLSearchParams({
        page:page.toString(),
        per_page:perPage.toString(),
        ...(filters.search && { search: filters.search }),
      ...(filters.search_by  && { search_by: filters.search_by  })
      })

      const response = await fetch(`${API_URL}/api/communication-type?${params}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (response.ok) {
        setCommunicationTypes(data.data.data || []);
        setPaginationMeta({
          current_page:data.data.current_page,
          last_page:data.data.last_page,
          total:data.data.total
        })
      } else {
        showAlert({ variant: "error", title: "Error", message: "Failed to fetch communication types." });
      }
    } catch (error) {
      console.error("Fetch communication types error:", error);
      showAlert({ variant: "error", title: "Error", message: "An error occurred while fetching communication types." });
    } finally {
      setIsLoading(false);
    }
  };

  const editCommunicationType = async (id, medium, mediumDetails) => {
    if (!medium || medium.trim() === "") {
      showAlert({ variant: "warning", title: "Missing Field", message: "Please enter medium." });
      return;
    }
    
    if (!mediumDetails || mediumDetails.trim() === "") {
      showAlert({ variant: "warning", title: "Missing Field", message: "Please enter medium details." });
      return;
    }

    setIsLoading(true);

    const requestBody = {
      medium: medium.trim(),
      medium_details: mediumDetails.trim()
    };

    try {
      const response = await fetch(`${API_URL}/api/communication-type/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (response.ok) {
        showAlert({ variant: "success", title: "Success", message: "Communication type updated successfully!" });
        await refreshCurrentPage();
      } else {
        showAlert({ variant: "error", title: "Error", message: data.message || "Failed to update communication type." });
      }
    } catch (error) {
      console.error("Edit communication type error:", error);
      showAlert({ variant: "error", title: "Error", message: "An error occurred while updating communication type." });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCommunicationType = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/communication-type/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (handleUnauthorized(response)) return;

      if (response.ok) {
        showAlert({ variant: "success", title: "Success", message: "Communication type deleted successfully!" });
        setCommunicationTypes((prevTypes) => prevTypes.filter((type) => type.id !== id));
      } else {
        showAlert({ variant: "error", title: "Error", message: "Failed to delete communication type." });
      }
    } catch (error) {
      console.error("Delete communication type error:", error);
      showAlert({ variant: "error", title: "Error", message: "An error occurred while deleting communication type." });
    } finally {
      setIsLoading(false);
    }
  };



  const value = {
    addCommunicationType,
    fetchCommunicationTypes,
    editCommunicationType,
    deleteCommunicationType,
    communicationTypes,
     paginationMeta,
    isLoading
  };

  return (
    <CommunicationTypeContext.Provider value={value}>
      {children}
    </CommunicationTypeContext.Provider>
  );
};

export const useCommunicationType = () => useContext(CommunicationTypeContext);
