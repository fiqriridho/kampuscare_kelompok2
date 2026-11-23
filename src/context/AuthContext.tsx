import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

type Account = { email: string; password: string };

type AuthContextValue = {
  isAuthenticated: boolean;
  isReady: boolean;
  storageError: string;
  lastRegisteredEmail: string;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
};

const STORAGE_KEY = "kampuscare.auth.accounts.v1";
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function readAccounts(): Promise<Account[]> {
  const serialized =
    Platform.OS === "web"
      ? globalThis.localStorage.getItem(STORAGE_KEY)
      : await SecureStore.getItemAsync(STORAGE_KEY);

  if (!serialized) {
    return [];
  }

  const parsed: unknown = JSON.parse(serialized);
  if (
    !Array.isArray(parsed) ||
    !parsed.every(
      (account) =>
        typeof account.email === "string" &&
        typeof account.password === "string"
    )
  ) {
    throw new Error("Data akun tersimpan tidak valid.");
  }

  return parsed as Account[];
}

async function writeAccounts(accounts: Account[]) {
  const serialized = JSON.stringify(accounts);
  if (Platform.OS === "web") {
    globalThis.localStorage.setItem(STORAGE_KEY, serialized);
    return;
  }
  await SecureStore.setItemAsync(STORAGE_KEY, serialized);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    let active = true;

    const restoreAccounts = async () => {
      try {
        const storedAccounts = await readAccounts();
        if (active) {
          setAccounts(storedAccounts);
        }
      } catch {
        if (active) {
          setStorageError(
            "Akun tersimpan tidak dapat dibaca. Coba tutup lalu buka kembali aplikasi."
          );
        }
      } finally {
        if (active) {
          setIsReady(true);
        }
      }
    };

    void restoreAccounts();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isReady,
      storageError,
      lastRegisteredEmail: accounts[accounts.length - 1]?.email ?? "",
      signIn: async (email: string, password: string) => {
        if (!isReady || storageError) {
          throw new Error("Penyimpanan akun belum siap.");
        }
        const account = accounts.find(
          (item) => item.email === email.trim().toLowerCase()
        );
        if (!account || account.password !== password) {
          return false;
        }
        setIsAuthenticated(true);
        return true;
      },
      signUp: async (email: string, password: string) => {
        if (!isReady || storageError) {
          throw new Error("Penyimpanan akun belum siap.");
        }
        const normalizedEmail = email.trim().toLowerCase();
        if (accounts.some((item) => item.email === normalizedEmail)) {
          return false;
        }
        const updatedAccounts = [
          ...accounts,
          { email: normalizedEmail, password },
        ];
        await writeAccounts(updatedAccounts);
        setAccounts(updatedAccounts);
        return true;
      },
      signOut: () => setIsAuthenticated(false),
    }),
    [accounts, isAuthenticated, isReady, storageError]
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
