'use client';

import AppHeader from '@/components/app-header';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import ChatInterface from '@/components/chat-interface';

export default function LaunchChat() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="h-full">
          <ChatInterface />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
