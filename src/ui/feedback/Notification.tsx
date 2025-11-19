import { semanticColors } from "../../lib/colors.js";
import {
  NotificationType,
  type Notification as NotificationData,
} from "../../types/notification.js";
import chalk from "chalk";
import { Box, Text } from "ink";

export interface NotificationProps {
  notification: NotificationData;
}

const NOTIFICATION_ICONS = {
  [NotificationType.Success]: "✓",
  [NotificationType.Error]: "✗",
} as const;

export const Notification = ({ notification }: NotificationProps) => {
  const icon = NOTIFICATION_ICONS[notification.type];

  return (
    <Box marginLeft={2}>
      <Text>
        {chalk.hex(semanticColors.mutedAccent)(`${icon} `)}
        {chalk.hex(semanticColors.muted)(notification.message)}
      </Text>
    </Box>
  );
};
