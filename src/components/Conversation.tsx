import { useConversation } from "../hooks/useConversation.js";
import { extractGeneratedFollowUpQuestions } from "../lib/parsing.js";
import { MessageRole } from "../types/conversation.js";
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

  const { messages, handleInputSubmit, isLoadingAssistantMessage } =
    useConversation();

  const [currentInput, setCurrentInput] = useState("");
  const [currentCursorPosition, setCurrentCursorPosition] = useState(0);
  const [questionsQuit, setQuestionsQuit] = useState(false);

  const questions = extractGeneratedFollowUpQuestions(messages);

  useEffect(() => {
    setQuestionsQuit(false);
  }, [messages.length]);

  useInput((_, key) => {
    if (key.escape && (questions.length === 0 || questionsQuit)) {
      exit();
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

  const showQuestions =
    !questionsQuit &&
    questions.length > 0 &&
    messages.length > 0 &&
    messages[messages.length - 1]?.role === MessageRole.Assistant;

  return (
    <Box flexDirection="column" marginTop={1} marginBottom={1}>
      <ConversationHistory
        messages={messages}
        isLoadingAssistantMessage={isLoadingAssistantMessage}
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
      <KeyboardShortcuts
        view={
          showQuestions
            ? KeyboardShortcutsView.Questions
            : KeyboardShortcutsView.Input
        }
      />
    </Box>
  );
};
