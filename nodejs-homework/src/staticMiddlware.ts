import { Middleware } from './types';
import { createReadStream } from 'node:fs';
import * as path from 'node:path';
const { readdir } = require('fs/promises');

export const staticMiddleware =
  (root: string): Middleware =>
  async (request, response, next) => {
    const url = request.url;

    console.log(this, url);
    const dir = await readdir(url);

    console.log({ url });
    next();
  };
