import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "MANAGER" | "STAFF";
      cafeId?: string | undefined;
      cafe?: {
        id: string;
        name: string;
        address?: string;
        phone?: string;
      };
      managedCafe?: {
        id: string;
        name: string;
        address?: string;
        phone?: string;
      };
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: "MANAGER" | "STAFF";
    cafeId?: string | undefined;
    cafe?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    managedCafe?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "MANAGER" | "STAFF";
    cafeId?: string | undefined;
    cafe?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    managedCafe?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}
