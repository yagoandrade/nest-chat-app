import { Injectable } from '@nestjs/common';

export interface Message {
  id: string;
  author: string;
  created_at: Date;
  content: string;
  roomId?: string;
}

@Injectable()
export class MessagesService {
  private readonly messages: Message[] = [];

  findAll(): Message[] {
    return this.messages;
  }

  findSpecificUserMessages(username: string): Message[] {
    return this.messages.filter((msg) => msg.author == username);
  }

  add(message: Message): void {
    this.messages.push(message);
  }
}
