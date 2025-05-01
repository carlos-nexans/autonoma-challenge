import { toast } from "sonner"
import { useEffect, useState } from "react";
import type { AddMessageInput, Message, StreamingEvent } from "@repo/api";
import { useThreads } from "./useThreads";
import { useRouter } from "next/navigation";

export default function useChat({ thread, history = [] }: { thread?: string, history?: Message[] } = {}) {
    const { refetch } = useThreads();
    const router = useRouter();

    const [threadId, setThreadId] = useState<string | undefined>(thread);
    const [messages, setMessages] = useState<Message[]>(history);
    const [streaming, setStreaming] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [hasTyped, setHasTyped] = useState(false);

    const modifyLatestMessage = (content: string) => (currentMessages: Message[]) => {
        const newMessages = [...currentMessages];
        const lastMessage = newMessages[newMessages.length - 1];
        return [
            ...newMessages.slice(0, -1),
            {
                ...lastMessage,
                content,
            },
        ];
    }

    const processStream = async (stream: ReadableStream) => {
        const reader = stream.getReader()
        let content = "";

        while (true) {
            const { done, value } = await reader?.read() || {};
            if (done) break;
            const data = new TextDecoder().decode(value);
            const lines = data.split("\n");

            for (let line of lines) {
                if (line.trim() === "") continue;
                const event = JSON.parse(line) as StreamingEvent;

                // Server sent a chunk of the response
                if (event.type === "chunk") {
                    content += event.content;
                // Server closed the stream
                } else if (event.type === "done") {
                    content += event.content;
                // Server created a new thread for this chat
                } else if (event.type === "thread") {
                    const newThreadId = event.content;
                    setThreadId(newThreadId);
                    window.history.pushState({}, "", `/chat/${newThreadId}`);
                    await refetch();
                }

                setMessages(modifyLatestMessage(content));
            }
        }
    }

    const respondMessage = async (messages: Message[]) => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: messages,
                    thread: threadId,
                } as AddMessageInput),
            })

            if (!res.ok || !res.body) {
                throw new Error("Failed to fetch data");
            }

            setMessages((currentMessages) => [...currentMessages, { role: "assistant", content: "" }])
            await processStream(res.body);
        } catch (error) {
            toast.error("There was an error sending your message. Please try again later.");
            console.error(error);
        } finally {
            setLoading(false);
        }

    }

    const addMessage = async (message: Message) => {
        setMessages([...messages, message]);
        await respondMessage([...messages, message]);
    }

    return {
        messages,
        addMessage,
        streaming,
        setStreaming,
        inputValue,
        setInputValue,
        loading,
        setLoading,
        hasTyped,
        setHasTyped,
    };
}