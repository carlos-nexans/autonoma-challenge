// @ts-nocheck
import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { AddMessageInput, anthropicModels, StreamingEvent } from "@repo/api";
import { ThreadService } from './ThreadService';

const systemPrompt = `
You are a helpful assistant. Respond to all questions and comments in a friendly and helpful manner.
Formant your responses in Markdown when necessary (code, quotes and headings).
`

const defaultModel = 'claude-3-opus-20240229';

@Injectable()
export class AnthropicChatService {
    constructor(private readonly anthropic: Anthropic, private readonly threadService: ThreadService) {}

    async addMessage(input: AddMessageInput, onEvent: (event: StreamingEvent) => void): Promise<void> {
        let threadId = input.thread;

        // Create new thread if none is provided
        if (!threadId) {
            const thread = await this.threadService.createThread({ messages: input.messages });
            threadId = thread.id;

            onEvent({
                type: 'thread',
                content: threadId,
            });
        } else {
            const latestMessage = input.messages[input.messages.length - 1];
            await this.threadService.addMessage(threadId, latestMessage);
        }

        const messages = input.messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        const modelData = anthropicModels.find(m => m.key === input.model);
        if (!modelData) {
            onEvent({
                type: 'error',
                content: 'Model not supported',
            });
            return;
        }

        const stream = await this.anthropic.messages.create({
            model: input.model || defaultModel,
            messages: messages,
            system: systemPrompt,
            stream: true,
            // TODO: make configurable
            max_tokens: modelData.maxTokens,
        });

        let id = undefined;
        let buffer = "";
        
        for await (const part of stream) {
            if (part.type === 'message_start') {
                id = part.message.id;
            } else if (part.type === 'content_block_delta') {
                const content = part.delta.text || '';
                buffer += content;
                onEvent({
                    type: 'chunk',
                    content,
                });
            } else if (part.type === 'message_stop') {
                onEvent({
                    type: 'done',
                    content: '',
                });
            }
        }

        const result = await this.threadService.addMessage(threadId, {
            role: 'assistant',
            content: buffer,
            id,
            provider: 'anthropic',
        });

        if (result.actions.includes('changed_title')) {
            onEvent({
                type: 'thread',
                content: threadId,
            });
        }
    }
}