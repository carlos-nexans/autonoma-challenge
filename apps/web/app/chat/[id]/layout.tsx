'use client';

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar";
import React from "react";

export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ id: string }> 
}>) {
  const { id } = React.use(params)
  return (
    <SidebarProvider>
    <AppSidebar currentThread={id} />
    <SidebarInset>
      {children}
    </SidebarInset>
  </SidebarProvider>
  );
}
