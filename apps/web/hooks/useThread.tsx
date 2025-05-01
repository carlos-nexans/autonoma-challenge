'use client'

import { Thread } from "@repo/api"
import { useQuery } from "@tanstack/react-query"

export const useThread = function (id: string) {
    const { data: thread, error, isLoading } = useQuery({
        queryKey: ['thread', id],
        queryFn: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/threads/${id}`)
            if (!response.ok) {
                throw new Error('Failed to fetch thread')
            }
            return response.json() as Promise<Thread>
        }
    })

    return {
        thread,
        messages: thread?.messages || [],
        error,
        isLoading,
    }
}