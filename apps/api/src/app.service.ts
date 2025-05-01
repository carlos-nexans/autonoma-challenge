import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { Message, AddMessageInput } from "@repo/api"

@Injectable()
export class AppService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});
    }

    async addMessage(input: AddMessageInput): Promise<Message> {
        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: input.messages,
        });

        const assistantResponse = completion.choices[0]?.message?.content || '';

        return {
            role: 'assistant',
            content: assistantResponse,
        };
    }
}
