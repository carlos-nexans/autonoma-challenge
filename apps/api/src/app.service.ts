import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { Message, AddMessageInput, StreamingEvent } from "@repo/api"

const systemPrompt = `
You are a helpful assistant. Respond to all questions and comments in a friendly and helpful manner.
Formant your responses in Markdown when necessary (code, quotes and headings).
`

@Injectable()
export class AppService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    async addMessage(input: AddMessageInput, onEvent: (event: StreamingEvent) => void): Promise<void> {
        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                ...input.messages
            ],
            stream: true,
        });

        for await (const part of completion) {
            // emit chunks to the streaming endpoint
            if (part.object === 'chat.completion.chunk' && part.choices[0].finish_reason === null) {
                onEvent({
                    type: 'chunk',
                    content: part.choices[0].delta.content || '',
                });
            // emit end chunk
            } else if (part.object === 'chat.completion.chunk' && part.choices[0].finish_reason === 'stop') {
                onEvent({
                    type: 'done',
                    content: part.choices[0].delta.content || '',
                });
            }
        }
    }
}
