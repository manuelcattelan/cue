import type { Message } from "../types/conversation.js";
import { createContext, useContext, useState, type ReactNode } from "react";

type SessionContextType = {
  messages: Message[];
  addMessage: (message: Message) => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  return (
    <SessionContext.Provider value={{ messages, addMessage }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return context;
};
