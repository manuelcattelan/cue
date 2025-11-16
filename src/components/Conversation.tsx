import { useConversation } from "../hooks/useConversation.js";
import { TextInput } from "../ui/input/TextInput.js";
import { MessageList } from "./MessageList.js";
import { Box } from "ink";

export const Conversation = () => {
  const { messages, handleSubmit } = useConversation();

  return (
    <Box flexDirection="column">
      <MessageList messages={messages} />
      <TextInput onSubmit={handleSubmit} />
    </Box>
  );
};
