import { useConversation } from "../hooks/useConversation.js";
import { TextInput } from "../ui/input/TextInput.js";

export const Conversation = () => {
  const { handleSubmit } = useConversation();

  return <TextInput onSubmit={handleSubmit} />;
};
