import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { AppController } from './app.controller';
import { AppService } from './chat.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('healthiness endpoint', () => {
    it('ok', () => {
      expect(appController.getHealth()).toBe('ok');
    });
  });
});
