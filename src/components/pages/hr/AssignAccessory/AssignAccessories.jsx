import React, { useState, useEffect } from 'react';
import { useAssignAccessory } from '../../../context/AssignAccessoryContext';
import { X } from 'lucide-react';
import { SubmitButton } from '../../../AllButtons/AllButtons';
import { useEmployees } from '../../../context/EmployeeContext';
import { useCategory } from '../../../context/CategoryContext';
import { useAccessory } from '../../../context/AccessoryContext';
import Select from 'react-select';

export const AssignAccessories = () => {
  const { addAccessoryAssign, loading } = useAssignAccessory();
  const { employees, loading: employeeLoading } = useEmployees();
  const { categories, isLoading: categoryLoading, fetchCategories } = useCategory();
  const { fetchAccessories, accessories, loading: accessoryLoading } = useAccessory(); // ✅ FIXED

  const [formData, setFormData] = useState({
    user_id: '',
    category_id: '',
    accessory_id: '',
    assigned_at: '',
    return_date: '',
    condition: '',
    notes: '',
    status: 'assigned',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (formData.category_id) {
     fetchAccessories(formData.category_id);
      
    }
  }, [formData.category_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { user_id, accessory_id, assigned_at, return_date, condition, notes } = formData;
    if (user_id && accessory_id && assigned_at && return_date && condition && notes) {
      await addAccessoryAssign(formData);
      setFormData({
        user_id: '',
        category_id: '',
        accessory_id: '',
        assigned_at: '',
        return_date: '',
        condition: '',
        notes: '',
        status: 'assigned',
      });
      setIsModalOpen(false);
      setShowMessage(true);
    }
  };

  const toStr = val => (val != null ? String(val) : '');
  const selectedUser = employees.find(emp => toStr(emp.id) === toStr(formData.user_id));
  const selectedCategory = categories.find(cat => toStr(cat.id) === toStr(formData.category_id));
  const selectedAccessory = accessories.find(acc => toStr(acc.id) === toStr(formData.accessory_id));

  return (
    <div className="bg-white">
      <button onClick={() => setIsModalOpen(true)} className="add-items-btn">
        Accessory Assign
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[700px] relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold text-gray-800">Assign Accessory</h2>
            <p className="text-sm text-gray-500 mt-1">Assign a new accessory to a user</p>

            <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-2 gap-4">
              {/* User */}
              <div>
                <label className="block font-medium text-gray-700 text-sm">User</label>
                <Select
                  options={employees.map(emp => ({ value: emp.id, label: emp.name }))}
                  value={selectedUser ? { value: selectedUser.id, label: selectedUser.name } : null}
                  onChange={selected => setFormData({ ...formData, user_id: selected.value })}
                  isLoading={employeeLoading}
                  placeholder="Search User"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-medium text-gray-700 text-sm">Category</label>
                <Select
                  options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                  value={selectedCategory ? { value: selectedCategory.id, label: selectedCategory.name } : null}
                  onChange={selected => setFormData({ ...formData, category_id: selected.value, accessory_id: '' })}
                  isLoading={categoryLoading}
                  placeholder="Search Category"
                />
              </div>

              {/* Accessory */}
              <div>
                <label className="block font-medium text-gray-700 text-sm">Accessory</label>
                <Select
                  options={accessories.map(acc => ({
                    value: acc.id,
                    label: acc.brand_name,
                  }))}
                  value={selectedAccessory ? { value: selectedAccessory.id, label: selectedAccessory.brand_name } : null}
                  onChange={selected => setFormData({ ...formData, accessory_id: selected.value })}
                  isDisabled={!formData.category_id}
                  isLoading={accessoryLoading}
                  placeholder="Select Accessory"
                />
              </div>

              {/* Assigned At */}
              <div>
                <label className="block font-medium text-gray-700 text-sm">Assigned At</label>
                <input
                  type="date"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md"
                  value={formData.assigned_at}
                  onChange={e => setFormData({ ...formData, assigned_at: e.target.value })}
                />
              </div>

              {/* Return Date */}
              <div>
                <label className="block font-medium text-gray-700 text-sm">Return Date</label>
                <input
                  type="date"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md"
                  value={formData.return_date}
                  onChange={e => setFormData({ ...formData, return_date: e.target.value })}
                />
              </div>

              {/* Condition */}
              <div>
                <label className="block font-medium text-gray-700 text-sm">Condition</label>
                <input
                  type="text"
                  placeholder="Condition"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md"
                  value={formData.condition}
                  onChange={e => setFormData({ ...formData, condition: e.target.value })}
                />
              </div>

              {/* Status */}
              <div className="col-span-2">
                <label className="block font-medium text-gray-700 text-sm">Status</label>
                <select
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="assigned">Assigned</option>
                  <option value="returned">Returned</option>
                  <option value="in_repair">In-Repair</option>
                  <option value="damaged">Damaged</option>
                  <option value="lost">Lost</option>
                  <option value="trash">Trash</option>
                </select>
              </div>

              {/* Notes */}
              <div className="col-span-2">
                <label className="block font-medium text-gray-700 text-sm">Notes</label>
                <textarea
                  placeholder="Notes"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {/* Submit */}
              <div className="col-span-2">
                <SubmitButton disabled={loading} />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
