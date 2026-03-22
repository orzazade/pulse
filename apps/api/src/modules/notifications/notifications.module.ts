import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationProcessor } from './processors/notification.processor';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { Request } from '../requests/entities/request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User, Request]),
    BullModule.registerQueue({ name: 'notifications' }),
    ScheduleModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
