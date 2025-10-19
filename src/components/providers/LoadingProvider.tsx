"use client";

import { FullScreenLoading } from "@/components/ui/loading";
import { createContext, ReactNode, useContext, useState } from "react";

interface LoadingContextType {
  isLoading: boolean;
  loadingText: string;
  setLoading: (loading: boolean, text?: string) => void;
  showLoading: (text?: string) => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Yükleniyor...");

  const setLoading = (loading: boolean, text: string = "Yükleniyor...") => {
    setIsLoading(loading);
    setLoadingText(text);
  };

  const showLoading = (text: string = "Yükleniyor...") => {
    setLoading(true, text);
  };

  const hideLoading = () => {
    setLoading(false);
  };

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        loadingText,
        setLoading,
        showLoading,
        hideLoading,
      }}
    >
      {children}
      {isLoading && <FullScreenLoading text={loadingText} />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
