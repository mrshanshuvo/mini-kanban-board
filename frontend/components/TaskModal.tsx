import React, { useState, useEffect } from "react";
import { Task, TaskPriority, BoardMember, User } from "../lib/api";
import { X, Flag, UserCheck, AlertCircle } from "lucide-react";

interface TaskModalProps {
  task: Task | null;
  columnId: string | null;
  isOpen: boolean;
  members: BoardMember[];
  owner: User;
  onClose: () => void;
  onSave: (taskData: {
    title: string;
    description?: string;
    priority: TaskPriority;
    assigneeId?: string | null;
  }) => Promise<void>;
}

export function TaskModal({
  task,
  isOpen,
  members,
  owner,
  onClose,
  onSave,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setAssigneeId(task.assigneeId || "");
    } else {
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setAssigneeId("");
    }
    setError("");
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError("");

    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        assigneeId: assigneeId || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  const allAssignees = [owner, ...members.map((m) => m.user)];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-xl border border-[#e1eae5]">
        <div className="flex items-center justify-between pb-4 border-b border-[#edf3f0]">
          <h3 className="font-extrabold text-lg text-[#1c2724]">
            {task ? "Edit Task" : "Create New Task"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#82928c] hover:text-[#1c2724] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4d5f59] mb-1.5">
              Task Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement authentication token exchange"
              className="w-full px-4 py-2.5 text-xs font-medium rounded-2xl border border-[#d8e4df] bg-[#edf3f0]/40 text-[#1c2724] focus:outline-none focus:ring-2 focus:ring-[#0d8b75]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4d5f59] mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add additional specifications, requirements, or links..."
              className="w-full px-4 py-2.5 text-xs font-medium rounded-2xl border border-[#d8e4df] bg-[#edf3f0]/40 text-[#1c2724] focus:outline-none focus:ring-2 focus:ring-[#0d8b75] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4d5f59] mb-1.5 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-[#0d8b75]" />
                <span>Priority</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3.5 py-2 text-xs font-medium rounded-2xl border border-[#d8e4df] bg-[#edf3f0]/40 text-[#1c2724] focus:outline-none focus:ring-2 focus:ring-[#0d8b75]"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4d5f59] mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#0d8b75]" />
                <span>Assignee</span>
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-medium rounded-2xl border border-[#d8e4df] bg-[#edf3f0]/40 text-[#1c2724] focus:outline-none focus:ring-2 focus:ring-[#0d8b75]"
              >
                <option value="">Unassigned</option>
                <option value={owner.id}>{owner.name} (Owner)</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#edf3f0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-full border border-[#d8e4df] text-[#4d5f59] hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-5 py-2 text-xs font-semibold rounded-full bg-[#0d8b75] hover:bg-[#0a7361] text-white shadow-xs disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? "Saving..." : task ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
