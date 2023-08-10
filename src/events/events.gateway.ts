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
class MessageHistoryDto {
  // You can define properties you expect for this message here
}

class IdentityDto {
  data: number;
}

class JoinDto {
  roomId: string;
}

class MessageDto {
  id: string;
  author: string;
  created_at: Date;
  content: string;
  roomId?: string; // Optional because sometimes we broadcast to all
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

  @SubscribeMessage('messageHistory')
  findAll(@MessageBody() data: MessageHistoryDto): Observable<WsResponse<any>> {
    const messages = this.messagesService.findAll();

    return from(messages).pipe(
      map((item) => ({ event: 'messageHistory', data: item })),
    );
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() { data }: IdentityDto): Promise<number> {
    return data; // accessing data from DTO
  }

  @SubscribeMessage('join')
  async joinRoom(
    @MessageBody() data: JoinDto,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.join(data.roomId); // accessing roomId from DTO
  }

  @SubscribeMessage('message')
  async message(
    @MessageBody() message: MessageDto,
    @ConnectedSocket() socket: Socket,
  ) {
    this.messagesService.add(message); // Store message using service

    if (message.roomId) {
      // If it is on a DM or Group Chat channel
      socket.broadcast.to(message.roomId).emit('messages', message);
    } else {
      socket.broadcast.emit('messages', message);
    }

    return message;
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
    console.log(specificUserMessages);
    return specificUserMessages;
  }
}
