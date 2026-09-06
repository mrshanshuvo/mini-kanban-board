import React from "react";
import { Task, TaskPriority } from "../lib/api";
import { Draggable } from "@hello-pangea/dnd";
import {
  Clock,
  User as UserIcon,
  Trash2,
  Edit2,
  GripVertical,
} from "lucide-react";

interface TaskCardProps {
  task: Task;
  index: number;
  canEdit: boolean;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const priorityStyles: Record<
  TaskPriority,
  { bg: string; text: string; dot: string }
> = {
  LOW: {
    bg: "bg-[#e6f8f3]",
    text: "text-[#0d8b75]",
    dot: "bg-[#0d8b75]",
  },
  MEDIUM: {
    bg: "bg-[#fef9c3]",
    text: "text-[#854d0e]",
    dot: "bg-[#ca8a04]",
  },
  HIGH: {
    bg: "bg-[#ffe4e6]",
    text: "text-[#be123c]",
    dot: "bg-[#e11d48]",
  },
  URGENT: {
    bg: "bg-[#fee2e2]",
    text: "text-[#b91c1c]",
    dot: "bg-[#dc2626]",
  },
};

export function TaskCard({
  task,
  index,
  canEdit,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const priority = priorityStyles[task.priority] || priorityStyles.MEDIUM;

  // Calculate pseudo-progress based on task priority/ID for visual fidelity like the reference
  const progressPercentage =
    task.priority === "URGENT"
      ? 100
      : task.priority === "HIGH"
        ? 60
        : task.priority === "MEDIUM"
          ? 40
          : 15;

  return (
    <Draggable draggableId={task.id} index={index} isDragDisabled={!canEdit}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`group relative p-4 mb-3 rounded-2xl bg-white border transition-all duration-200 ${
            snapshot.isDragging
              ? "shadow-2xl ring-2 ring-[#0d8b75] scale-[1.02] border-[#0d8b75] z-50"
              : "border-transparent shadow-xs hover:shadow-md"
          }`}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md tracking-wide capitalize flex items-center gap-1.5 ${priority.bg} ${priority.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
              {task.priority.toLowerCase()}
            </span>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {canEdit && (
                <>
                  <button
                    onClick={() => onEdit(task)}
                    title="Edit Task"
                    className="p-1 text-[#788882] hover:text-[#0d8b75] rounded transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(task.id)}
                    title="Delete Task"
                    className="p-1 text-[#788882] hover:text-rose-600 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div
                    {...provided.dragHandleProps}
                    title="Drag to reorder"
                    className="p-1 text-[#788882] hover:text-[#1c2724] cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <h4 className="text-[13px] font-bold text-[#1c2724] leading-snug mb-1">
            {task.title}
          </h4>

          {/* Description */}
          {task.description && (
            <p className="text-[11px] text-[#63756f] line-clamp-2 mb-3">
              {task.description}
            </p>
          )}

          {/* Progress Bar (Signature NovaBoard visual feature) */}
          <div className="mb-3">
            <div className="flex justify-between items-center text-[10px] font-semibold text-[#82928c] mb-1">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#edf3f0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0d8b75] rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center justify-between text-[11px] text-[#82928c] pt-2 border-t border-[#f0f5f2]">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-[#9ab0a7]" />
              <span>
                {new Date(task.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {task.assignee ? (
              <div
                title={`Assigned to ${task.assignee.name}`}
                className="flex items-center gap-1.5 text-[#2c3e39] font-medium bg-[#edf3f0] px-2 py-0.5 rounded-full"
              >
                <div className="w-4 h-4 rounded-full bg-[#0d8b75] text-white flex items-center justify-center text-[9px] font-bold">
                  {task.assignee.name.charAt(0).toUpperCase()}
                </div>
                <span className="truncate max-w-[75px] text-[10px]">
                  {task.assignee.name.split(" ")[0]}
                </span>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#edf3f0] flex items-center justify-center text-[#9ab0a7]">
                <UserIcon className="w-3 h-3" />
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
