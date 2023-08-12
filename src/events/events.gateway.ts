import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
import { Message, MessagesService } from 'src/messages/messages.service';

// DTOs
class getMessageHistoryDto {
  // TODO: Implement this
  // from: Date;
  // until: Date;
}

class JoinRoomDto {
  room_id: string;
}

class MessageDto {
  id: string;
  author: string;
  created_at: Date;
  content: string;
  room_id?: string; // Optional because sometimes we broadcast to all
}

class FindSpecificUserMessagesDto {
  author: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  constructor(private readonly messagesService: MessagesService) {} // Inject the service

  @WebSocketServer()
  server: Server;

  messages: string[] = [];

  @SubscribeMessage('getMessageHistory')
  findAll(): Observable<WsResponse<any>> {
    const messages = this.messagesService.findAll();

    return from(messages).pipe(
      map((item) => ({ event: 'getMessageHistory', data: item })),
    );
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.join(data.room_id); // accessing room_id from DTO
  }

  @SubscribeMessage('message')
  async message(
    @MessageBody() message: MessageDto,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      await this.messagesService.add(message); // Store message using service

      if (message.room_id) {
        // User is in DM or a GROUP CHAT CHANNEL
        socket.broadcast.to(message.room_id).emit('newMessage', message);
      } else {
        // User is in GENERAL CHAT
        socket.broadcast.emit('newMessage', message);
      }

      return { status: 'success', timestamp: new Date() };
    } catch (error) {
      console.error('Failed to process message:', error);
      return { status: 'error', message: 'Failed to process message' };
    }
  }

  // TODO: Change to getMessagesByAuthor
  @SubscribeMessage('findSpecificUserMessages')
  async findSpecificUserMessages(
    @MessageBody() data: FindSpecificUserMessagesDto,
    @ConnectedSocket() socket: Socket,
  ): Promise<Message[]> {
    const specificUserMessages = this.messagesService.findSpecificUserMessages(
      data.author,
    );
    socket.emit('foundSpecificUserMessages', specificUserMessages);
    return specificUserMessages;
  }
}
