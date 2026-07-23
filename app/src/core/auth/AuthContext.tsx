"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { gqlClient, setAccessToken, refreshAccessToken } from "@/app/src/core/api/graphql-client";

interface User {
  userID: number;
  name: string;
  email: string;
  avatarURL: string | null;
  roleID: number;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ME_QUERY = `query { me { userID name email avatarURL roleID createdAt updatedAt } }`;

function restoreSession(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const storedAccess = restoreSession();
    if (!storedAccess) {
      Promise.resolve().then(() => setLoading(false));
      return;
    }
    setAccessToken(storedAccess);
    gqlClient()
      .request<{ me: User }>(ME_QUERY)
      .then((data) => {
        setUser(data.me);
        setLoading(false);
      })
      .catch(() => {
        setAccessToken(null);
        const storedRefresh = localStorage.getItem("refreshToken");
        if (storedRefresh) {
          refreshAccessToken(storedRefresh).then((tokens) => {
            if (tokens) {
              localStorage.setItem("accessToken", tokens.accessToken);
              localStorage.setItem("refreshToken", tokens.refreshToken);
              setAccessToken(tokens.accessToken);
              gqlClient()
                .request<{ me: User }>(ME_QUERY)
                .then((data) => setUser(data.me))
                .catch(() => logout())
                .finally(() => setLoading(false));
            } else {
              logout();
              setLoading(false);
            }
          });
        } else {
          setLoading(false);
        }
      });
  }, [logout]);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      const data = await gqlClient().request<{
        login: { user: User; accessToken: string; refreshToken: string };
      }>(
        `mutation ($input: LoginInput!) {
          login(input: $input) {
            user { userID name email avatarURL roleID createdAt updatedAt }
            accessToken
            refreshToken
          }
        }`,
        { input: { email, password } },
      );
      const { user: u, accessToken, refreshToken: rt } = data.login;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", rt);
      setAccessToken(accessToken);
      setUser(u);
      return null;
    } catch (err: unknown) {
      const e = err as { response?: { errors?: Array<{ message: string }> } };
      return e?.response?.errors?.[0]?.message ?? "Error al iniciar sesión";
    }
  }, []);

  const isAdmin = user?.roleID === 3;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
