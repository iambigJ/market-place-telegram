import {ConfigurableModuleBuilder, Inject, Injectable, OnModuleInit} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import {Connection, ConnectionMock} from "./useclass.example";
import {ContextIdStrategy} from "@nestjs/core";
import {test2} from "./test2.service";

@Injectable()
export class TestService implements OnModuleInit{
  constructor(@Inject('Test2Service_ss') private test: test2,private configModule: ConfigService, private connection: ConnectionMock, private shoo : Connection) {
  }

  ok(){
    console.log(this.configModule.get('mongo'))
    console.log('ok');
    this.connection.moo()
    this.shoo.moo()
    this.test.getm()
  }
  // test2(){
  //   this.test.getm()
  // }
  async onModuleInit() {
    console.log('shoooooooooooooooooooooooooo')
    const x = new ConfigurableModuleBuilder().build()
  }
}
