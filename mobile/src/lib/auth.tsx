import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { authApi, setSessionExpiredHandler, tokens, type AuthResponse, type RegisterPayload, type UserProfile } from "./api";

type AuthState = {
  /** True until stored tokens have been read on launch. */
  loading: boolean;
  user: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  const loadMe = useCallback(async () => {
    const me = await authApi.me();
    setUser(me);
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null));
    (async () => {
      try {
        const { accessToken } = await tokens.load();
        if (accessToken) await loadMe();
      } catch {
        // Offline or token rejected: if tokens were cleared, user stays signed out.
        if (!tokens.hasSession) setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [loadMe]);

  const afterAuth = useCallback(
    async (res: AuthResponse) => {
      await tokens.save(res.access_token, res.refresh_token);
      await loadMe();
    },
    [loadMe],
  );

  const value = useMemo<AuthState>(
    () => ({
      loading,
      user,
      signIn: async (email, password) => afterAuth(await authApi.login(email.trim().toLowerCase(), password)),
      signUp: async (data) => afterAuth(await authApi.register({ ...data, email: data.email.trim().toLowerCase() })),
      signOut: async () => {
        const refresh = tokens.refresh;
        if (refresh) authApi.logout(refresh).catch(() => {});
        await tokens.clear();
        setUser(null);
      },
      refreshUser: loadMe,
    }),
    [loading, user, afterAuth, loadMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
