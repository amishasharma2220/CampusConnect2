import { createContext } from "react";
import type { AuthResponse, UserProfile } from "@/lib/api";

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role?: string;
  registration_number?: string;
  branch?: string;
  year_of_study?: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Kept separate from AuthContext.tsx so that file only exports a component
// (required for React Fast Refresh).
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => { throw new Error("Auth not ready"); },
  register: async () => { throw new Error("Auth not ready"); },
  logout: () => {},
  isAuthenticated: false,
});
