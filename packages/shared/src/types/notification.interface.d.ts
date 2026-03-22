import { NotificationType } from '../enums/blood-type.enum';
export interface INotification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    read: boolean;
    data?: {
        requestId?: string;
    };
    createdAt: Date;
}
