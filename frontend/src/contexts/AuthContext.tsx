import { useEffect, useState, ReactNode } from "react";
import { authApi, AuthResponse, setTokens, clearTokens, setUser, getUser, getAccessToken, UserProfile } from "@/lib/api";
import { AuthContext, type RegisterData } from "@/contexts/auth-context";

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
