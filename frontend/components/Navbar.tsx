"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../context/auth-context";
import { Kanban, LogOut, User as UserIcon, Plus } from "lucide-react";

export function Navbar({ onNewBoardClick }: { onNewBoardClick?: () => void }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-lg tracking-tight group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Kanban className="w-5 h-5" />
          </div>
          <span className="bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent font-extrabold text-xl">
            FlowBoard
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {onNewBoardClick && (
                <button
                  onClick={onNewBoardClick}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm hover:shadow active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Board</span>
                </button>
              )}

              <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 font-medium bg-zinc-100 dark:bg-zinc-900 py-1.5 px-3 rounded-lg">
                  <UserIcon className="w-4 h-4 text-indigo-500" />
                  <span>{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
