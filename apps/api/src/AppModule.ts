import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatService } from './ChatService';
import { AppController } from './AppController';
import { ThreadService } from './ThreadService';
import OpenAI from 'openai';
import { Message } from './entities/MessageEntity';
import { Thread } from './entities/ThreadEntity';
import { AnthropicChatService } from './AnthropicChatService';
import Anthropic from '@anthropic-ai/sdk';

@Module({
  controllers: [AppController],
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_URL,
      entities: [__dirname + '/**/entities/*Entity{.ts,.js}'],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Thread, Message]), // Add this line
  ],
  providers: [
    ChatService,
    AnthropicChatService,
    ThreadService,
    {
      provide: OpenAI,
      useFactory: () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
    },
    {
      provide: Anthropic,
      useFactory: () => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
    }
  ],
})
export class AppModule { }
