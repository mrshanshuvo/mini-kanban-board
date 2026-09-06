"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../context/auth-context";
import { Kanban, LogOut, User as UserIcon, Plus } from "lucide-react";

export function Navbar({ onNewBoardClick }: { onNewBoardClick?: () => void }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#e1eae5] bg-[#edf3f0]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 font-bold text-lg tracking-tight group"
        >
          {/* Nova Starburst/Teal Logo Emblem */}
          <div className="w-10 h-10 rounded-2xl bg-[#0d8b75] flex items-center justify-center text-white shadow-sm shadow-[#0d8b75]/25 group-hover:scale-105 transition-transform">
            <Kanban className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[#1c2724] font-extrabold text-xl tracking-tight leading-none">
              NovaBoard
            </span>
            <span className="text-[10px] font-medium text-[#64746f] mt-0.5">
              Workspace
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {onNewBoardClick && (
                <button
                  onClick={onNewBoardClick}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold rounded-full bg-[#fec84b] hover:bg-[#fdb022] text-[#1c2724] transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Board</span>
                  <span className="sm:hidden">New</span>
                </button>
              )}

              <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-[#d8e4df]">
                <div className="flex items-center gap-2 text-xs text-[#2c3e39] font-medium bg-white border border-[#e2ece7] py-1.5 px-2.5 sm:px-3.5 rounded-full shadow-xs">
                  <div className="w-5 h-5 rounded-full bg-[#dcfce7] text-[#0d8b75] flex items-center justify-center font-bold text-[10px]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-20 sm:max-w-none truncate">
                    {user.name.split(" ")[0]}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 text-[#7c8e88] hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-semibold text-[#3b4c47] hover:text-[#1c2724] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-xs font-semibold rounded-full bg-[#0d8b75] hover:bg-[#0a7361] text-white shadow-sm transition-all"
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
