export const AuthPrefix: string = 'teleBot';

export enum CachePrefixes {
  auth = 'auth',
}

export function createCachePreficAuth(teleId: string) {
  return CachePrefixes.auth.concat('.', teleId);
}
