import { useServices } from "../contexts/ServiceContext.js";
import { useSession } from "../contexts/SessionContext.js";
import { extractGeneratedPrompt } from "../lib/parsing.js";
import { MessageRole, type Message } from "../types/conversation.js";
import clipboard from "clipboardy";
import { useApp, useInput } from "ink";
import { useState } from "react";

export const useConversation = () => {
  const { messages, addMessage } = useSession();
  const { providerService } = useServices();
  const { exit } = useApp();

  const [isLoadingAssistantMessage, setIsLoadingAssistantMessage] =
    useState(false);

  const handleSubmit = async (content: string) => {
    const userMessage: Message = { role: MessageRole.User, content };
    addMessage(userMessage);

    // Build the updated messages array manually because React state updates are
    // asynchronous.
    // The `messages` variable won't reflect the new message until the next render,
    // so we need to construct the full conversation history for the provider
    // service.
    const messagesWithUserMessage = [...messages, userMessage];

    setIsLoadingAssistantMessage(true);
    try {
      const assistantMessage = await providerService.getAssistantMessage(
        messagesWithUserMessage,
      );
      addMessage({ role: MessageRole.Assistant, content: assistantMessage });
    } catch (error) {
      console.error("Failed to get assistant message: ", error);
    } finally {
      setIsLoadingAssistantMessage(false);
    }
  };

  useInput((input, key) => {
    if ((key.ctrl && input === "c") || key.escape) {
      exit();
    }

    if (key.ctrl && input === "y") {
      const generatedPrompt = extractGeneratedPrompt(messages);

      if (generatedPrompt) {
        clipboard.writeSync(generatedPrompt);
      }
    }
  });

  return {
    messages,
    handleSubmit,
    isLoadingAssistantMessage,
  };
};
