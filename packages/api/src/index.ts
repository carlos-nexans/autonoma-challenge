type Role = "user" | "assistant"

export type Message = {
  role: Role;
  content: string;
}

export type AddMessageInput = {
  messages: Message[];
}