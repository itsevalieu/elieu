"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  Suspense,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";

type Layout = "newspaper" | "magazine";

interface LayoutContextValue {
  layout: Layout;
  setLayout: (layout: Layout) => void;
}

const LayoutContext = createContext<LayoutContextValue>({
  layout: "newspaper",
  setLayout: () => {},
});

/** Reads `?layout=` via `useSearchParams` behind `<Suspense>` so the provider stays mounted. */
function LayoutSearchParamsBridge({
  setLayout,
}: {
  setLayout: (layout: Layout) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlLayout = searchParams.get("layout") as Layout | null;
    if (urlLayout === "newspaper" || urlLayout === "magazine") {
      setLayout(urlLayout);
      return;
    }
    const saved = localStorage.getItem("layoutPreference") as Layout | null;
    if (saved === "newspaper" || saved === "magazine") {
      setLayout(saved);
    }
  }, [searchParams, setLayout]);

  return null;
}

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [layout, setLayoutState] = useState<Layout>("newspaper");

  const setLayout = useCallback((nextLayout: Layout) => {
    setLayoutState(nextLayout);
    localStorage.setItem("layoutPreference", nextLayout);
    document.documentElement.dataset.layout = nextLayout;
  }, []);

  useEffect(() => {
    document.documentElement.dataset.layout = layout;
  }, [layout]);

  return (
    <LayoutContext.Provider value={{ layout, setLayout }}>
      <Suspense fallback={null}>
        <LayoutSearchParamsBridge setLayout={setLayout} />
      </Suspense>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  return useContext(LayoutContext);
}
