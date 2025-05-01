import { Module } from '@nestjs/common';

import { ChatService } from './chat.service';
import { AppController } from './app.controller';
import { ThreadService } from './thread.service';
import OpenAI from 'openai';

@Module({
  controllers: [AppController],
  providers: [
    ChatService,
    ThreadService,
    {
      provide: OpenAI,
      useFactory: () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
    }
  ],
})
export class AppModule {}
