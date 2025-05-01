import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatService } from './chat.service';
import { AppController } from './app.controller';
import { ThreadService } from './thread.service';
import OpenAI from 'openai';
import { Message } from './entities/message.entity';
import { Thread } from './entities/thread.entity';

@Module({
  controllers: [AppController],
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Thread, Message]), // Add this line
  ],
  providers: [
    ChatService,
    ThreadService,
    {
      provide: OpenAI,
      useFactory: () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
    },
  ],
})
export class AppModule { }
