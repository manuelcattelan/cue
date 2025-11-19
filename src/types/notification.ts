export enum NotificationType {
  Success = "success",
  Error = "error",
}

export type Notification = {
  message: string;
  type: NotificationType;
};
