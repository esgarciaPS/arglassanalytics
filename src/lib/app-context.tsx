import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Role } from "./mock-data";

export interface Session {
  name: string;
  email: string;
  role: Role;
}

interface AppContextValue {
  session: Session | null;
  ready: boolean;
  signIn: (email: string, role: Role) => void;
  signOut: () => void;
  search: string;
  setSearch: (value: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);
const STORAGE_KEY = "demo.session";

function nameFromEmail(email: string) {
  const handle = email.split("@")[0] ?? "operator";
  return handle
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSession(JSON.parse(raw) as Session);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const signIn = useCallback((email: string, role: Role) => {
    const next: Session = { email, role, name: nameFromEmail(email) };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setSearch("");
  }, []);

  const value = useMemo(
    () => ({ session, ready, signIn, signOut, search, setSearch }),
    [session, ready, signIn, signOut, search],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

/** Case-insensitive match of a free-text query against a set of fields. */
export function matchesSearch(query: string, ...fields: (string | number)[]) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => String(f).toLowerCase().includes(q));
}
