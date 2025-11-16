export enum MessageRole {
  User = "user",
  Assistant = "assistant",
}

export type Message = {
  role: MessageRole;
  content: string;
};
