'use client'

import AppHeader from "@/components/app-header"
import ChatInterface from "@/components/chat-interface"
import { useThread } from "@/hooks/useThread"
import { useRouter } from "next/navigation"
import React from "react"
import { toast } from "sonner"


export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const { thread, isLoading, error } = useThread(id)
    const router = useRouter()

    React.useEffect(() => {
        if (error) {
            toast.error("Error loading thread")
            router.push("/")
        }
    }, [error, router])
    return (
        <>
            <AppHeader />
            <main className="h-full">
                {!isLoading && !error && thread && <ChatInterface thread={id} history={thread?.messages} />}
            </main>
        </>
    )
}
