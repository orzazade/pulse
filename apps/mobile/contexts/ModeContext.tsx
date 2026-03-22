import React, { createContext, useContext, useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

export type UserMode = "donor" | "seeker" | "both";

interface ModeContextType {
  currentMode: UserMode | null;
  isLoading: boolean;
  isSwitching: boolean;
  setMode: (mode: UserMode) => Promise<void>;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const user = useQuery(api.users.getCurrentUser);
  const updateModeMutation = useMutation(api.users.updateMode);

  const [isSwitching, setIsSwitching] = useState(false);
  const isLoading = user === undefined;
  const currentMode = user?.mode ?? null;

  const setMode = useCallback(
    async (mode: UserMode) => {
      if (isSwitching) return;
      setIsSwitching(true);
      try {
        await updateModeMutation({ mode });
      } catch (error) {
        Alert.alert(
          "Mode Switch Failed",
          error instanceof Error ? error.message : "Could not switch mode. Please try again.",
          [{ text: "OK" }]
        );
      } finally {
        setIsSwitching(false);
      }
    },
    [updateModeMutation, isSwitching]
  );

  const value = useMemo(
    () => ({
      currentMode,
      isLoading,
      isSwitching,
      setMode,
    }),
    [currentMode, isLoading, isSwitching, setMode]
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
