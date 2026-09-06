import React, { useState } from "react";
import { Column, Task } from "../lib/api";
import { TaskCard } from "./TaskCard";
import { Droppable } from "@hello-pangea/dnd";
import { Plus, MoreVertical, Trash2, Edit2 } from "lucide-react";

interface KanbanColumnProps {
  column: Column;
  columnIndex?: number;
  canEdit: boolean;
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateColumn: (columnId: string, title: string) => void;
  onDeleteColumn: (columnId: string) => void;
}

// Pastel column color schemes from NovaBoard image:
// 1. To Do: Soft Rosy Pink
// 2. In Progress: Warm Peach/Apricot
// 3. In Review: Soft Powder Sky Blue
// 4. Done / Completed: Lavender / Soft Purple
const columnColorPresets = [
  {
    bg: "bg-[#fce5ee]",
    dot: "bg-[#e8588d]",
    border: "border-[#fad1e0]",
    badgeBg: "bg-[#fad1e0]/80",
    badgeText: "text-[#b03063]",
  },
  {
    bg: "bg-[#feecd6]",
    dot: "bg-[#e07d24]",
    border: "border-[#fcd9b3]",
    badgeBg: "bg-[#fcd9b3]/80",
    badgeText: "text-[#a24e0b]",
  },
  {
    bg: "bg-[#d9f2fa]",
    dot: "bg-[#0284c7]",
    border: "border-[#bce5f5]",
    badgeBg: "bg-[#bce5f5]/80",
    badgeText: "text-[#0369a1]",
  },
  {
    bg: "bg-[#e5e1fc]",
    dot: "bg-[#7c3aed]",
    border: "border-[#d3ccf7]",
    badgeBg: "bg-[#d3ccf7]/80",
    badgeText: "text-[#5b21b6]",
  },
];

export function KanbanColumn({
  column,
  columnIndex = 0,
  canEdit,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onUpdateColumn,
  onDeleteColumn,
}: KanbanColumnProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [menuOpen, setMenuOpen] = useState(false);

  // Derive column pastel theme based on title keywords or index
  const lower = column.title.toLowerCase();
  let theme = columnColorPresets[columnIndex % columnColorPresets.length];
  if (lower.includes("to do") || lower.includes("backlog")) {
    theme = columnColorPresets[0];
  } else if (lower.includes("progress") || lower.includes("doing")) {
    theme = columnColorPresets[1];
  } else if (lower.includes("review") || lower.includes("testing")) {
    theme = columnColorPresets[2];
  } else if (lower.includes("done") || lower.includes("completed")) {
    theme = columnColorPresets[3];
  }

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && title !== column.title) {
      onUpdateColumn(column.id, title.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <div
      className={`w-full flex flex-col rounded-3xl ${theme.bg} p-3 sm:p-4 transition-colors duration-200 shadow-2xs`}
    >
      {/* Column Header */}
      <div className="px-2 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
          {/* Glowing Status Dot */}
          <span className={`w-2.5 h-2.5 rounded-full ${theme.dot} shrink-0`} />

          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} className="flex-1">
              <input
                type="text"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                className="w-full px-2 py-1 text-sm font-bold rounded-lg border border-[#0d8b75] bg-white text-[#1c2724] outline-none"
              />
            </form>
          ) : (
            <div
              onClick={() => canEdit && setIsEditingTitle(true)}
              className={`flex items-center gap-2 flex-1 truncate ${canEdit ? "cursor-pointer hover:opacity-80" : ""}`}
            >
              <h3 className="text-sm font-extrabold text-[#1c2724] truncate tracking-tight">
                {column.title}
              </h3>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText}`}
              >
                {column.tasks.length}
              </span>
            </div>
          )}
        </div>

        {/* Column Actions */}
        {canEdit && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-full hover:bg-black/5 text-[#788882] cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-36 py-1.5 z-30 bg-white rounded-2xl shadow-lg border border-[#e1eae5] text-xs">
                  <button
                    onClick={() => {
                      setIsEditingTitle(true);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-[#edf3f0] text-[#1c2724] font-medium cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#0d8b75]" />
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      onDeleteColumn(column.id);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-rose-50 text-rose-600 font-medium cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    Delete Column
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Droppable Task List */}
      <Droppable droppableId={column.id} type="TASK">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 px-1 py-2 overflow-y-auto min-h-40 rounded-2xl transition-colors ${
              snapshot.isDraggingOver ? "bg-white/40" : ""
            }`}
          >
            {column.tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                canEdit={canEdit}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add Task Quick Action */}
      {canEdit && (
        <div className="pt-2 px-1">
          <button
            onClick={() => onAddTask(column.id)}
            className="w-full py-2.5 px-3 rounded-2xl border border-dashed border-black/10 hover:border-black/25 bg-white/50 hover:bg-white/90 text-[#3d504a] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      )}
    </div>
  );
}
