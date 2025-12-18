import React, { useState, useMemo } from "react";
import { useRole } from "../../../context/RoleContext";
import { X, Pencil } from "lucide-react";
import { SubmitButton } from "../../../AllButtons/AllButtons";
import { usePermissions } from "../../../context/PermissionContext.jsx";

export const Role = () => {
  const { addRole, roles, fetchRoles, isLoading, message, updateRole } = useRole(); // ✅ Changed to updateRole
  const { permissions } = usePermissions();

  const [roleName, setRoleName] = useState("");
  const [error, setError] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const [selectedRole, setSelectedRole] = useState("");
  const [roleToEdit, setRoleToEdit] = useState(null);
  const [showEditPermissions, setShowEditPermissions] = useState(false);
  const [saving, setSaving] = useState(false);

  const employeePermission = permissions?.permissions?.[0]?.roles;
  const canAddEmployee = employeePermission === "2";

  /* ---------- FILTER ROLES ---------- */
  const filteredRoles = useMemo(() => {
    return roles.filter((role) =>
      role.name.toLowerCase().includes("")
    );
  }, [roles]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roleName.trim()) {
      setError("Role name is required");
      return;
    }

    setError("");
    const response = await addRole(roleName);

    if (response?.errorMessage) {
      setError(response.errorMessage);
    } else {
      setRoleName("");
      setShowMessage(true);
      setIsModalOpen(false);
      setIsAssignModalOpen(false);
      fetchRoles();
    }
  };

  const openPermissionsEditor = () => {
    const role = roles.find((r) => r.name === selectedRole);
    if (!role) return;

    setRoleToEdit(role);
    setShowEditPermissions(true);
  };

  const handleSavePermissions = async (updatedPermissions) => {
    if (!roleToEdit?.id) return;

    setSaving(true);
    try {

      const payload = {
        name: roleToEdit.name,
        roles_permissions: updatedPermissions
      };

      console.log("🔄 Sending payload:", JSON.stringify(payload, null, 2));

      const response = await updateRole(roleToEdit.id, payload);

      if (response?.success || !response?.errorMessage) {
        console.log(" Role permissions updated successfully");
        fetchRoles();
        onClose();
      } else {
        console.error("Update failed:", response?.errorMessage);
        alert("Failed to update permissions: " + (response?.errorMessage || "Unknown error"));
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("Failed to update permissions. Please try again.");
    } finally {
      setSaving(false);
    }
  };

 const onClose = () => {
    setShowEditPermissions(false);
    setRoleToEdit(null);
  };

  return (
    <div className="bg-white">
      <div className="flex gap-2 flex-row">
        {canAddEmployee && (
          <button
            onClick={() => {
              setIsModalOpen(true);
              setError("");
              setShowMessage(false);
            }}
            className="add-items-btn"
          >
            Add Role
          </button>
        )}

        <button
          onClick={() => {
            setIsAssignModalOpen(true);
            setSelectedRole("");
            setError("");
          }}
          className="add-items-btn"
        >
          Assign Permission
        </button>
      </div>

      {/* ASSIGN PERMISSION MODAL */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
            <button
              onClick={() => setIsAssignModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold">Select Role</h2>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Role Name
              </label>

              <div className="flex gap-2 mt-1">
                <select
                  className="flex-1 p-2 border rounded-md"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="">Select a role...</option>
                  {filteredRoles.map((role) => (
                    <option key={role.id || role.name} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>

                {selectedRole && (
                  <button
                    type="button"
                    onClick={openPermissionsEditor}
                    className="p-2 border rounded-md hover:bg-gray-100"
                  >
                    <Pencil className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD ROLE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold">Enter Role Details</h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <input
                placeholder="Role name"
                className="w-full p-2 border rounded-md"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <SubmitButton disabled={isLoading} />
            </form>
          </div>
        </div>
      )}

      {/* EDIT PERMISSIONS MODAL */}
      {showEditPermissions && roleToEdit && (
        <EditPermissionsModal
          role={roleToEdit}
          onClose={onClose}
          onSave={handleSavePermissions}
          saving={saving}
        />
      )}
    </div>
  );
};

/* ========================================================= */
/* ================ EDIT PERMISSIONS MODAL ================= */
/* ========================================================= */

const EditPermissionsModal = ({ role, onClose, onSave, saving }) => {
  const [permissions, setPermissions] = useState({ ...role.roles_permissions });

  const handleChange = (key, value) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div className="w-full max-w-4xl rounded-3xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl p-6 md:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">
            Edit Permissions
            <span className="block text-sm font-normal text-gray-500">
              {role.name}
            </span>
          </h3>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition"
            disabled={saving}
          >
            ✕
          </button>
        </div>

        {/* Permission Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {Object.keys(permissions).map((key) => (
            <div
              key={key}
              className="rounded-2xl border border-gray-200 bg-white/60 backdrop-blur-md p-4 hover:shadow-lg transition-all"
            >
              <p className="mb-3 text-sm font-semibold text-gray-700 capitalize">
                {key.replace(/_/g, " ")}
              </p>

              <div className="flex gap-2">
                {/* Hidden */}
                <label className={`flex-1 cursor-pointer ${saving ? 'pointer-events-none opacity-50' : ''}`}>
                  <input
                    type="radio"
                    name={key}
                    value="0"
                    checked={permissions[key] === "0"}
                    onChange={() => handleChange(key, "0")}
                    className="hidden"
                    disabled={saving}
                  />
                  <div
                    className={`text-center px-3 py-2 rounded-xl text-xs font-semibold transition-all
                      ${
                        permissions[key] === "0"
                          ? "bg-gray-500 text-white shadow"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                  >
                    Hidden
                  </div>
                </label>

                {/* View */}
                <label className={`flex-1 cursor-pointer ${saving ? 'pointer-events-none opacity-50' : ''}`}>
                  <input
                    type="radio"
                    name={key}
                    value="1"
                    checked={permissions[key] === "1"}
                    onChange={() => handleChange(key, "1")}
                    className="hidden"
                    disabled={saving}
                  />
                  <div
                    className={`text-center px-3 py-2 rounded-xl text-xs font-semibold transition-all
                      ${
                        permissions[key] === "1"
                          ? "bg-blue-500 text-white shadow"
                          : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      }`}
                  >
                    View
                  </div>
                </label>

                {/* Edit */}
                <label className={`flex-1 cursor-pointer ${saving ? 'pointer-events-none opacity-50' : ''}`}>
                  <input
                    type="radio"
                    name={key}
                    value="2"
                    checked={permissions[key] === "2"}
                    onChange={() => handleChange(key, "2")}
                    className="hidden"
                    disabled={saving}
                  />
                  <div
                    className={`text-center px-3 py-2 rounded-xl text-xs font-semibold transition-all
                      ${
                        permissions[key] === "2"
                          ? "bg-indigo-600 text-white shadow"
                          : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                      }`}
                  >
                    Edit
                  </div>
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              console.log("🔄 Modal sending permissions:", permissions);
              onSave(permissions);
            }}
            disabled={saving}
            className={`px-6 py-2.5 rounded-xl font-semibold shadow-lg transition-transform ${
              saving
                ? "bg-gray-400 cursor-not-allowed text-white opacity-70"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-[1.02]"
            }`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};
