import React, { useMemo, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useProjectMaster } from "../context/ProjectMasterContext";
import { DraggableCard } from "./DraggableCard";
import { DroppableColumn } from "./DroppableColumn";

const STATUS_MAP = {
  "to do": "To Do",
  "in progress": "In Progress",
  "awaited feedback": "Awaited Feedback",
  "qa & review": "QA & Review",
  complete: "Complete",
  cancelled: "Cancelled",
  backlog: "Backlog",
  others: "Others",
};

const API_STATUS_MAP = {
  "To Do": "To do",
  Others: "others",
};

const normalizeStatus = (status) => {
  if (!status) return "Others";
  return STATUS_MAP[String(status).trim().toLowerCase()] || "Others";
};
  const userRole = localStorage.getItem("user_name");

export const ProjectGridView = ({ projects, isLoading, actionsComponent }) => {
  const { editProjectMaster } = useProjectMaster();
  const navigate = useNavigate();

  const statusOrder = [
    "To Do",
    "In Progress",
    "Awaited Feedback",
    "QA & Review",
    "Complete",
    "Cancelled",
    "Backlog",
    "Others",
  ];

  const [localProjects, setLocalProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);

  // ⭐ smoother pickup than 120ms
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 80,
        tolerance: 5,
      },
    })
  );

  // safer sync
  useEffect(() => {
    setLocalProjects(projects ?? []);
  }, [projects]);

  // ⭐ Hide empty columns automatically (perfect for search)
  const groupedProjects = useMemo(() => {
    const groups = {};

    for (const project of localProjects) {
      const status = normalizeStatus(project.status);
      if (!groups[status]) groups[status] = [];
      groups[status].push(project);
    }

    const ordered = {};

    statusOrder.forEach((status) => {
      if (groups[status]?.length) {
        ordered[status] = groups[status];
      }
    });

    return ordered;
  }, [localProjects]);

  const handleDragEnd = async ({ active, over }) => {
    setActiveProject(null);
    if (!over) return;

    const newStatus = over.id;
    if (!statusOrder.includes(newStatus)) return;

    const projectId = active.id;

    const project = localProjects.find((p) => p.id === projectId);
    if (!project) return;

    const oldStatus = normalizeStatus(project.status);
    if (oldStatus === newStatus) return;

    // 🔥 instant UI update
    setLocalProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, status: newStatus } : p
      )
    );

    try {
      await editProjectMaster(projectId, {
        project_status: API_STATUS_MAP[newStatus] || newStatus,
      });
    } catch {
      // revert if API fails
      setLocalProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, status: oldStatus } : p
        )
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  // ⭐ If search returns nothing
  if (!localProjects.length) {
    return (
      <div className="flex justify-center py-20 text-gray-400">
        No projects found
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={({ active }) =>
        setActiveProject(localProjects.find((p) => p.id === active.id))
      }
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-[calc(100vh-220px)] overflow-x-auto overflow-y-hidden px-4 py-2">
        {Object.entries(groupedProjects).map(([status, items]) => (
          <DroppableColumn
            key={status}
            status={status}
            header={
              <div className="flex justify-between p-3 border-b bg-gray-100 sticky top-0 z-10">
                <h2 className="font-semibold text-sm">{status}</h2>
                <span className="text-xs bg-gray-200 px-2 rounded-full">
                  {items.length}
                </span>
              </div>
            }
          >
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {items.map((project) => (
                <DraggableCard
                  key={project.id}
                  project={project}
                  actionsComponent={actionsComponent}
                  onNavigate={() => navigate(`/${userRole}/projects/tasks/${project.id}`)}
                />
              ))}
            </SortableContext>
          </DroppableColumn>
        ))}
      </div>

      {/* ZERO LAG OVERLAY */}
      <DragOverlay dropAnimation={null} style={{ pointerEvents: "none" }}>
        {activeProject && (
          <div className="bg-white rounded-xl border p-3 shadow-2xl w-[280px] scale-105">
            <h3 className="font-medium text-sm">
              {activeProject.project_name}
            </h3>

            <p className="text-xs text-gray-500">
              {activeProject.client_name}
            </p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
