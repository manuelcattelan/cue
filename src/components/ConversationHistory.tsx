import { semanticColors } from "../lib/colors.js";
import {
  stripGeneratedPromptTags,
  stripFollowUpQuestions,
} from "../lib/parsing.js";
import { MessageRole, type Message } from "../types/conversation.js";
import { AssistantLoading } from "./AssistantLoading.js";
import { Box, Text } from "ink";

type MessageListProps = {
  messages: Message[];
  isLoadingAssistantMessage?: boolean;
};

export const ConversationHistory = ({
  messages,
  isLoadingAssistantMessage = false,
}: MessageListProps) => {
  if (messages.length === 0 && !isLoadingAssistantMessage) {
    return null;
  }

  const messageListMargin = 1;

  return (
    <Box flexDirection="column">
      {messages.map((message, index) => {
        let content = message.content;
        if (message.role === MessageRole.Assistant) {
          content = stripFollowUpQuestions(content);
          content = stripGeneratedPromptTags(content);
        }

        return (
          <Box key={index} marginBottom={messageListMargin}>
            <Text
              backgroundColor={
                message.role === MessageRole.User
                  ? semanticColors.mutedDimmed
                  : ""
              }
            >
              {message.role === MessageRole.User && "> "}
              {content}
              {message.role === MessageRole.User && " "}
            </Text>
          </Box>
        );
      })}
      {isLoadingAssistantMessage && (
        <Box marginBottom={messageListMargin}>
          <AssistantLoading type="balloon" />
        </Box>
      )}
    </Box>
  );
};
