'use client'

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
    <AppSidebar />
    <SidebarInset className="bg-gray-50">
      {children}
    </SidebarInset>
  </SidebarProvider>
  );
}
