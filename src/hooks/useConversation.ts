import { useNotification } from "../contexts/NotificationContext.js";
import { useServices } from "../contexts/ServiceContext.js";
import { useSession } from "../contexts/SessionContext.js";
import {
  getContextFilesPaths,
  getDirectoryFiles,
  readContextFileContent,
} from "../lib/context.js";
import { extractGeneratedPrompt } from "../lib/parsing.js";
import {
  MessageRole,
  type ContextFile,
  type Message,
} from "../types/conversation.js";
import { NotificationType } from "../types/notification.js";
import clipboard from "clipboardy";
import fs from "fs";
import { useInput } from "ink";
import path from "path";
import { useState, useRef, useEffect } from "react";

export const useConversation = () => {
  const { messages, addMessage } = useSession();
  const { providerService } = useServices();
  const { showNotification } = useNotification();

  const [isLoadingAssistantMessage, setIsLoadingAssistantMessage] =
    useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelAssistantMessage = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cancelAssistantMessage();
    };
  }, []);

  const handleInputSubmit = async (content: string) => {
    const contextFilesPaths = getContextFilesPaths(content);
    const contextFilesWithContent: ContextFile[] = [];

    for (const contextFilePath of contextFilesPaths) {
      try {
        if (fs.statSync(contextFilePath).isDirectory()) {
          const directoryFiles = getDirectoryFiles(contextFilePath);
          for (const directoryFile of directoryFiles) {
            const fullDirectoryFilePath = path.join(
              contextFilePath,
              directoryFile,
            );
            contextFilesWithContent.push({
              path: fullDirectoryFilePath,
              content: readContextFileContent(fullDirectoryFilePath),
            });
          }
        } else {
          contextFilesWithContent.push({
            path: contextFilePath,
            content: readContextFileContent(contextFilePath),
          });
        }
      } catch {
        contextFilesWithContent.push({
          path: contextFilePath,
          content: null,
        });
      }
    }

    const userMessage: Message = {
      role: MessageRole.User,
      content,
      contextFiles: contextFilesWithContent,
    };
    addMessage(userMessage);

    // Build the updated messages array manually because React state updates are
    // asynchronous.
    // The `messages` variable won't reflect the new message until the next render,
    // so we need to construct the full conversation history for the provider
    // service.
    const messagesWithUserMessage = [...messages, userMessage];

    setIsLoadingAssistantMessage(true);
    abortControllerRef.current = new AbortController();
    try {
      const assistantMessage = await providerService.getAssistantMessage(
        messagesWithUserMessage,
        abortControllerRef.current.signal,
      );
      addMessage({ role: MessageRole.Assistant, content: assistantMessage });
    } catch (error) {
      // Only show error if it wasn't an abort
      if (error instanceof Error && error.name !== "AbortError") {
        /* tslint:disable:no-empty */
      }
    } finally {
      setIsLoadingAssistantMessage(false);
      abortControllerRef.current = null;
    }
  };

  useInput((input, key) => {
    if (key.ctrl && input === "y") {
      const generatedPrompt = extractGeneratedPrompt(messages);

      if (generatedPrompt) {
        clipboard.writeSync(generatedPrompt);

        showNotification({
          message: "Prompt copied to clipboard!",
          type: NotificationType.Success,
        });
      } else {
        showNotification({
          message: "Failed to copy prompt to clipboard.",
          type: NotificationType.Error,
        });
      }
    }
  });

  return {
    messages,
    handleInputSubmit,
    isLoadingAssistantMessage,
    cancelAssistantMessage,
  };
};
