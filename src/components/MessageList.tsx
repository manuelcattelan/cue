import type { Message } from "../types/conversation.js";
import { Spinner } from "../ui/layout/Spinner.js";
import { Box, Text } from "ink";

type MessageListProps = {
  messages: Message[];
  isLoadingAssistantMessage?: boolean;
};

export const MessageList = ({
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
          <Text>{message.content}</Text>
        </Box>
      ))}
      {isLoadingAssistantMessage && (
        <Box marginBottom={messageListMargin}>
          <Spinner type="line">Cueing up...</Spinner>
        </Box>
      )}
    </Box>
  );
};
