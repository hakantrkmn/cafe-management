"use client";

import { useLoading } from "@/components/providers/LoadingProvider";
import { useEffect } from "react";

interface UsePageLoadingOptions {
  loadingText?: string;
  delay?: number; // Delay before showing loading (ms)
  minDuration?: number; // Minimum duration to show loading (ms)
}

export function usePageLoading(
  isLoading: boolean,
  options: UsePageLoadingOptions = {}
) {
  const { showLoading, hideLoading } = useLoading();
  const {
    loadingText = "Sayfa yükleniyor...",
    delay = 0,
    minDuration = 500,
  } = options;

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    let startTime: number | undefined;

    if (isLoading) {
      startTime = Date.now();

      if (delay > 0) {
        timeoutId = setTimeout(() => {
          showLoading(loadingText);
        }, delay);
      } else {
        showLoading(loadingText);
      }
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const elapsed = Date.now() - (startTime || 0);
      const remainingTime = Math.max(0, minDuration - elapsed);

      if (remainingTime > 0) {
        setTimeout(() => {
          hideLoading();
        }, remainingTime);
      } else {
        hideLoading();
      }
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading, loadingText, delay, minDuration, showLoading, hideLoading]);
}

// Hook for automatic page loading based on data fetching
export function useAutoPageLoading(
  queries: { isLoading: boolean }[],
  options: UsePageLoadingOptions = {}
) {
  const isLoading = queries.some((query) => query.isLoading);
  usePageLoading(isLoading, options);
  return isLoading;
}

// Hook for manual loading control
export function useManualLoading() {
  const { showLoading, hideLoading, isLoading } = useLoading();

  return {
    isLoading,
    showLoading: (text?: string) => showLoading(text),
    hideLoading: () => hideLoading(),
  };
}
