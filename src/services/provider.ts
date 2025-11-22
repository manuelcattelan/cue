import type { Config } from "../lib/config.js";
import { PROVIDER_MODEL, PROVIDER_MAX_TOKENS } from "../lib/constants.js";
import { SYSTEM_PROMPT } from "../lib/provider.js";
import { MessageRole, type Message } from "../types/conversation.js";
import Anthropic from "@anthropic-ai/sdk";

export type ProviderService = {
  getAssistantMessage: (
    messages: Message[],
    onStreamText: (streamText: string) => void,
    signal?: AbortSignal,
  ) => Promise<string>;
};

const toProviderMessages = (
  messages: Message[],
): Anthropic.Messages.MessageParam[] => {
  return messages.map((message) => {
    if (
      message.role === MessageRole.User &&
      message.contextFiles &&
      message.contextFiles.length > 0
    ) {
      const messageContentTextBlocks: Anthropic.Messages.TextBlockParam[] = [];
      for (const file of message.contextFiles) {
        if (file.content !== null) {
          messageContentTextBlocks.push({
            type: "text",
            text: `<file path="${file.path}">\n${file.content}\n</file>`,
          });
        }
      }
      messageContentTextBlocks.push({ type: "text", text: message.content });

      return {
        role: message.role,
        content: messageContentTextBlocks,
      };
    }

    return {
      role: message.role,
      content: message.content,
    };
  });
};

export const loadProviderService = (config: Config): ProviderService => {
  const client = new Anthropic({ apiKey: config.providerAPIKey });

  return {
    getAssistantMessage: async (
      messages: Message[],
      onStreamText: (streamText: string) => void,
      signal?: AbortSignal,
    ): Promise<string> => {
      const stream = client.messages
        .stream(
          {
            max_tokens: PROVIDER_MAX_TOKENS,
            messages: toProviderMessages(messages),
            system: SYSTEM_PROMPT,
            model: PROVIDER_MODEL,
          },
          { signal },
        )
        .on("text", onStreamText);

      const assistantMessage = await stream.finalMessage();

      const assistantMessageContentTextBlocks = assistantMessage.content.filter(
        (block): block is Anthropic.TextBlock => block.type === "text",
      );

      return assistantMessageContentTextBlocks
        .map((block) => block.text)
        .join("");
    },
  };
};
