import type { Message } from "../types/conversation.js";
import { Box, Text } from "ink";

type MessageListProps = {
  messages: Message[];
};

export const MessageList = ({ messages }: MessageListProps) => {
  if (messages.length === 0) {
    return null;
  }

  return (
    <Box flexDirection="column">
      {messages.map((message, index) => (
        <Box key={index} marginBottom={1}>
          <Text>{message.content}</Text>
        </Box>
      ))}
    </Box>
  );
};
