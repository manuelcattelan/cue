import { useConversation } from "../hooks/useConversation.js";
import { ConversationHistory } from "./ConversationHistory.js";
import { ConversationInput } from "./ConversationInput.js";
import { Box } from "ink";

export const Conversation = () => {
  const { messages, handleInputSubmit, isLoadingAssistantMessage } =
    useConversation();

  return (
    <Box flexDirection="column" marginTop={1} marginBottom={1}>
      <ConversationHistory
        messages={messages}
        isLoadingAssistantMessage={isLoadingAssistantMessage}
      />
      <ConversationInput handleInputSubmit={handleInputSubmit} />
    </Box>
  );
};
