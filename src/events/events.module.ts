import { Module } from '@nestjs/common';
import { MessagesService } from 'src/messages/messages.service';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway, MessagesService],
})
export class EventsModule {}
