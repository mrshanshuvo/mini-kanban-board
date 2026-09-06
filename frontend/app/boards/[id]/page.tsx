"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/auth-context";
import { Navbar } from "../../../components/Navbar";
import { KanbanColumn } from "../../../components/KanbanColumn";
import { TaskModal } from "../../../components/TaskModal";
import { ShareModal } from "../../../components/ShareModal";
import { api, Board, Task, TaskPriority } from "../../../lib/api";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import {
  ArrowLeft,
  Plus,
  Share2,
  Lock,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import Link from "next/link";

export default function BoardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const boardId = resolvedParams.id;

  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  // Modals state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isNewColumnOpen, setIsNewColumnOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const fetchBoard = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/boards/${boardId}`);
      setBoard(res.data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403 || err.response?.status === 404) {
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user && boardId) {
      fetchBoard();
    }
  }, [user, authLoading, boardId]);

  const canEdit = board?.userRole === "OWNER" || board?.userRole === "EDITOR";

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

    const sourceColIndex = board.columns.findIndex(
      (c) => c.id === source.droppableId,
    );
    const destColIndex = board.columns.findIndex(
      (c) => c.id === destination.droppableId,
    );

    if (sourceColIndex === -1 || destColIndex === -1) return;

    // Optimistically update frontend state
    const newColumns = [...board.columns];
    const sourceCol = {
      ...newColumns[sourceColIndex],
      tasks: [...newColumns[sourceColIndex].tasks],
    };
    const destCol =
      sourceColIndex === destColIndex
        ? sourceCol
        : {
            ...newColumns[destColIndex],
            tasks: [...newColumns[destColIndex].tasks],
          };

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
      console.error("Movement failed, reverting state...", err);
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
    if (!confirm("Are you sure you want to delete this task?")) return;
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
      setNewColumnTitle("");
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
    if (
      !confirm("Are you sure you want to delete this column and all its tasks?")
    )
      return;
    try {
      await api.delete(`/api/columns/${columnId}`);
      fetchBoard();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Board
  const handleDeleteBoard = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this entire board? This action cannot be undone.",
      )
    )
      return;
    try {
      await api.delete(`/api/boards/${boardId}`);
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !board) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#edf3f0]">
        <div className="w-8 h-8 border-3 border-[#0d8b75] border-t-transparent rounded-full animate-spin"></div>
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
      const matchesPriority =
        priorityFilter === "ALL" || task.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    }),
  }));

  return (
    <div className="min-h-screen flex flex-col bg-[#edf3f0] overflow-x-hidden">
      <Navbar />

      {/* Board Sub-header */}
      <div className="border-b border-[#e1eae5] bg-[#edf3f0]/60 backdrop-blur-xs px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/"
              className="p-1.5 sm:p-2 rounded-2xl bg-white border border-[#e1eae5] hover:bg-[#f6f9f7] text-[#4b5d57] transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl font-extrabold text-[#1c2724] tracking-tight truncate">
                  {board.title}
                </h1>
                <span className="text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#0d8b75] border border-[#bbf7d0]">
                  {board.userRole}
                </span>
                {!canEdit && (
                  <span className="flex items-center gap-1 text-[10px] sm:text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3" /> Read Only
                  </span>
                )}
              </div>
              {board.description && (
                <p className="text-[11px] sm:text-xs text-[#64746f] mt-0.5 truncate">
                  {board.description}
                </p>
              )}
            </div>
          </div>

          {/* Action and Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial min-w-[140px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#82928c]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search task..."
                className="w-full sm:w-auto pl-8 pr-3 py-1.5 sm:py-2 text-xs rounded-full border border-[#d8e4df] bg-white text-[#1c2724] placeholder-[#82928c] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0d8b75]"
              />
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-medium rounded-full border border-[#d8e4df] bg-white text-[#1c2724] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0d8b75] cursor-pointer"
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
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold rounded-full border border-[#d8e4df] bg-white hover:bg-[#f6f9f7] text-[#2c3e39] shadow-2xs transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#0d8b75]" />
              <span>Share ({board.members.length + 1})</span>
            </button>

            {/* Delete Board (Owner only) */}
            {board.userRole === "OWNER" && (
              <button
                onClick={handleDeleteBoard}
                title="Delete Board"
                className="p-1.5 sm:p-2 text-[#788882] hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board Canvas */}
      <main className="flex-1 w-full p-3 sm:p-5 lg:p-6 overflow-y-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 items-start gap-4 sm:gap-5 w-full pb-8">
            {filteredColumns.map((column, index) => (
              <KanbanColumn
                key={column.id}
                column={column}
                columnIndex={index}
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
              <div className="w-full min-h-[140px]">
                {isNewColumnOpen ? (
                  <form
                    onSubmit={handleCreateColumn}
                    className="p-4 rounded-3xl bg-white border border-[#e1eae5] shadow-sm space-y-3"
                  >
                    <input
                      type="text"
                      autoFocus
                      placeholder="Column title (e.g. In Review)"
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#d8e4df] bg-[#edf3f0]/50 text-[#1c2724] focus:outline-none focus:ring-2 focus:ring-[#0d8b75]"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs font-semibold rounded-full bg-[#0d8b75] hover:bg-[#0a7361] text-white shadow-xs cursor-pointer"
                      >
                        Add Column
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewColumnOpen(false);
                          setNewColumnTitle("");
                        }}
                        className="px-3 py-1.5 text-xs font-semibold rounded-full border border-[#d8e4df] hover:bg-zinc-100 text-[#4b5d57] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsNewColumnOpen(true)}
                    className="w-full py-8 px-4 rounded-3xl border-2 border-dashed border-[#cbdcd5] hover:border-[#0d8b75] bg-white/40 hover:bg-white/90 text-[#4b5d57] hover:text-[#0d8b75] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
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
