import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      // If unauthorized, clear token
      const isAuthRoute =
        window.location.pathname.startsWith("/login") ||
        window.location.pathname.startsWith("/register");
      if (!isAuthRoute) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

export type BoardRole = "OWNER" | "EDITOR" | "VIEWER";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description?: string | null;
  order: number;
  priority: TaskPriority;
  assigneeId?: string | null;
  assignee?: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  order: number;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
  role: BoardRole;
  user: User;
}

export interface Board {
  id: string;
  title: string;
  description?: string | null;
  ownerId: string;
  owner: User;
  members: BoardMember[];
  columns: Column[];
  userRole?: BoardRole;
  _count?: {
    columns: number;
  };
  createdAt: string;
  updatedAt: string;
}
