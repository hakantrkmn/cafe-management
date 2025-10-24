"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isPWA, setIsPWA] = useState(false);

  // PWA detection
  useEffect(() => {
    const checkPWA = () => {
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isInStandaloneMode =
        "standalone" in window.navigator &&
        (window.navigator as { standalone?: boolean }).standalone;

      setIsPWA(isStandalone || (isIOS && !!isInStandaloneMode));
    };

    checkPWA();
    window.addEventListener("resize", checkPWA);
    return () => window.removeEventListener("resize", checkPWA);
  }, []);

  // PWA için session persistence
  useEffect(() => {
    if (isPWA && session) {
      // Session'ı localStorage'a kaydet
      localStorage.setItem(
        "pwa-session",
        JSON.stringify({
          user: session.user,
          expires: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 30 gün
        })
      );
    }
  }, [session, isPWA]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        if (result?.ok) {
          // Redirect based on user role
          if (session?.user?.role === "MANAGER") {
            router.push("/dashboard");
          } else if (session?.user?.role === "STAFF") {
            router.push("/dashboard/orders");
          } else {
            router.push("/dashboard");
          }
        }
      } catch (error) {
        throw error;
      }
    },
    [router, session]
  );

  const logout = useCallback(async () => {
    // PWA için localStorage'ı temizle
    if (isPWA) {
      localStorage.removeItem("pwa-session");
    }

    await signOut({ redirect: false });
    router.push("/auth/signin");
  }, [router, isPWA]);

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const isManager = session?.user?.role === "MANAGER";
  const isStaff = session?.user?.role === "STAFF";
  const user = session?.user;

  return {
    user,
    isAuthenticated,
    isLoading,
    isManager,
    isStaff,
    isPWA,
    login,
    logout,
    session,
  };
}
