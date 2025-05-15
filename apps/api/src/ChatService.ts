import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { AddMessageInput, StreamingEvent } from "@repo/api";
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

const defaultModel = 'gpt-4o-mini';

@Injectable()
export class ChatService {

    constructor(private readonly openai: OpenAI, private readonly threadService: ThreadService) {}

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

        const completion = await this.openai.chat.completions.create({
            model: input.model || defaultModel,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                ...input.messages
            ],
            stream: true,
        });

        let id = undefined;
        let buffer = "";
        for await (const part of completion) {
            if (part.id) {
                id = part.id;
            }
            // emit chunks to the streaming endpoint
            if (part.object === 'chat.completion.chunk' && part.choices[0].finish_reason === null) {
                const content = part.choices[0].delta.content || '';
                buffer += content;
                onEvent({
                    type: 'chunk',
                    content,
                });
                // emit end chunk
            } else if (part.object === 'chat.completion.chunk' && part.choices[0].finish_reason === 'stop') {
                const content = part.choices[0].delta.content || '';
                buffer += content;
                onEvent({
                    type: 'done',
                    content,
                });
            }
        }

        const result = await this.threadService.addMessage(threadId, {
            role: 'assistant',
            content: buffer,
            id,
            provider: 'openai',
        });

        if (result.actions.includes('changed_title')) {
            onEvent({
                type: 'thread',
                content: threadId,
            });
        }
    }
}
