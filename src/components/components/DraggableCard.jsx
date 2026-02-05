import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { usePermissions } from "../context/PermissionContext";
export const DraggableCard = React.memo(
  ({ project, actionsComponent, onNavigate }) => {

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: project.id,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      willChange: "transform",
    };
const {permissions}=usePermissions()
  const employeePermission = permissions?.permissions?.[0]?.pending_sheets_inside_performance_sheets;
  const canAddEmployee = employeePermission === "2";

    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={onNavigate} 
        className={`
          bg-white
          rounded-xl
          border
          p-3
          cursor-pointer
          select-none
          touch-none
          ${isDragging ? "opacity-50 shadow-lg" : "hover:shadow-md"}
        `}
      >
        <div className="flex justify-between items-start gap-2">

      {canAddEmployee&&(
          <div
            {...listeners}
            {...attributes} 
            onClick={(e) => e.stopPropagation()} 
            className="flex gap-2 cursor-grab active:cursor-grabbing"
          >
            <GripVertical size={18} className="text-gray-400" />

          
          </div>
      )}
  <h3 className="font-medium text-[12px] truncate max-w-[150px]" title={project.project_name}">
              {project.project_name}
            </h3>
          {/* prevent drag + navigation from buttons */}
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {actionsComponent?.right(project)}
          </div>
        </div>

        <p className="text-[10px] text-gray-500 mt-1">
          {project.client_name}
        </p>

        <p className="text-[9px] text-gray-400 mt-1">
          {project.fullData?.project_tracking === "0"
            ? "Fixed"
            : "Hourly"}
        </p>
      </div>
    );
  }
);
