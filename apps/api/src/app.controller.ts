import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import type { Message, AddMessageInput } from "@repo/api"

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/health")
  getHealth(): string {
    return "ok"
  }

  @Post("/chat")
  async addMessage(@Body() payload: AddMessageInput): Promise<Message> {
    return this.appService.addMessage(payload)
  }
}
