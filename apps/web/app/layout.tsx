import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from '@/components/query-provider';
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import { TopProgressBar } from "@/components/top-progress-bar";
import { Suspense } from "react";
import { Posthog } from "@/components/posthog";

const inter = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'AI assistant made by Carlos Nexans',
  robots: "noindex, noffollow"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} ${inter.variable}`}>
      <body
        className="font-sans antialiased"
        id="root"
      >
        <Posthog>
        <QueryProvider>
          <Suspense>
            <TopProgressBar />
          </Suspense>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-gray-50">
              {children}
            </SidebarInset>
          </SidebarProvider>
        </QueryProvider>
        <Toaster />
        </Posthog>
      </body>
    </html>
  );
}
