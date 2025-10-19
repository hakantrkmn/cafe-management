"use client";

import { usePageLoading } from "@/hooks/usePageLoading";
import { useAuth } from "@/queries/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Auto page loading
  usePageLoading(isLoading, {
    loadingText: "Yönlendiriliyor...",
    delay: 200,
    minDuration: 800,
  });

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/auth/signin");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return null; // Loading is handled by usePageLoading
}
