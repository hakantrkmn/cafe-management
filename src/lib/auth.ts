import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const prisma = new PrismaClient();

// Error message mapping for user-friendly feedback
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  EMAIL_VE_SIFRE_GEREKLI: "Email ve şifre alanları zorunludur",
  KULLANICI_BULUNAMADI: "Bu email adresi ile kayıtlı kullanıcı bulunamadı",
  YANLIS_SIFRE: "Şifre yanlış. Lütfen tekrar deneyin",
  CAFE_ERISIMI_YOK:
    "Bu cafe için erişim izniniz bulunmuyor. Lütfen yöneticinizle iletişime geçin",
  GIRIS_HATASI:
    "Giriş sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin",
  CredentialsSignin: "Giriş bilgileri yanlış. Email ve şifrenizi kontrol edin",
};

// Function to get user-friendly error message
export function getAuthErrorMessage(error: string): string {
  return AUTH_ERROR_MESSAGES[error] || "Giriş başarısız. Lütfen tekrar deneyin";
}

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
          throw new Error("EMAIL_VE_SIFRE_GEREKLI");
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
            throw new Error("KULLANICI_BULUNAMADI");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("YANLIS_SIFRE");
          }

          // If user is STAFF and doesn't have cafeId, get it from AllowedStaff
          let finalCafeId = user.cafeId;
          let finalCafe = user.cafe;

          if (user.role === "STAFF" && !user.cafeId) {
            const allowedStaff = await prisma.allowedStaff.findFirst({
              where: { userId: user.id },
              include: { cafe: true },
            });

            if (!allowedStaff) {
              throw new Error("CAFE_ERISIMI_YOK");
            }

            finalCafeId = allowedStaff.cafeId;
            finalCafe = allowedStaff.cafe;

            // Update user's cafeId in database
            await prisma.user.update({
              where: { id: user.id },
              data: { cafeId: allowedStaff.cafeId },
            });
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            cafeId: finalCafeId || undefined,
            cafe: finalCafe,
            managedCafe: user.managedCafe,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw new Error("GIRIS_HATASI");
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
