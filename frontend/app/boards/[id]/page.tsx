'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/auth-context';
import { Navbar } from '../../../components/Navbar';
import { KanbanColumn } from '../../../components/KanbanColumn';
import { TaskModal } from '../../../components/TaskModal';
import { ShareModal } from '../../../components/ShareModal';
import { api, Board, Column, Task, TaskPriority } from '../../../lib/api';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import {
  ArrowLeft,
  Plus,
  Share2,
  Lock,
  Trash2,
  Users,
  Search,
  Filter,
} from 'lucide-react';
import Link from 'next/link';

export default function BoardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const boardId = resolvedParams.id;

  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Modals state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isNewColumnOpen, setIsNewColumnOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const fetchBoard = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/boards/${boardId}`);
      setBoard(res.data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403 || err.response?.status === 404) {
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user && boardId) {
      fetchBoard();
    }
  }, [user, authLoading, boardId]);

  const canEdit = board?.userRole === 'OWNER' || board?.userRole === 'EDITOR';

  // Drag and Drop handler with optimistic UI updates
  const handleDragEnd = async (result: DropResult) => {
    if (!canEdit || !board) return;

    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColIndex = board.columns.findIndex((c) => c.id === source.droppableId);
    const destColIndex = board.columns.findIndex((c) => c.id === destination.droppableId);

    if (sourceColIndex === -1 || destColIndex === -1) return;

    // Optimistically update frontend state
    const newColumns = [...board.columns];
    const sourceCol = { ...newColumns[sourceColIndex], tasks: [...newColumns[sourceColIndex].tasks] };
    const destCol =
      sourceColIndex === destColIndex
        ? sourceCol
        : { ...newColumns[destColIndex], tasks: [...newColumns[destColIndex].tasks] };

    const [movedTask] = sourceCol.tasks.splice(source.index, 1);
    movedTask.columnId = destination.droppableId;
    destCol.tasks.splice(destination.index, 0, movedTask);

    newColumns[sourceColIndex] = sourceCol;
    if (sourceColIndex !== destColIndex) {
      newColumns[destColIndex] = destCol;
    }

    setBoard({
      ...board,
      columns: newColumns,
    });

    // Send task movement request to backend
    try {
      await api.patch(`/api/tasks/${draggableId}/move`, {
        targetColumnId: destination.droppableId,
        newPositionIndex: destination.index,
      });
    } catch (err) {
      console.error('Movement failed, reverting state...', err);
      fetchBoard(); // Revert to database state if server rejects
    }
  };

  // Add Task
  const handleOpenAddTask = (columnId: string) => {
    setSelectedColumnId(columnId);
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  // Edit Task
  const handleOpenEditTask = (task: Task) => {
    setSelectedColumnId(task.columnId);
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  // Save Task (Create or Update)
  const handleSaveTask = async (data: {
    title: string;
    description?: string;
    priority: TaskPriority;
    assigneeId?: string | null;
  }) => {
    if (!selectedColumnId) return;

    if (editingTask) {
      await api.patch(`/api/tasks/${editingTask.id}`, data);
    } else {
      await api.post(`/api/columns/${selectedColumnId}/tasks`, data);
    }
    fetchBoard();
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/api/tasks/${taskId}`);
      fetchBoard();
    } catch (err) {
      console.error(err);
    }
  };

  // Create Column
  const handleCreateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim() || !board) return;

    try {
      await api.post(`/api/boards/${board.id}/columns`, {
        title: newColumnTitle.trim(),
      });
      setNewColumnTitle('');
      setIsNewColumnOpen(false);
      fetchBoard();
    } catch (err) {
      console.error(err);
    }
  };

  // Update Column Title
  const handleUpdateColumn = async (columnId: string, title: string) => {
    try {
      await api.patch(`/api/columns/${columnId}`, { title });
      fetchBoard();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Column
  const handleDeleteColumn = async (columnId: string) => {
    if (!confirm('Are you sure you want to delete this column and all its tasks?')) return;
    try {
      await api.delete(`/api/columns/${columnId}`);
      fetchBoard();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Board
  const handleDeleteBoard = async () => {
    if (!confirm('Are you sure you want to delete this entire board? This action cannot be undone.')) return;
    try {
      await api.delete(`/api/boards/${boardId}`);
      router.push('/');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !board) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Filter tasks based on search and priority
  const filteredColumns = board.columns.map((column) => ({
    ...column,
    tasks: column.tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    }),
  }));

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 overflow-x-hidden">
      <Navbar />

      {/* Board Sub-header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                  {board.title}
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                  {board.userRole}
                </span>
                {!canEdit && (
                  <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                    <Lock className="w-3 h-3" /> Read Only
                  </span>
                )}
              </div>
              {board.description && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{board.description}</p>
              )}
            </div>
          </div>

          {/* Action and Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* Share Board Button */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 shadow-sm transition-all"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Share ({board.members.length + 1})</span>
            </button>

            {/* Delete Board (Owner only) */}
            {board.userRole === 'OWNER' && (
              <button
                onClick={handleDeleteBoard}
                title="Delete Board"
                className="p-2 text-zinc-400 hover:text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board Canvas */}
      <main className="flex-1 overflow-x-auto p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex items-start gap-6 h-[calc(100vh-180px)] min-w-max pb-4">
            {filteredColumns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                canEdit={canEdit}
                onAddTask={handleOpenAddTask}
                onEditTask={handleOpenEditTask}
                onDeleteTask={handleDeleteTask}
                onUpdateColumn={handleUpdateColumn}
                onDeleteColumn={handleDeleteColumn}
              />
            ))}

            {/* Add Column Button */}
            {canEdit && (
              <div className="flex-shrink-0 w-80">
                {isNewColumnOpen ? (
                  <form
                    onSubmit={handleCreateColumn}
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md space-y-3"
                  >
                    <input
                      type="text"
                      autoFocus
                      required
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      placeholder="Column title (e.g. Blocked)"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={!newColumnTitle.trim()}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                      >
                        Add Column
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsNewColumnOpen(false)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsNewColumnOpen(true)}
                    className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 hover:border-indigo-500 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Column</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </DragDropContext>
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        task={editingTask}
        columnId={selectedColumnId}
        members={board.members}
        owner={board.owner}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        board={board}
        onClose={() => setIsShareModalOpen(false)}
        onUpdated={fetchBoard}
      />
    </div>
  );
}
