'use client'

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from '@/components/query-provider';
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
        <QueryProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-gray-50">
              {children}
            </SidebarInset>
          </SidebarProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
