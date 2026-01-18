import React, { createContext, useContext, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

export type UserMode = "donor" | "seeker" | "both";

interface ModeContextType {
  currentMode: UserMode | null;
  isLoading: boolean;
  setMode: (mode: UserMode) => Promise<void>;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const user = useQuery(api.users.getCurrentUser);
  const updateModeMutation = useMutation(api.users.updateMode);

  const isLoading = user === undefined;
  const currentMode = user?.mode ?? null;

  const setMode = useCallback(
    async (mode: UserMode) => {
      await updateModeMutation({ mode });
    },
    [updateModeMutation]
  );

  const value = useMemo(
    () => ({
      currentMode,
      isLoading,
      setMode,
    }),
    [currentMode, isLoading, setMode]
  );

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useModeContext(): ModeContextType {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error("useModeContext must be used within a ModeProvider");
  }
  return context;
}
