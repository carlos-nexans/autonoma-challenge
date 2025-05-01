type Role = "user" | "assistant"

export type Message = {
  role: Role;
  content: string;
}

export type AddMessageInput = {
  thread?: string;
  messages: Message[];
}

export type StreamingEvent = {
  type: 'thread' | 'chunk' | 'done';
  content: string;
}

export type Thread = {
  id: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

export type Threads = Pick<Thread, 'id' | 'title' | 'createdAt' | 'updatedAt'>[];