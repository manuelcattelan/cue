import { useNotification } from "../contexts/NotificationContext.js";
import { useConversation } from "../hooks/useConversation.js";
import { extractGeneratedFollowUpQuestions } from "../lib/parsing.js";
import { MessageRole } from "../types/conversation.js";
import { Notification } from "../ui/feedback/Notification.js";
import { ConversationHistory } from "./ConversationHistory.js";
import { ConversationInput } from "./ConversationInput.js";
import { ConversationQuestions } from "./ConversationQuestions.js";
import {
  KeyboardShortcuts,
  KeyboardShortcutsView,
} from "./KeyboardShortcuts.js";
import { Box, useApp, useInput } from "ink";
import { useState, useEffect } from "react";

export const Conversation = () => {
  const { exit } = useApp();
  const { notification } = useNotification();

  const {
    messages,
    handleInputSubmit,
    isLoadingAssistantMessage,
    streamMessage,
    cancelAssistantMessage,
  } = useConversation();

  const [currentInput, setCurrentInput] = useState("");
  const [currentCursorPosition, setCurrentCursorPosition] = useState(0);
  const [questionsQuit, setQuestionsQuit] = useState(false);
  const [escPressCount, setEscPressCount] = useState(0);

  const questions = extractGeneratedFollowUpQuestions(messages);

  const showQuestions =
    !questionsQuit &&
    questions.length > 0 &&
    messages.length > 0 &&
    messages[messages.length - 1]?.role === MessageRole.Assistant;

  useEffect(() => {
    setQuestionsQuit(false);
  }, [messages.length]);

  useEffect(() => {
    setEscPressCount(0);
  }, [isLoadingAssistantMessage]);

  useInput((_, key) => {
    if (key.escape) {
      if (isLoadingAssistantMessage) {
        if (escPressCount === 0) {
          cancelAssistantMessage();
          setEscPressCount(1);
        } else {
          exit();
        }
      } else if (!showQuestions) {
        exit();
      }
    }
  });

  const handleInputChange = (newInput: string, newCursorPosition: number) => {
    setCurrentInput(newInput);
    setCurrentCursorPosition(newCursorPosition);
  };

  const handleQuestionsSubmit = (formattedAnswers: string) => {
    setCurrentInput(formattedAnswers);
    setCurrentCursorPosition(formattedAnswers.length);
  };

  const handleQuestionsQuit = () => {
    setQuestionsQuit(true);
  };

  return (
    <Box flexDirection="column" marginTop={1} marginBottom={1}>
      <ConversationHistory
        messages={messages}
        isLoadingAssistantMessage={isLoadingAssistantMessage}
        streamMessage={streamMessage}
      />
      {showQuestions ? (
        <ConversationQuestions
          questions={questions}
          onQuestionsSubmit={handleQuestionsSubmit}
          onQuestionsQuit={handleQuestionsQuit}
        />
      ) : (
        <ConversationInput
          currentInput={currentInput}
          currentCursorPosition={currentCursorPosition}
          onInputChange={handleInputChange}
          onInputSubmit={handleInputSubmit}
        />
      )}
      {notification ? (
        <Notification notification={notification} />
      ) : (
        <KeyboardShortcuts
          view={
            showQuestions
              ? KeyboardShortcutsView.Questions
              : KeyboardShortcutsView.Input
          }
        />
      )}
    </Box>
  );
};
