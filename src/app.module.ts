import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { EventsModule } from './events/events.module';
import { MessagesService } from './messages/messages.service';

@Module({
  imports: [
    EventsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'), // <-- path to the static files
    }),
  ],
  providers: [MessagesService],
  /* controllers: [AppController],
  providers: [AppService], */
})
export class AppModule {}
