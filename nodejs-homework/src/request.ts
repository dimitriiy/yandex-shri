import { ExpressRequest } from './types';
import { IncomingMessage, ServerResponse } from 'node:http';
import url from 'url';

export class Request implements ExpressRequest {
  body: Record<any, any>;
  url: string;
  constructor(private request: IncomingMessage) {
    this.url = request.url;
  }
  getMethod() {
    return this.request.method;
  }

  on(...args: any[]) {
    this.request.on(...args);
  }

  header(name: string) {
    return this.request.headers[name] ?? this.request.headers[name.toLowerCase()] ?? null;
  }

  get query() {
    const data = url.parse(this.request.url, true).query;

    return data;
  }
}
