"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { useAuth } from "../../context/auth-context";
import {
  Kanban,
  ArrowRight,
  Lock,
  Mail,
  User,
  AlertCircle,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/register", {
        name,
        email,
        password,
      });
      login(res.data.accessToken, res.data.user);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-[#edf3f0]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-3 font-bold text-2xl tracking-tight mb-3 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#0d8b75] flex items-center justify-center text-white shadow-sm shadow-[#0d8b75]/25 group-hover:scale-105 transition-transform">
              <Kanban className="w-6 h-6" />
            </div>
            <span className="text-[#1c2724] font-extrabold text-2xl tracking-tight">
              NovaBoard
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1c2724]">
            Create your account
          </h1>
          <p className="text-xs text-[#64746f] mt-1">
            Start collaborating with your team today
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#e1eae5]">
          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4d5f59] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#82928c]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-[#d8e4df] bg-[#edf3f0]/40 text-[#1c2724] placeholder:text-[#9ab0a7] focus:outline-none focus:ring-2 focus:ring-[#0d8b75] transition-all text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4d5f59] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#82928c]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-[#d8e4df] bg-[#edf3f0]/40 text-[#1c2724] placeholder:text-[#9ab0a7] focus:outline-none focus:ring-2 focus:ring-[#0d8b75] transition-all text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4d5f59] mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#82928c]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  minLength={6}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-[#d8e4df] bg-[#edf3f0]/40 text-[#1c2724] placeholder:text-[#9ab0a7] focus:outline-none focus:ring-2 focus:ring-[#0d8b75] transition-all text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-full bg-[#0d8b75] hover:bg-[#0a7361] active:scale-[0.99] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? "Creating Account..." : "Create Account"}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#edf3f0] text-center text-xs text-[#64746f]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-[#0d8b75] hover:underline"
            >
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
