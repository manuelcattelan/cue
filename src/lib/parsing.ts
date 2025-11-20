import type { Message, Question } from "../types/conversation.js";
import { MessageRole } from "../types/conversation.js";
import {
  GENERATED_PROMPT_START_TAG,
  GENERATED_PROMPT_END_TAG,
  GENERATED_FOLLOW_UP_QUESTIONS_START_TAG,
  GENERATED_FOLLOW_UP_QUESTIONS_END_TAG,
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

export const extractGeneratedFollowUpQuestions = (
  messages: Message[],
): Question[] => {
  const lastAssistantMessage = [...messages]
    .reverse()
    .find((msg) => msg.role === MessageRole.Assistant);

  if (!lastAssistantMessage) {
    return [];
  }

  const content = lastAssistantMessage.content;
  const questionsStartIndex = content.indexOf(
    GENERATED_FOLLOW_UP_QUESTIONS_START_TAG,
  );
  const questionsEndIndex = content.indexOf(
    GENERATED_FOLLOW_UP_QUESTIONS_END_TAG,
  );

  if (
    questionsStartIndex === -1 ||
    questionsEndIndex === -1 ||
    questionsEndIndex <= questionsStartIndex
  ) {
    return [];
  }

  const questionsXmlContent = content.substring(
    questionsStartIndex + GENERATED_FOLLOW_UP_QUESTIONS_START_TAG.length,
    questionsEndIndex,
  );

  const questions: Question[] = [];
  const questionRegex =
    /<question\s+question-id="([^"]+)"[^>]*>([\s\S]*?)<\/question>/g;

  let match;
  while ((match = questionRegex.exec(questionsXmlContent)) !== null) {
    const questionId = match[1];
    const questionContent = match[2];

    if (questionId && questionContent) {
      questions.push({
        id: questionId,
        content: questionContent.trim(),
      });
    }
  }

  return questions;
};

export const stripGeneratedPromptTags = (content: string): string => {
  return content
    .replace(GENERATED_PROMPT_START_TAG, "")
    .replace(GENERATED_PROMPT_END_TAG, "")
    .trim();
};

export const stripFollowUpQuestions = (content: string): string => {
  const questionsStartIndex = content.indexOf(
    GENERATED_FOLLOW_UP_QUESTIONS_START_TAG,
  );
  const questionsEndIndex = content.indexOf(
    GENERATED_FOLLOW_UP_QUESTIONS_END_TAG,
  );

  if (
    questionsStartIndex === -1 ||
    questionsEndIndex === -1 ||
    questionsEndIndex <= questionsStartIndex
  ) {
    return content;
  }

  return (
    content.substring(0, questionsStartIndex) +
    content.substring(
      questionsEndIndex + GENERATED_FOLLOW_UP_QUESTIONS_END_TAG.length,
    )
  ).trim();
};
