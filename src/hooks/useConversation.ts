import { useSession } from "../contexts/SessionContext.js";

export const useConversation = () => {
  const { messages, addMessage } = useSession();

  const handleSubmit = (text: string) => {
    addMessage(text);
  };

  return {
    messages,
    handleSubmit,
  };
};
