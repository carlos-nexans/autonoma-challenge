'use client';

import React from 'react';
import AppHeader from '@/components/app-header';
import ChatInterface from '@/components/chat-interface';
import { useThread } from '@/hooks/useThread';
import { toast } from 'sonner';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { useNavigate, useParams } from 'react-router';

export default function Thread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { thread, isLoading, error } = useThread(id!);

  React.useEffect(() => {
    if (error) {
      toast.error('Error loading thread');
      navigate('/');
    }
  }, [id, error]);

  return (
    <SidebarProvider>
      <AppSidebar currentThread={id} />
      <SidebarInset>
        <AppHeader />
        <main className="h-full">
          {!isLoading && !error && thread && (
            <ChatInterface 
              key={id}
              thread={id} 
              history={thread?.messages} 
            />
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
