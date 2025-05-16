import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { AddMessageInput, StreamingEvent } from '@repo/api';
import { ThreadService } from './ThreadService';
import { systemPrompt } from './constants';

const defaultModel = 'gpt-4o-mini';

@Injectable()
export class ChatService {
  constructor(
    private readonly openai: OpenAI,
    private readonly threadService: ThreadService,
  ) {}

  async *addMessage(input: AddMessageInput): AsyncGenerator<StreamingEvent> {
    let threadId = input.thread;

    // Create new thread if none is provided
    if (!threadId) {
      const thread = await this.threadService.createThread({
        messages: input.messages,
      });
      threadId = thread.id;

      yield {
        type: 'thread',
        content: threadId,
      };
    } else {
      const latestMessage = input.messages[input.messages.length - 1];
      await this.threadService.addMessage(threadId, latestMessage);
    }

    const completion = await this.openai.responses.create({
      model: input.model || defaultModel,
      tools: [{ type: 'web_search_preview' }],
      input: input.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
      instructions: systemPrompt,
    });

    let id = undefined;
    let buffer = '';
    for await (const part of completion) {
      if (part.type === 'response.output_text.delta') {
        const content = part.delta || '';
        yield {
          type: 'chunk',
          content,
        };
      } else if (part.type === 'response.output_text.done') {
        id = part.item_id;
        buffer = part.text;
        yield {
          type: 'done',
          content: '',
        };
      } else if (part.type === 'response.completed') {
        id = part.response.id;
      }

      // TODO: implement web browsing item in the chat
      // "response.web_search_call.in_progress",
      // "response.web_search_call.searching",
      // "response.web_search_call.completed",
      // "response.output_item.done",
    }

    const result = await this.threadService.addMessage(threadId, {
      role: 'assistant',
      content: buffer,
      id,
      provider: 'openai',
    });

    if (result.actions.includes('changed_title')) {
      yield {
        type: 'thread',
        content: threadId,
      };
    }
  }
}
