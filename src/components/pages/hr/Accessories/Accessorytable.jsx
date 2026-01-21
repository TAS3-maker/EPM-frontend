import React, { useEffect, useState } from "react";
import { useAccessory } from "../../../context/AccessoryContext";
import {
  IconEditButton,
  IconDeleteButton,
  IconSaveButton,
  IconCancelTaskButton,
  ClearButton,
} from "../../../AllButtons/AllButtons";
import { SectionHeader } from "../../../components/SectionHeader";
import { Accessories } from "./Accessories";
import { useAlert } from "../../../context/AlertContext";
import { BarChart, Search, UserPlus } from "lucide-react";
import { useParams } from "react-router-dom";
import { useAssignAccessory } from "../../../context/AssignAccessoryContext";

export const Accessorytable = () => {
  const { accessories, deleteAccessory, fetchAccessories, updateAccessory } = useAccessory();
  const { fetchAccessoryAssign } = useAssignAccessory();
  const { id } = useParams();
  const { setAlert } = useAlert();

  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("All");
  const [filteredAccessories, setFilteredAccessories] = useState([]);
  const [editAccessoryId, setEditAccessoryId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    brand_name: "",
    vendor_name: "",
    purchase_date: "",
    purchase_amount: "",
    condition: "good",
    warranty_months: "",
    stock_quantity: "",
    notes: "",
  });

  useEffect(() => {
    if (id) fetchAccessories(id);
  }, [id]);

  useEffect(() => {
    fetchAccessoryAssign();
  }, []);

  useEffect(() => {
    if (accessories) {
      let result = accessories;

      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        result = result.filter(
          (item) =>
            item.brand_name.toLowerCase().includes(lowerQuery) ||
            item.vendor_name.toLowerCase().includes(lowerQuery) ||
            item.purchase_date.toLowerCase().includes(lowerQuery)
        );
      }

      if (brandFilter !== "All") {
        result = result.filter((item) => item.brand_name === brandFilter);
      }

      setFilteredAccessories(result);
    }
  }, [accessories, searchQuery, brandFilter]);

  useEffect(() => {
    if (editAccessoryId) {
      const accessoryToEdit = accessories.find((a) => a.id === editAccessoryId);
      if (accessoryToEdit) {
        setEditFormData({
          brand_name: accessoryToEdit.brand_name,
          vendor_name: accessoryToEdit.vendor_name,
          condition: accessoryToEdit.condition,
          purchase_date: accessoryToEdit.purchase_date,
          stock_quantity: accessoryToEdit.stock_quantity,
          warranty_months: accessoryToEdit.warranty_months,
          category_id: accessoryToEdit.category_id,
          amount: accessoryToEdit.amount,
          note: accessoryToEdit.note,
        });
      }
    }
  }, [editAccessoryId, accessories]);

  const handleSaveClick = async () => {
    await updateAccessory(editAccessoryId, editFormData, editFormData.category_id);
    setEditAccessoryId(null);
  };

  const handleDeleteClick = async (id) => {
    await deleteAccessory(id);
    setAlert({
      show: true,
      variant: "success",
      title: "Success",
      message: "Accessory deleted successfully!",
    });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setBrandFilter("All");
  };

  const uniqueBrands = ["All", ...new Set(accessories.map((item) => item.brand_name))];

  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white shadow-lg h-screen overflow-y-auto">
      <SectionHeader icon={BarChart} title="Accessories" subtitle="Manage accessory details" />
      <div className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 sticky top-0 bg-white z-10 shadow-md">
          <Accessories />

          <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-2 rounded-lg shadow-md bg-white">
            {/* Search Input */}
            <div className="flex items-center w-full border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
              <Search className="h-5 w-8 text-gray-400 mr-[5px]" />
              <input
                type="text"
                className="min-w-[300px] rounded-lg focus:outline-none py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Brand, Vendor or Purchase Date"
              />
              
            </div>
            {/* Brand Dropdown */}
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="border rounded-lg p-2 text-gray-700"
            >
              {uniqueBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
            <ClearButton onClick={handleClearSearch} />

            {/* <button className="add-items-btn">
              <UserPlus /> Assign
            </button> */}
          </div>
        </div>

        <div className="w-full h-screen overflow-auto mt-4">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="table-bg-heading table-th-tr-row">
                <th className="px-4 py-2 text-center">Brand Name</th>
                <th className="px-4 py-2 text-center">Vendor Name</th>
                <th className="px-4 py-2 text-center">Condition</th>
                <th className="px-4 py-2 text-center">Purchase Date</th>
                <th className="px-4 py-2 text-center">Warranty (Month)</th>
                <th className="px-4 py-2 text-center">Stock</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccessories.length > 0 ? (
                filteredAccessories.map((accessory) => (
                  <tr key={accessory.id} className="border">
                    <td className="px-6 py-4 text-center">
                      {editAccessoryId === accessory.id ? (
                        <input
                          type="text"
                          value={editFormData.brand_name}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, brand_name: e.target.value })
                          }
                          className="border border-gray-300 rounded-md p-2"
                        />
                      ) : (
                        accessory.brand_name
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editAccessoryId === accessory.id ? (
                        <input
                          type="text"
                          value={editFormData.vendor_name}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, vendor_name: e.target.value })
                          }
                          className="border border-gray-300 rounded-md p-2"
                        />
                      ) : (
                        accessory.vendor_name
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editAccessoryId === accessory.id ? (
                        <input
                          type="text"
                          value={editFormData.condition}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, condition: e.target.value })
                          }
                          className="border border-gray-300 rounded-md p-2"
                        />
                      ) : (
                        accessory.condition
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editAccessoryId === accessory.id ? (
                        <input
                          type="date"
                          value={editFormData.purchase_date}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, purchase_date: e.target.value })
                          }
                          className="border border-gray-300 rounded-md p-2"
                        />
                      ) : (
                        accessory.purchase_date
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editAccessoryId === accessory.id ? (
                        <input
                          type="text"
                          value={editFormData.warranty_months}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, warranty_months: e.target.value })
                          }
                          className="border border-gray-300 rounded-md p-2"
                        />
                      ) : (
                        accessory.warranty_months + " month"
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editAccessoryId === accessory.id ? (
                        <input
                          type="number"
                          value={editFormData.stock_quantity}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, stock_quantity: e.target.value })
                          }
                          className="border border-gray-300 rounded-md p-2"
                        />
                      ) : (
                        accessory.stock_quantity
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        {editAccessoryId === accessory.id ? (
                          <>
                            <IconSaveButton onClick={handleSaveClick} />
                            <IconCancelTaskButton onClick={() => setEditAccessoryId(null)} />
                          </>
                        ) : (
                          <>
                            <IconEditButton onClick={() => setEditAccessoryId(accessory.id)} />
                            <IconDeleteButton onClick={() => handleDeleteClick(accessory.id)} />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    No matching accessories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
