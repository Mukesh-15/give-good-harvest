
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  token: string | null;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  organization?: string;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  register: async () => {},
  token: null,
});

export const useAuth = () => useContext(AuthContext);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load user and token from localStorage on initial load
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Login failed",
          description: data.message || "Invalid credentials",
          variant: "destructive",
        });
        throw new Error(data.message || "Login failed");
      }
      setUser(data.user);
      setToken(data.token);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.name}!`,
      });
    } catch (err: any) {
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const register = async (userData: RegisterData) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Registration failed",
          description: data.message || "Could not register",
          variant: "destructive",
        });
        throw new Error(data.message || "Registration failed");
      }
      setUser(data.user);
      setToken(data.token);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      toast({
        title: "Registration successful",
        description: `Welcome, ${data.user.name}!`,
      });
    } catch (err: any) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register, token }}>
      {children}
    </AuthContext.Provider>
  );
};
