

import React, { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../utils/ApiConfig";
import { useNavigate } from "react-router-dom";
import { useAlert } from "./AlertContext";
import { useProjectSource } from "./ProjectSourceContext";

const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
  const [isAccountLoading, setIsAccountLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);

  const { showAlert } = useAlert();
  const { projectSources, fetchProjectSources } = useProjectSource();
  const token = localStorage.getItem("userToken");
  const navigate = useNavigate();

  const handleUnauthorized = (response) => {
    if (response.status === 401) {
      localStorage.removeItem("userToken");
      navigate("/");
      return true;
    }
    return false;
  };

  // Add account
  const addAccount = async ({ sourceId, accountName }) => {
    if (!sourceId) {
      showAlert({
        variant: "warning",
        title: "Missing Field",
        message: "Please select a source.",
      });
      return;
    }

    if (!accountName || accountName.trim() === "") {
      showAlert({
        variant: "warning",
        title: "Missing Field",
        message: "Please enter account name.",
      });
      return;
    }

    setIsAccountLoading(true);

    const requestBody = {
      source_id: Number(sourceId),
      account_name: accountName.trim(),
    };

    try {
      const response = await fetch(`${API_URL}/api/project-accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (response.ok) {
        showAlert({
          variant: "success",
          title: "Success",
          message: "Account added successfully!",
        });
        fetchAccounts();
      } else {
        showAlert({
          variant: "error",
          title: "Error",
          message: data.message || "Failed to add account.",
        });
      }
    } catch (error) {
      console.error("Add account error:", error);
      showAlert({
        variant: "error",
        title: "Error",
        message: error?.message || "An error occurred while adding account.",
      });
    } finally {
      setIsAccountLoading(false);
    }
  };

  // Get all accounts
  const fetchAccounts = async () => {
    setIsAccountLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/project-accounts`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (response.ok) {
        setAccounts(data.data || []);
      } else {
        showAlert({
          variant: "error",
          title: "Error",
          message: "Failed to fetch accounts.",
        });
      }
    } catch (error) {
      console.error("Fetch accounts error:", error);
      showAlert({
        variant: "error",
        title: "Error",
        message: "An error occurred while fetching accounts.",
      });
    } finally {
      setIsAccountLoading(false);
    }
  };

  // Edit account
  const editAccount = async (id, { sourceId, accountName }) => {
    if (!sourceId) {
      showAlert({
        variant: "warning",
        title: "Missing Field",
        message: "Please select a source.",
      });
      return;
    }

    if (!accountName || accountName.trim() === "") {
      showAlert({
        variant: "warning",
        title: "Missing Field",
        message: "Please enter account name.",
      });
      return;
    }

    setIsAccountLoading(true);

    const requestBody = {
      source_id: Number(sourceId),
      account_name: accountName.trim(),
    };

    try {
      const response = await fetch(`${API_URL}/api/project-accounts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (response.ok) {
        showAlert({
          variant: "success",
          title: "Success",
          message: "Account updated successfully!",
        });
        fetchAccounts();
      } else {
        showAlert({
          variant: "error",
          title: "Error",
          message: data.message || "Failed to update account.",
        });
      }
    } catch (error) {
      console.error("Edit account error:", error);
      showAlert({
        variant: "error",
        title: "Error",
        message: "An error occurred while updating account.",
      });
    } finally {
      setIsAccountLoading(false);
    }
  };

  // Delete account
  const deleteAccount = async (id) => {
    setIsAccountLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/project-accounts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (handleUnauthorized(response)) return;

      if (response.ok) {
        showAlert({
          variant: "success",
          title: "Success",
          message: "Account deleted successfully!",
        });
        setAccounts((prev) => prev.filter((acc) => acc.id !== id));
      } else {
        showAlert({
          variant: "error",
          title: "Error",
          message: "Failed to delete account.",
        });
      }
    } catch (error) {
      console.error("Delete account error:", error);
      showAlert({
        variant: "error",
        title: "Error",
        message: "An error occurred while deleting account.",
      });
    } finally {
      setIsAccountLoading(false);
    }
  };

 
  useEffect(() => {
    fetchAccounts();
    if (!projectSources || projectSources.length === 0) {
      fetchProjectSources();
    }
   
  }, []);

  const value = {
    addAccount,
    fetchAccounts,
    editAccount,
    deleteAccount,
    accounts,
    isAccountLoading,
    projectSources,       
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => useContext(AccountContext);
