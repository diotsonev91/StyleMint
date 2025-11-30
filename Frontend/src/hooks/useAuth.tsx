import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import * as authApi from "../api/auth";

// ==================== Types ====================

interface User {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    roles: string[];
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const userData = await authApi.getCurrentUser();
            setUser(userData as any);
        } catch (error) {
            console.log('Auth check failed, user not authenticated');
            setUser(null);

            // ✅ REDIRECT ЛОГИКА ТУК
            const currentPath = window.location.pathname;
            const publicPaths = ['/', '/login', '/register', '/logout'];
            const isPublicPath = publicPaths.includes(currentPath);

            if (!isPublicPath) {
                console.log('→ Redirecting to login (protected route)');
                window.location.href = '/login';
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        await authApi.login(email, password);
        await checkAuth();
    };

    const register = async (email: string, password: string, displayName: string) => {
        await authApi.register(email, password, displayName);
        setUser(null);
    };

    const logout = async () => {
        try {
            await authApi.logout();
            setUser(null);
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
            setUser(null);
            window.location.href = '/login';
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

// ==================== Hook ====================

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}