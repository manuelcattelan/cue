import type { Message } from "../types/conversation.js";
import { MessageRole } from "../types/conversation.js";
import {
  GENERATED_PROMPT_START_TAG,
  GENERATED_PROMPT_END_TAG,
} from "./constants.js";

export const extractGeneratedPrompt = (messages: Message[]): string | null => {
  const lastAssistantMessage = [...messages]
    .reverse()
    .find((msg) => msg.role === MessageRole.Assistant);

  if (!lastAssistantMessage) {
    return null;
  }

  const content = lastAssistantMessage.content;
  const promptStartIndex = content.indexOf(GENERATED_PROMPT_START_TAG);
  const promptEndIndex = content.indexOf(GENERATED_PROMPT_END_TAG);

  if (
    promptStartIndex === -1 ||
    promptEndIndex === -1 ||
    promptEndIndex <= promptStartIndex
  ) {
    return null;
  }

  const prompt = content
    .substring(
      promptStartIndex + GENERATED_PROMPT_START_TAG.length,
      promptEndIndex,
    )
    .trim();

  return prompt.length > 0 ? prompt : null;
};
