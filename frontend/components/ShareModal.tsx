import React, { useState } from "react";
import { api, Board } from "../lib/api";
import {
  Users,
  UserPlus,
  Trash2,
  X,
  Shield,
  Mail,
  AlertCircle,
} from "lucide-react";

interface ShareModalProps {
  board: Board;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function ShareModal({
  board,
  isOpen,
  onClose,
  onUpdated,
}: ShareModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"EDITOR" | "VIEWER">("EDITOR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError("");
    setLoading(true);

    try {
      await api.post(`/api/boards/${board.id}/members`, {
        email: email.trim(),
        role,
      });
      setEmail("");
      onUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to share board");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await api.delete(`/api/boards/${board.id}/members/${userId}`);
      onUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to remove member");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg p-6 bg-white rounded-3xl shadow-xl border border-[#e1eae5]">
        <div className="flex items-center justify-between pb-4 border-b border-[#edf3f0]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-[#edf3f0] text-[#0d8b75]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1c2724]">
                Share Board
              </h3>
              <p className="text-xs text-[#64746f]">
                Invite colleagues with View or Edit privileges
              </p>
            </div>
          </div>
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

        {/* Share Form */}
        <form onSubmit={handleShare} className="mt-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#82928c]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-2xl border border-[#d8e4df] bg-[#edf3f0]/40 text-[#1c2724] focus:outline-none focus:ring-2 focus:ring-[#0d8b75]"
              />
            </div>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "EDITOR" | "VIEWER")}
              className="px-3 py-2 text-xs font-semibold rounded-2xl border border-[#d8e4df] bg-white text-[#1c2724] focus:outline-none focus:ring-2 focus:ring-[#0d8b75]"
            >
              <option value="EDITOR">Editor</option>
              <option value="VIEWER">Viewer</option>
            </select>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="px-4 py-2 text-xs font-semibold rounded-full bg-[#0d8b75] hover:bg-[#0a7361] text-white shadow-xs disabled:opacity-50 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{loading ? "Adding..." : "Invite"}</span>
            </button>
          </div>
        </form>

        {/* Member List */}
        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#64746f] mb-3">
            People with access ({board.members.length + 1})
          </h4>

          <div className="space-y-2.5 max-h-60 overflow-y-auto">
            {/* Owner item */}
            <div className="p-3.5 rounded-2xl bg-[#edf3f0]/50 border border-[#e1eae5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0d8b75] text-white font-bold text-xs flex items-center justify-center">
                  {board.owner.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#1c2724] flex items-center gap-2">
                    <span>{board.owner.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#0d8b75] border border-[#bbf7d0]">
                      Owner
                    </span>
                  </p>
                  <p className="text-[11px] text-[#64746f]">
                    {board.owner.email}
                  </p>
                </div>
              </div>
              <Shield className="w-4 h-4 text-[#0d8b75]" />
            </div>

            {/* Members */}
            {board.members.map((member) => (
              <div
                key={member.id}
                className="p-3.5 rounded-2xl bg-white border border-[#e1eae5] flex items-center justify-between shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#edf3f0] text-[#0d8b75] font-bold text-xs flex items-center justify-center border border-[#d8e4df]">
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-[#1c2724] flex items-center gap-2">
                      <span>{member.user.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#edf3f0] text-[#3d504a] border border-[#d8e4df]">
                        {member.role}
                      </span>
                    </p>
                    <p className="text-[11px] text-[#64746f]">
                      {member.user.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveMember(member.userId)}
                  title="Remove access"
                  className="p-1.5 text-[#82928c] hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
