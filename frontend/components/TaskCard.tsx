import React from 'react';
import { Task, TaskPriority } from '../lib/api';
import { Draggable } from '@hello-pangea/dnd';
import { Clock, User as UserIcon, Trash2, Edit2, GripVertical } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  index: number;
  canEdit: boolean;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const priorityStyles: Record<TaskPriority, { bg: string; text: string; border: string }> = {
  LOW: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200/60 dark:border-emerald-800/40',
  },
  MEDIUM: {
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    text: 'text-sky-700 dark:text-sky-400',
    border: 'border-sky-200/60 dark:border-sky-800/40',
  },
  HIGH: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200/60 dark:border-amber-800/40',
  },
  URGENT: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200/60 dark:border-rose-800/40',
  },
};

export function TaskCard({ task, index, canEdit, onEdit, onDelete }: TaskCardProps) {
  const priority = priorityStyles[task.priority] || priorityStyles.MEDIUM;

  return (
    <Draggable draggableId={task.id} index={index} isDragDisabled={!canEdit}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`group relative p-4 mb-3 rounded-xl bg-white dark:bg-zinc-900 border transition-all duration-200 ${
            snapshot.isDragging
              ? 'shadow-2xl ring-2 ring-indigo-500 scale-[1.02] border-indigo-400 z-50'
              : 'border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md'
          }`}
        >
          {/* Card Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${priority.bg} ${priority.text} ${priority.border}`}
            >
              {task.priority}
            </span>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {canEdit && (
                <>
                  <button
                    onClick={() => onEdit(task)}
                    title="Edit Task"
                    className="p-1 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(task.id)}
                    title="Delete Task"
                    className="p-1 text-zinc-400 hover:text-red-600 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div
                    {...provided.dragHandleProps}
                    title="Drag to reorder"
                    className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug mb-1">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3">
              {task.description}
            </p>
          )}

          {/* Footer Metadata */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 mt-2">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              <span>{new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>

            {task.assignee && (
              <div
                title={`Assigned to ${task.assignee.name}`}
                className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300 font-medium bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-full"
              >
                <UserIcon className="w-3 h-3 text-indigo-500" />
                <span className="truncate max-w-[80px]">{task.assignee.name.split(' ')[0]}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
