import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { authService } from "../services/authService";

type AuthContextValue = {
  isAuthenticated: boolean;
  isReady: boolean;
  storageError: string;
  lastRegisteredEmail: string;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    let active = true;

    const { data } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (active) {
          setSession(currentSession);
          setStorageError("");
        }
      }
    );

    const restoreSession = async () => {
      try {
        const { data: sessionData, error } =
          await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (active) {
          setSession(sessionData.session);
          setStorageError("");
        }
      } catch (error) {
        if (active) {
          setStorageError(
            error instanceof Error
              ? `Gagal memeriksa sesi: ${error.message}`
              : "Gagal memeriksa sesi autentikasi."
          );
        }
      } finally {
        if (active) {
          setIsReady(true);
        }
      }
    };

    void restoreSession();

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
      setSession(null);
      setStorageError("");
    } catch (error) {
      setStorageError(
        error instanceof Error
          ? `Gagal keluar: ${error.message}`
          : "Gagal keluar dari akun."
      );
    }
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(session),
      isReady,
      storageError,
      lastRegisteredEmail: "",
      signOut,
    }),
    [session, isReady, storageError, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider.");
  }
  return context;
}
