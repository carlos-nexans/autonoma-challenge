export type Role = "user" | "assistant"

export type Provider = 'openai' | 'anthropic'

export type Message = {
  role: Role;
  content: string;
  id?: string | null;
  provider?: Provider | null;
}

export type AddMessageInput = {
  thread?: string;
  messages: Message[];
  model?: SupportedModel;
}

export type StreamingEvent = {
  type: 'thread' | 'chunk' | 'done' | 'error';
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

export const anthropicModels = [
  {key: "claude-3-7-sonnet-20250219", displayName: "Claude 3.7 Sonnet", provider: 'anthropic', maxTokens: 64000},
  {key: "claude-3-5-sonnet-20241022", displayName: "Claude 3.5 Sonnet (New)", provider: 'anthropic', maxTokens: 8192},
  {key: "claude-3-5-haiku-20241022", displayName: "Claude 3.5 Haiku", provider: 'anthropic', maxTokens: 8192},
  {key: "claude-3-haiku-20240307", displayName: "Claude 3 Haiku", provider: 'anthropic', maxTokens: 4096},
  {key: "claude-3-opus-20240229", displayName: "Claude 3 Opus", provider: 'anthropic', maxTokens: 4096},
] as const;

export const openaiModels = [
  {key: 'gpt-4o', displayName: 'gpt-4o', provider: 'openai'},
  {key: 'gpt-4o-mini', displayName: 'gpt-4o-mini', provider: 'openai'},
  {key: 'gpt-4.1', displayName: 'gpt-4.1', provider: 'openai'},
]

export const supportedModels = [
  ...openaiModels,
  ...anthropicModels,
] as const;

export type SupportedModel = typeof supportedModels[number]['key'];