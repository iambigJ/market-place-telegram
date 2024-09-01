import {Injectable, Module} from '@nestjs/common';
import {TestService} from "./test.service";
import {ConfigModule} from '../provider/config/config.module'
import {providertest, ProviderTest2} from "./useclass.example";
import {ForRootExample} from "./for-root";
import {TestModule2} from "./test-two.module";




@Module({
  imports: [ConfigModule, ForRootExample.forRoot('ss')],
  providers: [TestService,providertest,ProviderTest2],
  exports: [TestService]
})
export class TestModule {}
