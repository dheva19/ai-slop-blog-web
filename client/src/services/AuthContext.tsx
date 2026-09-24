import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthResponse } from "../types";
import { api } from "./api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: { username: string; email: string; password: string; full_name?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await api.get<User>("/auth/me");
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.post<AuthResponse>("/auth/login", credentials);
    setToken(res.data.access_token);
    setUser(res.data.user);
    localStorage.setItem("token", res.data.access_token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
  };

  const register = async (userData: { username: string; email: string; password: string; full_name?: string }) => {
    const res = await api.post<AuthResponse>("/auth/register", userData);
    setToken(res.data.access_token);
    setUser(res.data.user);
    localStorage.setItem("token", res.data.access_token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
