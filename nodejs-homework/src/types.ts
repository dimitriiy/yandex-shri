export type ExpressRequest = {
  getMethod: () => string;
  body: Record<any, any>;
  url: string;
  header: (name: string) => string | string[] | null;
  query: any;
};

export type ExpressResponse = {
  status: (code: number) => ExpressResponse;
  send: (arg: any) => ExpressResponse;
  sendFile: (path: string) => ExpressResponse;
  json: (data: any) => ExpressResponse;
  setHeader: (headerName: string, value: any) => void;
  _response: any;
};

type Handler = {
  (request: ExpressRequest, Response: ExpressResponse, next: Next): void;
};

export type Next = () => void;
export type Middleware = (request: ExpressRequest, Response: ExpressResponse, next: Next) => void;
export interface GetHandler extends Handler {}
export interface PostHandler extends Handler {}

export interface ExpressAppInstance {
  get: (path: string, ...handler: GetHandler[]) => void;
  post: (path: string, ...handler: PostHandler[]) => void;
  use: (fn: Middleware) => void;

  listen: (port: number) => void;
  static: (path: string) => Middleware;
}

export type Methods = 'POST' | 'GET';
