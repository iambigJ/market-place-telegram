import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

export const mongoseModule = () =>   MongooseModule.forRootAsync({
    useFactory: async (configService: ConfigService) => {
        const url = configService.get<string>('Mongo');
        const user = configService.get<string>('Mongo-user');
        const pass = configService.get<string>('Mongo-password');
        return {
            uri: `mongodb://${user}:${pass}@${url}`,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };
    },
    inject: [ConfigService],
})