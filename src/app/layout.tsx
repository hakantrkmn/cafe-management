import { AuthProvider } from "@/components/providers/AuthProvider";
import { ConfirmationModalProvider } from "@/components/providers/ConfirmationModalProvider";
import { LoadingProvider } from "@/components/providers/LoadingProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cafe Management System",
  description:
    "Modern cafe management system for orders, menu, and staff management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            <ConfirmationModalProvider>
              <LoadingProvider>{children}</LoadingProvider>
            </ConfirmationModalProvider>
          </AuthProvider>
        </QueryProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 1000, // 3 saniye
          }}
        />
      </body>
    </html>
  );
}
