import { useServices } from "../contexts/ServiceContext.js";
import { useSession } from "../contexts/SessionContext.js";
import { MessageRole, type Message } from "../types/conversation.js";

export const useConversation = () => {
  const { messages, addMessage } = useSession();
  const { providerService } = useServices();

  const handleSubmit = async (content: string) => {
    const userMessage: Message = { role: MessageRole.User, content };
    addMessage(userMessage);

    // Build the updated messages array manually because React state updates are
    // asynchronous.
    // The `messages` variable won't reflect the new message until the next render,
    // so we need to construct the full conversation history for the provider
    // service.
    const messagesWithUserMessage = [...messages, userMessage];

    try {
      const assistantMessage = await providerService.getAssistantMessage(
        messagesWithUserMessage,
      );
      addMessage({ role: MessageRole.Assistant, content: assistantMessage });
    } catch (error) {
      console.error("Failed to get assistant message: ", error);
    }
  };

  return {
    messages,
    handleSubmit,
  };
};
