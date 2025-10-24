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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cafe Manager",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Cafe Manager" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/icon-512x512.png"
        />
      </head>
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
