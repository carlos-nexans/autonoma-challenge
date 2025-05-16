// @ts-nocheck
import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { AddMessageInput, anthropicModels, StreamingEvent } from "@repo/api";
import { ThreadService } from './ThreadService';

const systemPrompt = `
You are a helpful assistant. Respond to all questions and comments in a friendly and helpful manner.
Formant your responses in Markdown when necessary (code, quotes and headings).
The message itself will be rendered as Markdown.
Keep your responses clear, consistent, and properly formatted in Markdown.

For mathematics, use KaTeX with the following syntax:
* You can enclose inline mathematics in $...$
* You can enclose block level mathematics in $$...$$
* You can also enclose block level mathematics with <pre><code class="language-math">...</code></pre>

For code blocks:
- Use triple backticks (\`\`\`) with the language specification
- Example for Python: \`\`\`python
- Never use <pre><code> tags for code blocks
- Use single backticks for inline code

If your response contains a markdown code snippet:
* Do not use triple backticks to enclose code blocks.
* Use <pre><code>...</code></pre> to enclose code blocks.
* This will avoid any issue with the markdown parser.
`

const defaultModel = 'claude-3-5-haiku-latest';

@Injectable()
export class AnthropicChatService {
    constructor(private readonly anthropic: Anthropic, private readonly threadService: ThreadService) {}

    async* addMessage(input: AddMessageInput): AsyncGenerator<StreamingEvent> {
        let threadId = input.thread;

        // Create new thread if none is provided
        if (!threadId) {
            const thread = await this.threadService.createThread({ messages: input.messages });
            threadId = thread.id;

            yield {
                type: 'thread',
                content: threadId,
            }
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
            yield {
                type: 'error',
                content: 'Model not supported',
            }
            return;
        }

        const stream = await this.anthropic.messages.create({
            model: input.model || defaultModel,
            messages: messages,
            system: systemPrompt,
            stream: true,
            // TODO: make configurable
            max_tokens: modelData.maxTokens,
            tools: [{ type: 'web_search' }],
        });

        let id = undefined;
        let buffer = "";
        
        for await (const part of stream) {
            if (part.type === 'message_start') {
                id = part.message.id;
            } else if (part.type === 'content_block_delta') {
                const content = part.delta.text || '';
                buffer += content;
                yield {
                    type: 'chunk',
                    content,
                }
            } else if (part.type === 'message_stop') {
                yield {
                    type: 'done',
                    content: '',
                }
            }
        }

        const result = await this.threadService.addMessage(threadId, {
            role: 'assistant',
            content: buffer,
            id,
            provider: 'anthropic',
        });

        if (result.actions.includes('changed_title')) {
            yield {
                type: 'thread',
                content: threadId,
            }
        }
    }
}