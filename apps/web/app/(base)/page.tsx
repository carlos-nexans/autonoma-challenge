'use client'

import AppHeader from "@/components/app-header"
import ChatInterface from "@/components/chat-interface"

export default function Page() {
  return (
    <>
      <AppHeader />
      <main className="h-full">
        <ChatInterface />
      </main>
    </>
  )
}
