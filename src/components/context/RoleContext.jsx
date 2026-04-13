import React, { createContext, useContext, useState, useMemo,useEffect } from "react";
import { API_URL } from "../utils/ApiConfig";
import { useNavigate } from "react-router-dom";
import { useAlert } from "./AlertContext";
const RoleContext = createContext(null);
export function RoleProvider({ children }) {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const token = localStorage.getItem("userToken");
  const { showAlert } = useAlert();
  const [role, setRole] = useState([]);
  const [activeRole, setActiveRole] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);


  const navigate = useNavigate();
    const handleUnauthorized = (response) => {
      if (response.status === 401) {
        localStorage.removeItem("userToken");
        navigate("/");
        return true;
      }
      return false;
    };
  const addRole = async (name) => {
  setIsLoading(true);
  setMessage(null);
  const token = localStorage.getItem("userToken");
  try {
    const response = await fetch(`${API_URL}/api/roles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(name),
    });

    if (handleUnauthorized(response)) return;
    const data = await response.json();

    if (response.ok) {
      showAlert({ variant: "success", title: "Success", message: "Role added successfully" });
      fetchRoles();
      return { success: true };
    } else {
      // handle backend validation errors
      const errorMessage = data?.errors.name || "Failed to add role";
      // showAlert({ variant: "error", title: "Error", message: errorMessage });
      return { success: false, errorMessage };
    }
  } catch (error) {
    console.error("Error:", error);
    const fallbackMessage = "Something went wrong!";
    showAlert({ variant: "error", title: "Error", message: fallbackMessage });
    return { success: false, errorMessage: fallbackMessage };
  } finally {
    setIsLoading(false);
  }
};

  const fetchRoles = async () => {
    setIsLoading(true);
    setMessage(null);
    const token = localStorage.getItem("userToken");
    try {
      const response = await fetch(`${API_URL}/api/roles`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (handleUnauthorized(response)) return;
      const data = await response.json();
      // console.log("Fetched Roles:", data);
      if (response.ok) {
        setRoles(Array.isArray(data.data) ? data.data : []);
      } else {
        setMessage(data.message || "Failed to fetch roles :x:");
        setRoles([]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Something went wrong! :x:");
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  };
  const deleteRole = async (roleId) => {
    setIsLoading(true);
    const token = localStorage.getItem("userToken");
    try {
      const response = await fetch(`${API_URL}/api/roles/${roleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (handleUnauthorized(response)) return;
      const data = await response.json();
      // console.log("Delete Response:", data);
      if (response.ok) {
        showAlert({ variant: "success", title: "Success", message: "Role Deleted successfully" });
        setRoles((prevRoles) => prevRoles.filter((role) => role.id !== roleId));
      } else {

        showAlert({ variant: "error", title: "Error", message: "Failed to delete role :x:" });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Something went wrong while deleting role! :x:");
      showAlert({ variant: "error", title: "Error", message: "Failed to delete role :x:" });
    } finally {
      setIsLoading(false);
    }
  };
const updateRole = async (roleId, payload) => {  
  setIsLoading(true);
  const token = localStorage.getItem("userToken");

  try {
    console.log("🔄 Sending payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(`${API_URL}/api/roles/${roleId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload), 
    });

    if (handleUnauthorized(response)) return;

    const data = await response.json();

    if (response.ok) {
      // Update local state based on payload
      setRoles((prevRoles) =>
        prevRoles.map((role) =>
          role.id === roleId 
            ? { 
                ...role, 
                name: payload.name || role.name,
                roles_permissions: payload.roles_permissions || role.roles_permissions
              }
            : role
        )
      );

      if (payload.roles_permissions) {
        showAlert({
          variant: "success",
          title: "Success",
          message: "Role permissions updated successfully",
        });
      } else {
        showAlert({
          variant: "success",
          title: "Success",
          message: "Role name updated successfully",
        });
      }
      
      fetchRoles(); // Always refresh
      return { success: true };
    } else {
      const errorMessage = data.message || data.errors?.name || data.errors?.roles_permissions || "Failed to update role";
      showAlert({ variant: "error", title: "Error", message: errorMessage });
      return { success: false, errorMessage };
    }
  } catch (error) {
    console.error("❌ Error:", error);
    showAlert({ variant: "error", title: "Error", message: "Something went wrong!" });
    return { success: false, errorMessage: "Something went wrong!" };
  } finally {
    setIsLoading(false);
  }
};





useEffect(() => {
  const syncRoles = () => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const storedRole = localStorage.getItem("user_name");

    if (userData?.roles) {
      setRoles(userData.roles);
    } else {
      setRoles([]);
    }

    if (storedRole) {
      setActiveRole(storedRole);
    }
  };

  syncRoles();


  window.addEventListener("storage", syncRoles);
  window.addEventListener("role-changed", syncRoles);

  return () => {
    window.removeEventListener("storage", syncRoles);
    window.removeEventListener("role-changed", syncRoles);
  };
}, []);


  const openRoleModal = () => {
    if (roles.length > 1) {
      setShowRoleModal(true);
    }
  };

  const closeRoleModal = () => {
    setShowRoleModal(false);
  };

  const switchRole = (role) => {
    const formattedRole = role.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");

    // prevent re-selecting same role
    if (formattedRole === activeRole) return;

    localStorage.setItem("user_name", formattedRole);
    localStorage.setItem("role_id", role.id);
    localStorage.setItem("permissions", JSON.stringify(role.roles_permissions));

    setActiveRole(formattedRole);
    setShowRoleModal(false);

    // hard reload so permissions/sidebar/routes refresh
    window.location.href = `/${formattedRole}/dashboard`;
  };




  return (
    <RoleContext.Provider value={{ addRole, deleteRole, fetchRoles, updateRole, roles, isLoading, message,  role,
        activeRole,
        showRoleModal,
        openRoleModal,
        closeRoleModal,
        switchRole }}>
      {children}
    </RoleContext.Provider>
  );
}
export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return useMemo(() => context, [context]);
};
