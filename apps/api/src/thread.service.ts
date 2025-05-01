import { Injectable, NotFoundException } from '@nestjs/common';
import { Message, Thread, Threads } from '@repo/api';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import { Thread as ThreadEntity } from './entities/thread.entity';
import { Message as MessageEntity } from './entities/message.entity';

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

export type AddMessageActions = 'changed_title' | 'added_message'

export type AddMessageToThreadOutput = {
    actions:  AddMessageActions[]
    thread: Thread;
}

@Injectable()
export class ThreadService {
    constructor(
        @InjectRepository(ThreadEntity)
        private threadRepository: Repository<ThreadEntity>,
        @InjectRepository(MessageEntity)
        private messageRepository: Repository<MessageEntity>,
        private readonly openai: OpenAI
    ) {}

    // Create a new thread
    async createThread({ messages = [] }: { messages: Message[] }): Promise<Thread> {
        const threadId = this.generateId();
        let title = await this.generateTitle(messages);

        const newThread = this.threadRepository.create({
            id: threadId,
            title,
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await this.threadRepository.save(newThread);

        // Save messages if any
        if (messages.length > 0) {
            const messageEntities = messages.map(msg => 
                this.messageRepository.create({
                    id: this.generateId(),
                    threadId: threadId,
                    role: msg.role,
                    content: msg.content,
                })
            );
            await this.messageRepository.save(messageEntities);
        }

        return this.getThread(threadId);
    }

    async generateTitle(messages: Message[]): Promise<string> {
        if (messages.length === 0) {
            return defaultTitle;
        }
        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
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
    async addMessage(threadId: string, message: Message): Promise<AddMessageToThreadOutput> {
        const thread = await this.threadRepository.findOne({ where: { id: threadId } });
        if (!thread) {
            throw new NotFoundException('Thread not found');
        }

        const messageEntity = this.messageRepository.create({
            id: this.generateId(),
            threadId: threadId,
            role: message.role,
            content: message.content,
        });

        await this.messageRepository.save(messageEntity);

        if (thread.title === defaultTitle) {
            const messages = await this.messageRepository.find({ where: { threadId } });
            thread.title = await this.generateTitle(messages);
            await this.threadRepository.save(thread);
            return {
                actions: ['added_message', 'changed_title'],
                thread,
            }
        }

        return {
            actions: ['added_message'],
            thread,
        }
    }

    // Get list of all threads
    async getThreads(): Promise<Threads> {
        const threads = await this.threadRepository.find();
        return threads.map(thread => ({
            id: thread.id,
            title: thread.title,
            createdAt: thread.createdAt,
            updatedAt: thread.updatedAt,
        }));
    }

    // Get a specific thread
    async getThread(threadId: string): Promise<Thread> {
        const thread = await this.threadRepository.findOne({
            where: { id: threadId },
            relations: ['messages']
        });
        
        if (!thread) {
            throw new NotFoundException('Thread not found');
        }

        return thread;
    }

    // TODO: add soft delete instead of hard delete!
    async archiveThread(threadId: string): Promise<void> {
        // First delete all associated messages
        await this.messageRepository.delete({ threadId });
        
        // Then delete the thread
        const result = await this.threadRepository.delete(threadId);
        if (result.affected === 0) {
            throw new NotFoundException('Thread not found');
        }
    }

    private generateId(): string {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
}
