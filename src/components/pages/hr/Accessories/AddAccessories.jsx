import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Plus, X, BarChart, Trash2 } from "lucide-react";
import { SectionHeader } from "../../../components/SectionHeader";
import { API_URL } from "../../../utils/ApiConfig";

// Header Component
const Header = ({ onAddClick }) => (
  <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm">
    <SectionHeader icon={BarChart} title="Accessory Management" subtitle="View, edit and manage accessories" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Accessories Collection</h1>
        <button
          onClick={onAddClick}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
        <Plus size={18} className="mr-2" /> Add Accessory
        </button>
      </div>
    </div>
  </header>
);

// Accessory Card Component
const AccessoryCard = ({ item, onDelete }) => (
  <div className="rounded-2xl bg-white p-6 shadow-md hover:shadow-lg border border-gray-100 relative">
    <button className="absolute top-2 right-2 text-red-500" onClick={() => onDelete(item.id)}>
      <Trash2 size={18} />
    </button>
    <div className="flex justify-between items-center mb-2">
     <div>
      <h2 className="text-xl font-semibold text-gray-800">Model : {item.name}</h2>
     </div>
      <span
        className={`text-sm px-2 py-1 rounded-full ${
          item.status === "available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {item.status}
      </span>
    </div>
    <div className="text-sm text-gray-600 space-y-1">
      <p><strong>Accessory No:</strong> {item.accessory_no}</p>
      <p><strong>Category:</strong> {item.category?.name || "N/A"}</p>
      <p><strong>Condition:</strong> {item.condition}</p>
      {/* <p><strong>Issue Date:</strong> {item.issue_date}</p> */}
      <p><strong>Note:</strong> {item.note}</p>
    </div>
    <div className="mt-4 text-xs text-gray-400 flex justify-between">
      <span>Created: {item.created_at}</span>
      <span>Updated: {item.updated_at}</span>
    </div>
  </div>
);

// Modal Component
const Modal = ({ isOpen, onClose, onSave }) => {
  const { id } = useParams();

  const [formData, setFormData] = useState({
    category_id: "",
    accessory_no: "",
    model: "",
    condition: "",
    issue_date: "",
    note: "",
    status: "Available",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        category_id: id || "",
      }));
    }
  }, [isOpen, id]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-20">
      <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
        <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={onClose}>
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-4">Add New Accessory</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Category ID</label>
            <input
              type="text"
              name="category_id"
              value={formData.category_id}
              readOnly
              className="w-full border rounded-md px-3 py-2 bg-gray-100"
            />
          </div>
          {["accessory_no", "model", "condition"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium capitalize">{field.replace("_", " ")}</label>
              <input
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>
          ))}
          <div>
          <label className="block text-sm font-medium">Issue Date</label>
            <input
              type="date"
              name="issue_date"
              value={formData.issue_date}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Note</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="Available">Available</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="approved">Approved</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
              Save Accessory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Component
const AddAccessories = () => {
  const [accessories, setAccessories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const token = localStorage.getItem("userToken");
  const { id } = useParams();

  const fetchAccessories = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/api/getaccessory/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched accessories:", res.data);
      setAccessories(res.data.data || []);
    } catch (err) {
      console.error("Error fetching accessories:", err);
      setAccessories([]); // fallback in case of error
    }
  };

  const handleAddClick = () => setIsModalOpen(true);

  const handleSaveAccessory = async (newAccessory) => {
    try {
      const res = await axios.post(`${API_URL}/api/addaccessory`, newAccessory, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccessories((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Failed to add accessory:", err);
    }
  };

  const handleDeleteAccessory = async (id) => {
    if (window.confirm("Are you sure you want to delete this accessory?")) {
      try {
        await axios.delete(`${API_URL}/deleteaccessory/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAccessories((prev) => prev.filter((acc) => acc.id !== id));
      } catch (err) {
        console.error("Failed to delete accessory:", err);
      }
    }
  };

  useEffect(() => {
    if (id) fetchAccessories(id);
  }, [id]);

  return (
    <div>
      <Header onAddClick={handleAddClick} />
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(accessories) && accessories.map((item) => (
              <AccessoryCard key={item.id} item={item} onDelete={handleDeleteAccessory} />
            ))}
        </div>
      </main>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveAccessory} />
    </div>
  );
};

export default AddAccessories;
