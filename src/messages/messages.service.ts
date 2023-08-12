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
  private messages: Map<string, Message> = new Map();

  constructor() {
    this.loadMessages();
  }

  private async loadMessages(): Promise<void> {
    const messagesFromDb = await prisma.messages.findMany();
    for (const message of messagesFromDb) {
      this.messages.set(message.id, message);
    }
  }

  findAll(): Message[] {
    return [...this.messages.values()];
  }

  findSpecificUserMessages(username: string): Message[] {
    return [...this.messages.values()].filter((msg) => msg.author == username);
  }

  async add(message: Message): Promise<void> {
    await prisma.messages.create({
      data: {
        id: message.id,
        created_at: message.created_at,
        content: message.content,
        author: message.author,
        room_id: message.room_id,
      },
    });

    this.messages.set(message.id, message);
  }

  async remove(message_id: string): Promise<Message> {
    // TODO: Test this
    const deletedMessage = this.messages.get(message_id);
    this.messages.delete(message_id);

    await prisma.messages.delete({
      where: {
        id: message_id,
      },
    });

    return deletedMessage;
  }

  async edit(
    message_id: string,
    new_message_content: string,
  ): Promise<Message> {
    // TODO: Test this
    const message = this.messages.get(message_id);
    if (message) {
      message.content = new_message_content;
      await prisma.messages.update({
        where: {
          id: message_id,
        },
        data: {
          content: new_message_content,
        },
      });
    }
    return message;
  }
}
