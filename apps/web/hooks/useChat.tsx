import { toast } from "sonner"
import { useState } from "react";
import type { Message } from "@repo/api";

export default function useChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [streaming, setStreaming] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [hasTyped, setHasTyped] = useState(false);

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
    
            const newMessage = await res.json();
            setMessages([...messages, newMessage]);
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