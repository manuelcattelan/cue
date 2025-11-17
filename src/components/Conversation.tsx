import { useConversation } from "../hooks/useConversation.js";
import { TextInput } from "../ui/input/TextInput.js";
import { HelpText } from "./HelpText.js";
import { MessageList } from "./MessageList.js";
import { Box } from "ink";

export const Conversation = () => {
  const { messages, handleSubmit, isLoadingAssistantMessage } =
    useConversation();

  return (
    <Box flexDirection="column" marginTop={1} marginBottom={1}>
      <MessageList
        messages={messages}
        isLoadingAssistantMessage={isLoadingAssistantMessage}
      />
      <TextInput onSubmit={handleSubmit} />
      <HelpText />
    </Box>
  );
};
