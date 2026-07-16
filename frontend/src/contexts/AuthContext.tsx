import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi, AuthResponse, UserProfile, setTokens, clearTokens, setUser, getUser, getAccessToken } from "@/lib/api";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role?: string;
  registration_number?: string;
  branch?: string;
  year_of_study?: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => { throw new Error("Auth not ready"); },
  register: async () => { throw new Error("Auth not ready"); },
  logout: () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<UserProfile | null>(getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    // Verify token is still valid
    authApi.me()
      .then((profile) => {
        setUserState(profile);
        setUser(profile);
      })
      .catch(() => {
        clearTokens();
        setUserState(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const res = await authApi.login(email, password);
    setTokens(res.access_token, res.refresh_token);
    const profile = await authApi.me();
    setUserState(profile);
    setUser(profile);
    return res;
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    const res = await authApi.register(data);
    setTokens(res.access_token, res.refresh_token);
    const profile = await authApi.me();
    setUserState(profile);
    setUser(profile);
    return res;
  };

  const logout = () => {
    clearTokens();
    setUserState(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};