import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from '@/components/query-provider';
import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Chat assistant",
};

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
            <SidebarInset>
              {children}
            </SidebarInset>
          </SidebarProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
