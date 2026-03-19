import { createContext, useContext, useEffect } from "react";
import { useAuth as useAuthHook } from "../hooks/useAuth";
import type { ReactNode } from "react";
import type { User } from "@shared/Profile"; // adjust based on your User type
import type { LoginData, RegisterData } from "@shared/Auth";


// src/context/AuthContext.tsx
export interface AuthContextType {
  user: User | null;
  login: (data: LoginData) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; user?: User; error?: string }>;
  loading: boolean;
  logout: () => void;
}
// interface AuthContextType {
//   user: User | null;
//   login: (user: User) => void;
//   logout: () => void;
// }

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // const { user, login, logout } = useAuthHook();
  const { user, login, register, logout, loading } = useAuthHook();

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};
