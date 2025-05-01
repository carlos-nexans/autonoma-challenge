import { toast } from "sonner"
import { useEffect, useState } from "react";
import type { Message, StreamingEvent } from "@repo/api";
import { useThreads } from "./useThreads";

export default function useChat() {
    const [messages, setMessages] = useState<Message[]>([]);
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
                if (event.type === "chunk") {
                    content += event.content;
                } else if (event.type === "done") {
                    content += event.content;
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
                }),
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