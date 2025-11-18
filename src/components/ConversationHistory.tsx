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
      {messages.map((message, index) => (
        <Box key={index} marginBottom={messageListMargin}>
          <Text
            backgroundColor={message.role === MessageRole.User ? "gray" : ""}
          >
            {message.role === MessageRole.User && "> "}
            {message.content}
            {message.role === MessageRole.User && " "}
          </Text>
        </Box>
      ))}
      {isLoadingAssistantMessage && (
        <Box marginBottom={messageListMargin}>
          <AssistantLoading type="balloon" />
        </Box>
      )}
    </Box>
  );
};
