'use client';

import { BrowserRouter, Routes, Route } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/components/query-provider';

import { TopProgressBar } from '@/components/top-progress-bar';
import { Suspense } from 'react';
import { Posthog } from '@/components/posthog';
import { ClerkProvider } from '@clerk/nextjs';
import LaunchChat from './LaunchChat';
import Thread from './Thread';

export default function Page() {
  return (
    <ClerkProvider>
      <Posthog>
        <QueryProvider>
          <Suspense>
            <TopProgressBar />
          </Suspense>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LaunchChat />} />
              <Route path="/chat/:id" element={<Thread />} />
            </Routes>
          </BrowserRouter>
        </QueryProvider>
        <Toaster />
      </Posthog>
    </ClerkProvider>
  );
}
