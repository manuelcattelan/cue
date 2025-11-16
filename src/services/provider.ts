import type { Config } from "../lib/config.js";
import { PROVIDER_MODEL, PROVIDER_MAX_TOKENS } from "../lib/constants.js";
import type { Message } from "../types/conversation.js";
import Anthropic from "@anthropic-ai/sdk";

export type ProviderService = {
  getAssistantMessage: (messages: Message[]) => Promise<string>;
};

const toProviderMessages = (
  messages: Message[],
): Anthropic.Messages.MessageParam[] => {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));
};

export const loadProviderService = (config: Config): ProviderService => {
  const client = new Anthropic({ apiKey: config.apiKey });

  return {
    getAssistantMessage: async (messages: Message[]): Promise<string> => {
      const assistantMessage = await client.messages.create({
        max_tokens: PROVIDER_MAX_TOKENS,
        messages: toProviderMessages(messages),
        model: PROVIDER_MODEL,
      });

      const assistantMessageTextBlocks = assistantMessage.content.filter(
        (block): block is Anthropic.TextBlock => block.type === "text",
      );

      return assistantMessageTextBlocks.map((block) => block.text).join("");
    },
  };
};
