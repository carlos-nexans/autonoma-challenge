'use client'

import ChatInterface from "@/components/chat-interface"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useThread } from "@/hooks/useThread"
import { Separator } from "@radix-ui/react-separator"
import React from "react"


export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const { thread, isLoading, error } = useThread(id)

    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white sticky top-0 z-50">
                <div className="flex items-center gap-2 px-3">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                </div>
            </header>
            <main className="h-full">
                {!isLoading && !error && <ChatInterface thread={id} history={thread?.messages} />}
            </main>
        </>
    )
}
