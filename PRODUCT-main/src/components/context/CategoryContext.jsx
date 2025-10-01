import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from "../utils/ApiConfig";

const CategoryContext = createContext();

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) throw new Error('useCategory must be used within CategoryProvider');
  return context;
};

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", title: "", variant: "success" });

  const token = localStorage.getItem('userToken');

  const showAlert = (variant, title, message) => {
    setAlert({ show: true, variant, title, message });
    setTimeout(() => setAlert({ ...alert, show: false }), 3000);
  };

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/getaccessorycategory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data.data);
    } catch (error) {
      showAlert("error", "Fetch Failed", "Error fetching categories");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const addCategory = async ({ name, category_code }) => {
    try {
      await axios.post(`${API_URL}/api/addaccessorycategory`,
        { name, category_code },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      showAlert("success", "Category Added", `${name} was added successfully`);
      fetchCategories();
    } catch (error) {
      showAlert("error", "Add Failed", "Error adding category");
    }
  };

  const updateCategory = async (id, name, category_code) => {
    try {
      await axios.put(`${API_URL}/api/updateaccessorycategory/${id}`, { name, category_code },{
        headers: { Authorization: `Bearer ${token}` },
      });
      showAlert("success", "Category Updated", `${name} was updated successfully`);
      fetchCategories();
    } catch (error) {
      showAlert("error", "Update Failed", "Error updating category");
    }
  };

  const deleteCategory = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/deleteaccessorycategory/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showAlert("success", "Category Deleted", `Category deleted successfully`);
      fetchCategories();
    } catch (error) {
      showAlert("error", "Delete Failed", "Error deleting category");
    }
  };

  return (
    <CategoryContext.Provider value={{
      categories,
      isLoading,
      alert,
      fetchCategories,
      addCategory,
      updateCategory,
      deleteCategory,
    }}>
      {children}
    </CategoryContext.Provider>
  );
};
