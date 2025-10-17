import { AuthUser, LoginRequest, RegisterRequest } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signIn, signOut, useSession } from "next-auth/react";

// Auth API functions
const authApi = {
  login: async (credentials: LoginRequest) => {
    const result = await signIn("credentials", {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    return result;
  },

  register: async (data: RegisterRequest) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Kayıt başarısız");
    }

    return response.json();
  },

  logout: async () => {
    await signOut({ redirect: false });
  },
};

// Auth hooks
export function useAuth() {
  const { data: session, status } = useSession();

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const isManager = session?.user?.role === "MANAGER";
  const isStaff = session?.user?.role === "STAFF";
  const user = session?.user as AuthUser | undefined;

  return {
    user,
    isAuthenticated,
    isLoading,
    isManager,
    isStaff,
    session,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (result) => {
      if (result?.ok) {
        queryClient.invalidateQueries();
        window.location.href = "/dashboard";
      }
    },
    onError: (error) => {
      console.error("Login error:", error);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      window.location.href =
        "/auth/signin?message=Kayıt başarılı, giriş yapabilirsiniz";
    },
    onError: (error) => {
      console.error("Registration error:", error);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/auth/signin";
    },
    onError: (error) => {
      console.error("Logout error:", error);
    },
  });
}
