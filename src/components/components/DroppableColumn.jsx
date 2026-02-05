import { useDroppable } from "@dnd-kit/core";

export const DroppableColumn = ({ status, header, children }) => {

  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col w-[320px] h-full rounded-2xl border
        transition-colors
        ${isOver ? "bg-blue-50 border-blue-400" : "bg-gray-50"}
      `}
    >
      {header}

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {children}
      </div>
    </div>
  );
};
