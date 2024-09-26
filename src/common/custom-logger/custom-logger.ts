import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';

export class MyLogger extends ConsoleLogger {
  constructor(context?: string) {
    super();
    this.setLogLevels(['log', 'error', 'warn', 'debug', 'verbose']);
    this.setContext(context);
  }
  log(message: string, ...optionalParams: [...any]) {
    super.log('📢 ' + message, optionalParams);
  }

  warn(message: string, ...optionalParams: [...any]) {
    super.warn('📢 ' + message, optionalParams);
  }
  debug(message: string, ...optionalParams: [...any]) {
    console.log(optionalParams);
    super.debug('📢 ' + message, optionalParams);
  }

  error(message: string, ...optionalParams: any[]) {
    const [context, ...args] = optionalParams;

    if (args.length > 0 && typeof args[0] === 'string') {
      super.error('📢 ' + message, args[0], context, ...args.slice(1));
    } else if (context) {
      super.error('📢 ' + message, '', context, ...args);
    } else {
      super.error('📢 ' + message, ...args);
    }
  }

  // else {
  //   super.error('📢 ' + message, ...args);
  // }
}
