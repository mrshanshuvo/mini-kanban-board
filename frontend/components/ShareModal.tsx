import React, { useState } from 'react';
import { api, Board } from '../lib/api';
import { Users, UserPlus, Trash2, X, Shield, Mail, AlertCircle } from 'lucide-react';

interface ShareModalProps {
  board: Board;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function ShareModal({ board, isOpen, onClose, onUpdated }: ShareModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'EDITOR' | 'VIEWER'>('EDITOR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError('');
    setLoading(true);

    try {
      await api.post(`/api/boards/${board.id}/members`, {
        email: email.trim(),
        role,
      });
      setEmail('');
      onUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to share board');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await api.delete(`/api/boards/${board.id}/members/${userId}`);
      onUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove member');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Share Board</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center gap-2 text-red-600 dark:text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Share Form */}
        <form onSubmit={handleShare} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              Invite User By Email
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="collaborator@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'EDITOR' | 'VIEWER')}
                className="px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="EDITOR">Can Edit</option>
                <option value="VIEWER">Can View</option>
              </select>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Adding...' : 'Invite'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Member List */}
        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
            People with access ({board.members.length + 1})
          </h4>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {/* Owner item */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <span>{board.owner.name}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    Owner
                  </span>
                </p>
                <p className="text-xs text-zinc-500">{board.owner.email}</p>
              </div>
              <Shield className="w-4 h-4 text-indigo-500" />
            </div>

            {/* Members */}
            {board.members.map((member) => (
              <div
                key={member.id}
                className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <span>{member.user.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {member.role}
                    </span>
                  </p>
                  <p className="text-xs text-zinc-500">{member.user.email}</p>
                </div>

                <button
                  onClick={() => handleRemoveMember(member.userId)}
                  title="Remove access"
                  className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg transition-colors"
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
