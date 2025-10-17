"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

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
    await signOut({ redirect: false });
    router.push("/auth/signin");
  }, [router]);

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
    login,
    logout,
    session,
  };
}
