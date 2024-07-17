import { Middleware } from '../types';
import { readPostData } from '../utils';

export const jsonParser: Middleware = async (request, response, next) => {
  if (request.getMethod() === 'POST') {
    const parsedData = await readPostData(request);
    request.body = parsedData;
  }
  next();
};

export const bodyParser = {
  json: () => jsonParser,
};
