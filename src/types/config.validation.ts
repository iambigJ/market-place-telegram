export interface Config {
  MONGO: {
    url: string;
    port: number;
    user?: string;
    password?: string;
  };
  Redis: {
    uri: string;
    port: number;
    password?: string;
  };
  logLevel: string;
  JWTKetPath: string;
}
