export interface GeneralConfig {
  MONGO_General: {
    url: string;
    port: number;
    user?: string;
    password?: string;
  };
  Redis_General: {
    uri: string;
    port: number;
    password?: string;
  };

  logLevel: string;
  JWTKetPath: string;
}
