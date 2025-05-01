import { Body, Controller, Get, Post, Response } from '@nestjs/common';
import { AppService } from './app.service';
import type { Message, AddMessageInput, StreamingEvent } from "@repo/api"
import { ServerResponse } from 'http';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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

    await this.appService.addMessage(payload, onEvent)
    res.end();
  }
}
