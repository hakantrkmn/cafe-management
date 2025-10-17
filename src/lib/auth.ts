import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
            include: {
              cafe: true,
              managedCafe: true,
            },
          });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            cafeId: user.cafeId || undefined,
            cafe: user.cafe,
            managedCafe: user.managedCafe,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.cafeId = user.cafeId;
        token.cafe = user.cafe;
        token.managedCafe = user.managedCafe;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as "MANAGER" | "STAFF";
        session.user.cafeId = token.cafeId as string | undefined;
        session.user.cafe = token.cafe as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        session.user.managedCafe = token.managedCafe as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
