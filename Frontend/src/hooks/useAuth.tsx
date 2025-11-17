import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import * as authApi from "../api/auth";

// ==================== Types ====================

interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// ==================== Context ====================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==================== Provider ====================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
     
        if (window.location.pathname.startsWith("/login")) return;
        if (window.location.pathname.startsWith("/register")) return;

        checkAuth();
    }, []);



  const checkAuth = async () => {
    try {
      setLoading(true);
      const isAuthenticated = await authApi.checkAuth();
      if (isAuthenticated) {
        // Fetch user data from /auth/me endpoint
        // You'll need to create this function in auth.ts
        const userData = await authApi.getCurrentUser();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await authApi.login(email, password);
      // After successful login, fetch user data
      await checkAuth();
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      await authApi.register(email, password, displayName);
      // Note: Backend doesn't auto-login after registration
      // User needs to login separately
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      // Clear user anyway
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ==================== Hook ====================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// ==================== Example Usage ====================

/*
// In your App.tsx or main entry point:
import { AuthProvider } from './hooks/useAuth';

function App() {
  return (
    <AuthProvider>
      <YourRoutes />
    </AuthProvider>
  );
}

// In your components:
import { useAuth } from './hooks/useAuth';

function LoginPage() {
  const { login, loading } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      // Handle error
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}

function Dashboard() {
  const { user, logout } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  
  return (
    <div>
      <h1>Welcome, {user.displayName}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

// Protected Route component:
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return children;
}
*/