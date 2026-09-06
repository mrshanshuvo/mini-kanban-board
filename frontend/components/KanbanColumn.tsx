import React, { useState } from 'react';
import { Column, Task } from '../lib/api';
import { TaskCard } from './TaskCard';
import { Droppable } from '@hello-pangea/dnd';
import { Plus, MoreVertical, Trash2, Edit2 } from 'lucide-react';

interface KanbanColumnProps {
  column: Column;
  canEdit: boolean;
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateColumn: (columnId: string, title: string) => void;
  onDeleteColumn: (columnId: string) => void;
}

export function KanbanColumn({
  column,
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

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && title !== column.title) {
      onUpdateColumn(column.id, title.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="flex-shrink-0 w-80 flex flex-col max-h-full rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 backdrop-blur-sm shadow-sm">
      {/* Column Header */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} className="flex-1">
              <input
                type="text"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                className="w-full px-2 py-1 text-sm font-semibold rounded-md border border-indigo-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none"
              />
            </form>
          ) : (
            <div
              onClick={() => canEdit && setIsEditingTitle(true)}
              className={`flex items-center gap-2 flex-1 truncate ${canEdit ? 'cursor-pointer hover:opacity-80' : ''}`}
            >
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">
                {column.title}
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
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
              className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-36 py-1 z-30 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 text-xs">
                  <button
                    onClick={() => {
                      setIsEditingTitle(true);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      onDeleteColumn(column.id);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
            className={`flex-1 p-3 overflow-y-auto min-h-[150px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
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
        <div className="p-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
          <button
            onClick={() => onAddTask(column.id)}
            className="w-full py-2 px-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      )}
    </div>
  );
}
