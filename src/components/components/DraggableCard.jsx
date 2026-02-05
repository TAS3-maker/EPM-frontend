import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

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


          <div
            {...listeners}
            {...attributes} 
            onClick={(e) => e.stopPropagation()} 
            className="flex gap-2 cursor-grab active:cursor-grabbing"
          >
            <GripVertical size={18} className="text-gray-400" />

          
          </div>
  <h3 className="font-medium text-sm">
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

        <p className="text-xs text-gray-500 mt-1">
          {project.client_name}
        </p>

        <p className="text-[11px] text-gray-400 mt-1">
          {project.fullData?.project_tracking === "0"
            ? "Fixed"
            : "Hourly"}
        </p>
      </div>
    );
  }
);
