import { Injectable, NotFoundException } from '@nestjs/common';
import { Message, Thread, Threads } from '@repo/api';
import OpenAI from 'openai';

const generateTitlePrompt = `
You are an expert at creating concise, informative titles.

Task: Write a short title (maximum 6 words) that summarizes the conversation below.
Rules:
- Return only the title, nothing else.
- Do not include prefixes like "Title:" or "Summary:".
- Keep it direct and relevant.

Examples:
Conversation: A user is asking how to optimize a SQL query with multiple joins.
Output: Optimizing SQL Queries with Joins

Conversation: Discussion about using Next.js with Auth0 and handling token expiration issues.
Output: Handling Auth0 Expiration in Next.js

Conversation: A guide to deploying a Dockerized Node.js app on AWS EC2.
Output: Deploy Node.js App on AWS EC2

If the user is just starting a conversation or has not provided any context
then use a title that reflects the intention of the user.
`

const defaultTitle = 'New Conversation';

@Injectable()
export class ThreadService {
    private threads: Map<string, Thread> = new Map();

    constructor(private readonly openai: OpenAI) {}

    // Create a new thread
    async createThread({ messages = [] }: { messages: Message[] }): Promise<Thread> {
        const threadId = this.generateId();
        let title = await this.generateTitle(messages);

        const newThread: Thread = {
            id: threadId,
            messages,
            title,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.threads.set(threadId, newThread);
        return newThread;
    }

    async generateTitle(messages: Message[]): Promise<string> {
        if (messages.length === 0) {
            return defaultTitle;
        }
        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: generateTitlePrompt,
                    },
                    ...messages.map(msg => ({
                        role: msg.role as 'user' | 'assistant',
                        content: msg.content
                    }))
                ],
                max_tokens: 30,
                temperature: 0.7
            });

            return completion.choices[0]?.message?.content;
        } catch (error) {
            console.error('Error generating title:', error);
            return defaultTitle;
        }
    }

    // Add message to a thread
    async addMessage(threadId: string, message: Message): Promise<void> {
        const thread = this.threads.get(threadId);
        thread.messages.push(message);

        if (thread.title === defaultTitle) {
            thread.title = await this.generateTitle(thread.messages);
        }
    }

    // Get list of all threads
    getThreads(): Threads {
        return Array.from(this.threads.values()).map(thread => ({
            id: thread.id,
            title: thread.title,
            createdAt: thread.createdAt,
            updatedAt: thread.updatedAt,
        }));
    }

    // Get a specific thread
    getThread(threadId: string): Thread {
        const thread = this.threads.get(threadId);
        if (!thread) {
            throw new NotFoundException('Thread not found');
        }

        return thread;
    }

    archiveThread(threadId: string): void {
        this.threads.delete(threadId);
    }

    private generateId(): string {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
}
