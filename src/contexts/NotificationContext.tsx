import { type Notification } from "../types/notification.js";
import { createContext, useContext, useState, type ReactNode } from "react";

type NotificationContextType = {
  notification: Notification | null;
  showNotification: (notification: Notification) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [notificationTimeoutId, setNotificationTimeoutId] =
    useState<NodeJS.Timeout | null>(null);

  const showNotification = (notification: Notification) => {
    if (notificationTimeoutId) {
      clearTimeout(notificationTimeoutId);
    }

    setNotification(notification);

    const newNotificationTimeoutId = setTimeout(() => {
      setNotification(null);
      setNotificationTimeoutId(null);
    }, 2000);

    setNotificationTimeoutId(newNotificationTimeoutId);
  };

  return (
    <NotificationContext.Provider value={{ notification, showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }

  return context;
};
