import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { EventsModule } from './events/events.module';
import { MessagesService } from './messages/messages.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    EventsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'), // <-- path to the static files
    }),
    AuthModule,
    UsersModule,
  ],
  providers: [
    MessagesService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],

  controllers: [AppController],
  /*  providers: [AppService], */
})
export class AppModule {}
