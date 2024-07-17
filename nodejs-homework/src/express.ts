import { ExpressAppInstance, GetHandler, Middleware, PostHandler } from './types';

import { IncomingMessage, ServerResponse, Server, createServer } from 'node:http';
import { Routing } from './routing';
import { Request } from './request';
import { Response } from './response';
import { staticMiddleware } from './staticMiddlware';
import { readdir } from 'fs/promises';
import { Handler } from 'express';

async function invokeMiddlewares(request: Request, response: Response, middlewares: Handler[]) {
  const middleware = middlewares[0];
  if (!middleware) return;

  return middleware(
    request,
    response,
    () => middlewares.length && invokeMiddlewares(request, response, middlewares.slice(1))
  );
}

function dispatchChain(request: Request, response: Response, middlewares: Handler[]) {
  return invokeMiddlewares(request, response, middlewares);
}

class Express implements ExpressAppInstance {
  private http: Server;
  private Router: Routing = new Routing();
  private middleware: Middleware[] = [];

  constructor() {
    this.http = createServer(this.requestListener);
  }

  private requestListener = async (request: IncomingMessage, response: ServerResponse) => {
    const url = request.url.split('?')[0];

    console.log(url);
    const middlewaresAndControllers = this.Router.getHandler(url, request.method);

    const myRequest = new Request(request);
    const myResponse = new Response(request, response);

    if (this.middleware.length) {
      await dispatchChain(myRequest, myResponse, [...this.middleware]);
    }

    if (!middlewaresAndControllers?.length) {
      return myResponse.status(404).send('Not found');
    }

    await dispatchChain(myRequest, myResponse, [...middlewaresAndControllers]);
  };

  post(path: string, ...handler: PostHandler[]) {
    this.Router.post(path, ...handler);

    return this;
  }
  get(path: string, ...handler: GetHandler[]) {
    this.Router.get(path, ...handler);

    return this;
  }

  use(middleware: Middleware) {
    this.middleware.push(middleware);
  }

  listen(port: number) {
    return this.http.listen(port);
  }

  static(base: string) {
    return async (request, response, next) => {
      const url = request.url;

      if (request.getMethod() !== 'GET') {
        return next();
      }

      const dir = await readdir(base);

      next();
    };
  }
}

export function express(): ExpressAppInstance {
  const instance = new Express();

  return instance;
}
