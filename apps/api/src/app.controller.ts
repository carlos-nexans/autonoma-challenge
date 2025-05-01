import { Body, Controller, Get, Param, Post, Response } from '@nestjs/common';
import { ChatService } from './chat.service';
import type { Message, AddMessageInput, StreamingEvent, Threads, Thread } from "@repo/api"
import { ServerResponse } from 'http';
import { ThreadService } from './thread.service';

@Controller()
export class AppController {
  constructor(private readonly chatService: ChatService, private readonly threadService: ThreadService) {}

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

    await this.chatService.addMessage(payload, onEvent)
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
}
