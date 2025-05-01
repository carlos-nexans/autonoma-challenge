'use client'

import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

export const useThreads = function () {
    const router = useRouter()
    const { data: threads = [], refetch } = useQuery({
        queryKey: ['threads'],
        staleTime: 5 * 1000,
        refetchOnMount: false,
        gcTime: 5 * 60 * 1000,
        queryFn: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/threads`)
            if (!response.ok) {
                throw new Error('Failed to fetch threads')
            }
            return response.json()
        }
    })

    const addThread = async function () {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/threads`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })

        if (!response.ok) {
            throw new Error('Failed to create thread')
        }

        const newThread = await response.json()
        await refetch()
        return newThread
    }
    
    const deleteThread = async function (id: string) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/threads/${id}`, {
            method: 'DELETE'
        })

        if (!response.ok) {
            throw new Error('Failed to delete thread')
        }

        await refetch()
    }

    const newThread = async function () {
        const thread = await addThread()
        router.push(`/chat/${thread.id}`)
    }

    return {
        threads,
        addThread,
        deleteThread,
        newThread,
        refetch,
    }
}