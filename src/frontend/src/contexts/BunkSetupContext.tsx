import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useActor } from "../hooks/useActor";
import type { BunkSetup } from "../types";

interface BunkSetupContextValue {
  setup: BunkSetup | null;
  loading: boolean;
  reload: () => void;
}

const BunkSetupContext = createContext<BunkSetupContextValue | null>(null);

export function BunkSetupProvider({ children }: { children: React.ReactNode }) {
  const { actor, isFetching } = useActor();
  const [setup, setSetup] = useState<BunkSetup | null>(null);
  const [loading, setLoading] = useState(true);
  // Use a ref to expose a stable "fetch" function that can be called imperatively
  const fetchRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isFetching || !actor) return;

    let cancelled = false;
    setLoading(true);

    const doFetch = () => {
      if (cancelled) return;
      setLoading(true);
      actor
        .getSetup()
        .then((s) => {
          if (!cancelled) setSetup(s);
        })
        .catch(() => {
          if (!cancelled) setSetup(null);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    fetchRef.current = doFetch;
    doFetch();

    return () => {
      cancelled = true;
      fetchRef.current = null;
    };
  }, [actor, isFetching]);

  const reload = useCallback(() => {
    fetchRef.current?.();
  }, []);

  return (
    <BunkSetupContext.Provider value={{ setup, loading, reload }}>
      {children}
    </BunkSetupContext.Provider>
  );
}

export function useBunkSetup(): BunkSetupContextValue {
  const ctx = useContext(BunkSetupContext);
  if (!ctx) {
    throw new Error("useBunkSetup must be used within a BunkSetupProvider");
  }
  return ctx;
}
