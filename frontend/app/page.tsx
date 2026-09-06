"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";
import { Navbar } from "../components/Navbar";
import { api, Board } from "../lib/api";
import { Plus, Kanban, Users, Clock, ArrowRight, Shield } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [boards, setBoards] = useState<Board[]>([]);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const fetchBoards = async () => {
    try {
      setLoadingBoards(true);
      const res = await api.get("/api/boards");
      setBoards(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBoards(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBoards();
    }
  }, [user]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setCreating(true);
      const res = await api.post("/api/boards", { title, description });
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      router.push(`/boards/${res.data.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#edf3f0]">
        <div className="w-8 h-8 border-3 border-[#0d8b75] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const ownedBoards = boards.filter((b) => b.ownerId === user.id);
  const sharedBoards = boards.filter((b) => b.ownerId !== user.id);

  return (
    <div className="min-h-screen flex flex-col bg-[#edf3f0]">
      <Navbar onNewBoardClick={() => setIsModalOpen(true)} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c2724] tracking-tight">
              Workspaces & Boards
            </h1>
            <p className="text-xs text-[#64746f] mt-1">
              Select a board to organize workflow columns and drag-and-drop
              tasks.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#fec84b] hover:bg-[#fdb022] text-[#1c2724] text-xs font-bold shadow-xs active:scale-95 transition-all w-full sm:w-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Board</span>
          </button>
        </div>

        {/* Loading state */}
        {loadingBoards ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 rounded-3xl bg-white/70 animate-pulse border border-[#e1eae5]"
              ></div>
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            {/* Owned Boards */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Kanban className="w-5 h-5 text-[#0d8b75]" />
                <h2 className="text-base font-extrabold text-[#1c2724]">
                  Your Boards
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#0d8b75] font-bold border border-[#bbf7d0]">
                  {ownedBoards.length}
                </span>
              </div>

              {ownedBoards.length === 0 ? (
                <div className="p-8 text-center rounded-3xl border-2 border-dashed border-[#cbdcd5] bg-white/60">
                  <p className="text-[#64746f] text-sm mb-4">
                    You haven&apos;t created any boards yet.
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#fec84b] hover:bg-[#fdb022] text-[#1c2724] text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Create Your First Board
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ownedBoards.map((board) => (
                    <Link
                      key={board.id}
                      href={`/boards/${board.id}`}
                      className="group relative p-6 rounded-3xl bg-white border border-[#e1eae5] hover:border-[#0d8b75]/40 hover:shadow-lg transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-extrabold text-lg text-[#1c2724] group-hover:text-[#0d8b75] transition-colors line-clamp-1">
                            {board.title}
                          </h3>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#0d8b75] border border-[#bbf7d0] flex-shrink-0">
                            Owner
                          </span>
                        </div>
                        <p className="text-xs text-[#64746f] line-clamp-2 mb-4">
                          {board.description || "No description provided."}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[#edf3f0] flex items-center justify-between text-xs text-[#82928c]">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {board.members.length + 1}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(board.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Shared With You */}
            {sharedBoards.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-[#0d8b75]" />
                  <h2 className="text-base font-extrabold text-[#1c2724]">
                    Shared With You
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#0d8b75] font-bold border border-[#bbf7d0]">
                    {sharedBoards.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sharedBoards.map((board) => {
                    const memberRecord = board.members.find(
                      (m) => m.userId === user.id,
                    );
                    return (
                      <Link
                        key={board.id}
                        href={`/boards/${board.id}`}
                        className="group relative p-6 rounded-3xl bg-white border border-[#e1eae5] hover:border-[#0d8b75]/40 hover:shadow-lg transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="font-extrabold text-lg text-[#1c2724] group-hover:text-[#0d8b75] transition-colors line-clamp-1">
                              {board.title}
                            </h3>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#0d8b75] border border-[#bbf7d0] flex-shrink-0">
                              {memberRecord?.role || "MEMBER"}
                            </span>
                          </div>
                          <p className="text-xs text-[#64746f] line-clamp-2 mb-4">
                            {board.description || "No description provided."}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-[#edf3f0] flex items-center justify-between text-xs text-[#82928c]">
                          <span>Owner: {board.owner.name}</span>
                          <ArrowRight className="w-4 h-4 text-[#82928c] group-hover:text-[#0d8b75] group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Board Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-[#e1eae5]">
              <h3 className="text-xl font-extrabold text-[#1c2724] mb-1">
                Create New Board
              </h3>
              <p className="text-xs text-[#64746f] mb-6">
                Start with default To Do, In Progress, and Done workflow
                columns.
              </p>

              <form onSubmit={handleCreateBoard} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4d5f59] mb-1.5">
                    Board Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Website Redesign"
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#d8e4df] bg-[#edf3f0]/40 text-[#1c2724] text-xs focus:outline-none focus:ring-2 focus:ring-[#0d8b75]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4d5f59] mb-1.5">
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Brief objective of this board..."
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#d8e4df] bg-[#edf3f0]/40 text-[#1c2724] text-xs focus:outline-none focus:ring-2 focus:ring-[#0d8b75] resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#edf3f0]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-[#4d5f59] border border-[#d8e4df] hover:bg-zinc-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !title.trim()}
                    className="px-5 py-2 rounded-full text-xs font-semibold bg-[#0d8b75] hover:bg-[#0a7361] text-white shadow-xs disabled:opacity-50 cursor-pointer transition-all"
                  >
                    {creating ? "Creating..." : "Create Board"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
