import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

export const mongooseModule = () =>
  MongooseModule.forRootAsync({
    useFactory: async (configService: ConfigService) => {
      const url = configService.get<string>('Mongo');
      const user = configService.get<string>('Mongo-user');
      const pass = configService.get<string>('Mongo-password');
      let uri: string;

      if (user && pass) {
        uri = `mongodb://${user}:${pass}@${url}`;
      } else {
        uri = `mongodb://${url}`;
      }

      return {
        uri: uri,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 5000, // 45 seconds before a socket timeout
      };
    },
    inject: [ConfigService],
  });
