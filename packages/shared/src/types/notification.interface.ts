import { NotificationType } from '../enums/blood-type.enum';

export interface INotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  requestId?: string;
  createdAt: Date;
}
