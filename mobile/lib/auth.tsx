import { router } from "expo-router";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, setAuthToken } from "@/lib/api";
import { clearSession, loadSession, saveSession } from "@/lib/storage";
import type { LoginInput, Role, Session, User } from "@/types";

type AuthState = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (input: LoginInput) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const homeFor = (role: Role) => (role === "member" ? "/member" : role === "admin" ? "/admin" : "/super");

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    loadSession()
      .then((stored) => {
        setAuthToken(stored?.accessToken ?? null);
        setSession(stored);
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback(async (next: Session) => {
    setAuthToken(next.accessToken);
    setSession(next);
    await saveSession(next);
  }, []);

  const signIn = useCallback(
    async (input: LoginInput) => {
      const next = await api.login(input);
      await persist(next);
      router.replace(homeFor(next.user.role));
    },
    [persist],
  );

  const signOut = useCallback(async () => {
    setAuthToken(null);
    setSession(null);
    await clearSession();
    router.replace("/");
  }, []);

  const updateUser = useCallback(
    async (user: User) => {
      if (!session) return;
      await persist({ ...session, user });
    },
    [persist, session],
  );

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, isLoading, signIn, signOut, updateUser }),
    [isLoading, session, signIn, signOut, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

export function useRequireRole(role: Role) {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/");
      return;
    }
    if (user.role !== role) {
      router.replace(homeFor(user.role));
    }
  }, [isLoading, role, user]);

  return { ready: !isLoading && user?.role === role };
}
