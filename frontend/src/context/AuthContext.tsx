import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi } from "@/api/auth";
import { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("tripsplit_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("tripsplit_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      if (token) {
        try {
          const { user: freshUser } = await authApi.me();
          setUser(freshUser);
          localStorage.setItem("tripsplit_user", JSON.stringify(freshUser));
        } catch {
          setUser(null);
          setToken(null);
          localStorage.removeItem("tripsplit_token");
          localStorage.removeItem("tripsplit_user");
        }
      }
      setLoading(false);
    };
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = (t: string, u: User) => {
    localStorage.setItem("tripsplit_token", t);
    localStorage.setItem("tripsplit_user", JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const login = async (email: string, password: string) => {
    const { token: t, user: u } = await authApi.login({ email, password });
    persist(t, u);
  };

  const register = async (name: string, email: string, password: string) => {
    const { token: t, user: u } = await authApi.register({ name, email, password });
    persist(t, u);
  };

  const logout = () => {
    localStorage.removeItem("tripsplit_token");
    localStorage.removeItem("tripsplit_user");
    setToken(null);
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    const { user: u } = await authApi.updateProfile(data);
    setUser(u);
    localStorage.setItem("tripsplit_user", JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
