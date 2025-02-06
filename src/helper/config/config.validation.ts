export interface MongoConfig {
  url: string;
  port: number;
  user?: string;
  password?: string;
}

export interface RedisConfig {
  uri: string;
  port: number;
  user: string;
  password?: string;
}

export interface LogConfig {
  logLevel: string;
}

export interface JWTConfig {
  Key_Path: string;
}
export interface GeneralConfig extends MongoConfig, LogConfig, JWTConfig {
  MONGO_General: MongoConfig;
  Redis_General: RedisConfig;
}
