"use client"
import { PostHogProvider } from 'posthog-js/react'

export function Posthog({ children }: { children: React.ReactNode }) {
    if (!process.env.NEXT_PUBLIC_POSTHOG_API_KEY) {
        return children;
    }

    return (
        <PostHogProvider apiKey={process.env.NEXT_PUBLIC_POSTHOG_API_KEY}>
            {children}
        </PostHogProvider>
    )
}