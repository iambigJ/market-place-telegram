import { Module } from '@nestjs/common';
import {GlobalConfigModule} from "./common/config-module";
import {mongoseModule} from "./database/register-helper";

@Module({
  imports: [GlobalConfigModule,  mongoseModule()

],
  controllers: [],
  providers: [],
})
export class AppModule {}
