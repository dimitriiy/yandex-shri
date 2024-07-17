import { ExpressResponse } from './types';
import { IncomingMessage, ServerResponse } from 'node:http';
import { createReadStream } from 'node:fs';
export class Response implements ExpressResponse {
  constructor(
    private request: IncomingMessage,
    public _response: ServerResponse
  ) {}
  send(data: any) {
    this._response.end(data);

    return this;
  }

  status(code: number) {
    this._response.statusCode = code;
    return this;
  }

  sendFile(path: string) {
    this._response.writeHead(200, { 'Content-Type': 'text/html' });

    const file = createReadStream(path);
    file.pipe(this._response);

    return this;
  }

  setHeader(headerName: string, value: any) {
    this._response.setHeader(headerName, value);
  }

  json(data: any) {
    this._response.setHeader('Content-Type', 'application/json');
    this._response.end(JSON.stringify(data));

    return this;
  }
}
