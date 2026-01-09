import { X } from "lucide-react";
import { useRole } from "../context/RoleContext";

const RoleSwitchModal = () => {
  const {
    roles,
    activeRole,
    showRoleModal,
    closeRoleModal,
    switchRole,
  } = useRole();

  if (!showRoleModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md relative">

        <button
          onClick={closeRoleModal}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-semibold mb-4">
          Switch Role
        </h2>

        <div className="space-y-3">
          {roles.map((role) => {
            const formattedRole = role.name
              .trim()
              .toLowerCase()
              .replace(/\s+/g, "");

            const isActive = formattedRole === activeRole;

            return (
              <button
                key={role.id}
                disabled={isActive}
                onClick={() => switchRole(role)}
                className={`
                  w-full flex justify-between items-center
                  rounded-xl px-4 py-3 border
                  ${
                    isActive
                      ? "bg-green-50 border-green-400 text-green-700 cursor-not-allowed"
                      : "hover:bg-black hover:text-white"
                  }
                `}
              >
                <div>
                  <p className="font-medium capitalize">
                    {role.name}
                  </p>
                  <p className="text-xs">
                    {isActive ? "Active role" : "Switch to this role"}
                  </p>
                </div>

                {isActive && (
                  <span className="px-2 py-1 text-xs rounded-full bg-green-600 text-white">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoleSwitchModal;
