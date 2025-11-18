import { useConversation } from "../hooks/useConversation.js";
import { TextInput } from "../ui/input/TextInput.js";
import { ConversationHistory } from "./ConversationHistory.js";
import { KeyboardShortcuts } from "./KeyboardShortcuts.js";
import { Box } from "ink";

export const Conversation = () => {
  const { messages, handleSubmit, isLoadingAssistantMessage } =
    useConversation();

  return (
    <Box flexDirection="column" marginTop={1} marginBottom={1}>
      <ConversationHistory
        messages={messages}
        isLoadingAssistantMessage={isLoadingAssistantMessage}
      />
      <TextInput onSubmit={handleSubmit} />
      <KeyboardShortcuts />
    </Box>
  );
};
