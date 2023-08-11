import { Injectable } from '@nestjs/common';
import prisma from 'src/db/dbClient';

export interface Message {
  id: string;
  author: string;
  created_at: Date;
  content: string;
  room_id?: string;
}

@Injectable()
export class MessagesService {
  private messages: Message[] = [];

  constructor() {
    this.loadMessages();
  }

  private async loadMessages(): Promise<void> {
    this.messages = await prisma.messages.findMany();
  }

  findAll(): Message[] {
    return this.messages;
  }

  findSpecificUserMessages(username: string): Message[] {
    return this.messages.filter((msg) => msg.author == username);
  }

  async add(message: Message): Promise<void> {
    this.messages.push(message);
    await prisma.messages.create({
      data: {
        id: message.id,
        created_at: message.created_at,
        content: message.content,
        author: message.author,
        room_id: message.room_id,
      },
    });
  }
}
