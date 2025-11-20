export type ContextFile = {
  path: string;
  content: string | null;
};

export enum MessageRole {
  User = "user",
  Assistant = "assistant",
}

export type UserMessage = {
  role: MessageRole.User;
  content: string;
  contextFiles: ContextFile[];
};

export type AssistantMessage = {
  role: MessageRole.Assistant;
  content: string;
};

export type Message = UserMessage | AssistantMessage;

export type Question = {
  id: string;
  content: string;
};
