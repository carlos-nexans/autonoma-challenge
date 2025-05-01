import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { Message, AddMessageInput } from "@repo/api"

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

    async addMessage(input: AddMessageInput): Promise<Message> {
        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                ...input.messages
            ],
        });

        const assistantResponse = completion.choices[0]?.message?.content || '';

        return {
            role: 'assistant',
            content: assistantResponse,
        };
    }
}
