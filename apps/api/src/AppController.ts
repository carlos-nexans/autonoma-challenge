import { Body, Controller, Delete, Get, InternalServerErrorException, Param, Post, Response } from '@nestjs/common';
import { ChatService } from './ChatService';
import { type Message, type AddMessageInput, type StreamingEvent, type Threads, type Thread, supportedModels } from "@repo/api"
import { ServerResponse } from 'http';
import { ThreadService } from './ThreadService';
import { AnthropicChatService } from './AnthropicChatService';
import { InternalServerError } from 'openai';

@Controller()
export class AppController {
  constructor(
    private readonly chatService: ChatService,
    private readonly threadService: ThreadService,
    private readonly anthropicChatService: AnthropicChatService,
  ) { }

  @Get("/health")
  getHealth(): string {
    return "ok"
  }

  @Post("/chat")
  async addMessage(@Body() payload: AddMessageInput, @Response() res: ServerResponse): Promise<void> {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    res.flushHeaders();

    const onEvent = (event: StreamingEvent) => {
      res.write(`${JSON.stringify(event)}\n\n`);
    }

    const model = payload.model || 'gpt-4o-mini';
    const modelData = supportedModels.find(m => m.key === model);
    if (!modelData) {
      onEvent({
        type: 'error',
        content: 'Model not supported',
      });
      res.end();
      return;
    }

    let service;
    if (modelData.provider === 'openai') {
      service = this.chatService;
    } else if (modelData.provider === 'anthropic') {
      service = this.anthropicChatService;
    } else {
      throw new InternalServerErrorException("Model provider not supported.");
    }

    await service.addMessage(payload, onEvent)
    res.end();
  }

  @Get("/threads")
  async getThreads(): Promise<Threads> {
    return this.threadService.getThreads()
  }

  @Get("/threads/:id")
  async getThread(@Param('id') id: string): Promise<Thread> {
    return this.threadService.getThread(id)
  }

  @Post("/threads")
  async createThread(): Promise<Thread> {
    return this.threadService.createThread({ messages: [] })
  }

  @Delete("/threads/:id")
  async deleteThread(@Param('id') id: string): Promise<void> {
    return this.threadService.archiveThread(id);
  }
}
