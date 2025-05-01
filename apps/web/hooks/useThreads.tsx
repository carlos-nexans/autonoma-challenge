'use client'

import { Threads } from "@repo/api"
import { useState } from "react"

export const useThreads = function () {
    const [threads, setThreads] = useState<Threads>([])

    const addThread = async function () {
        const newThread = {
            id: Math.random().toString(36).substring(2, 15),
            title: 'New Thread',
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        setThreads([
            ...threads,
            newThread,
        ])

        return newThread;
    }
    
    const deleteThread = async function (id: string) {
        setThreads(threads.filter((thread) => thread.id !== id))
    }

    return {
        threads,
        addThread,
        deleteThread,
    }
}