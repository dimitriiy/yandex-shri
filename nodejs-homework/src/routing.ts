import { GetHandler, Methods, PostHandler } from './types';

type Handlers = GetHandler | PostHandler;

export class Routing {
  private routes = new Map<string, Map<Methods, Handlers[]>>();

  private registerMethod(url: string, method: Methods, ...handlers: Handlers[]) {
    let routes = this.routes.get(url);
    if (!routes) {
      this.routes.set(url, (routes = new Map()));
    }

    routes.set(method, handlers);
  }
  getHandler(url: string, method: string) {
    return this.routes.get(url)?.get(method as Methods);
  }

  get(url: string, ...handlers: GetHandler[]) {
    this.registerMethod(url, 'GET', ...handlers);
  }
  post(url: string, ...handlers: PostHandler[]) {
    this.registerMethod(url, 'POST', ...handlers);
  }
}
