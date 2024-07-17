import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createReadStream } from 'node:fs';

import dotenv from 'dotenv';
import * as url from 'url';

dotenv.config();

const PORT = process.env.PORT;
const BACKUP_FILE_PATH = path.join(process.cwd(), process.env.BACKUP_FILE_PATH ?? 'backup.txt');

const isExistDir = async (path) => {
  try {
    await fs.access(path);

    return true;
  } catch (e) {
    return false;
  }
};
const getFullPath = (dir) => path.join(process.cwd(), dir);

class DB {
  async readBackups() {
    const readStream = createReadStream(BACKUP_FILE_PATH);
    let output = '';

    return new Promise((res) => {
      readStream.on('data', (chunk) => {
        output += chunk;
      });

      readStream.on('end', function () {
        res(output);
      });
    });
  }

  h(d) {
    try {
      return JSON.parse(d);
    } catch (e) {
      return null;
    }
  }

  parseData(str) {
    const rows = str.split('\n');
    return rows.reduce((acc, cur) => {
      const parsedObject = this.h(cur);
      if (parsedObject) {
        acc[parsedObject.id] = parsedObject;
      }

      return acc;
    }, {});
  }

  async init() {
    if (this.isReady) return;

    const data = await this.readBackups();

    this.data = this.parseData(data);

    const promises = [];

    for (const id in this.data) {
      promises.push(fileBucket.createFile(this.data[id]));
    }

    await Promise.all(promises);

    this.isReady = true;
  }

  async getMovieById(id) {
    return this.data[id];
  }

  async allMovies() {
    return Object.values(this.data);
  }
}

const Db = new DB();

class FileBucket {
  constructor() {
    this.imageDir = path.join(process.cwd(), '/images');
  }

  async checkRootDir() {
    const isExist = await isExistDir(this.imageDir);

    if (!isExist) {
      try {
        await fs.mkdir(this.imageDir);
      } catch (e) {}
    }
  }

  async createFile(data) {
    await this.checkRootDir();
    const buffer = Buffer.from(
      data.img, // only use encoded data after "base64,"
      'base64'
    );

    return fs.writeFile(path.join(this.imageDir, `${data.id}.jpeg`), buffer);
  }
}

const fileBucket = new FileBucket();

async function readPostData(request) {
  return new Promise((res) => {
    let body = '';
    request.on('data', function (data) {
      body += data;
    });
    request.on('end', function () {
      res(JSON.parse(body));
    });
  });
}

function pingRoute(request, response) {
  response.end();
}

async function echoRoute(request, response) {
  let body = await readPostData(request);

  response.end('echo');
}

async function movieRoute(request, response, id) {
  try {
    const movie = await Db.getMovieById(id);

    if (!movie) {
      response.end('Not found');
      return;
    }

    const { title, description, genre, release_year } = movie;
    const formattedMovie = {
      title,
      description,
      genre,
      release_year,
    };

    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(formattedMovie));
  } catch (e) {
    console.log(e);
    response.end(e);
  }
}

async function searchRoute(request, response) {
  console.log('here');
  const { title, page, limit = 10 } = url.parse(request.url, true).query;

  console.log('title', title);
  const allMovies = await Db.allMovies();
  const regex = new RegExp(title, 'gi');
  const searchMovies = [];

  for (const id in allMovies) {
    const movie = allMovies[id];
    if (movie.title.search(regex) > -1) {
      searchMovies.push(movie);
    }
  }
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(searchMovies.slice(page * limit, page * limit + limit)));
}

const matchFactory = (template) => (str) => {
  if (!template || !str) return null;

  const regex = new RegExp(`^${template.replace(/:\w+/g, '(.+)')}`);

  return regex.exec(str)?.[1] ?? null;
};

function matchRoutes(routes, url) {
  if (routes[url]) return routes[url];

  const path = Object.keys(routes).find((path) => matchFactory(path)(url));
  const params = matchFactory(path)(url);
  return {
    handler: routes[path],
    params,
  };
}

function handleStatic(request, response) {
  const url = request.url;
  const matched = /\/static\/(.+)\/(.+)/.exec(url);
  if (!matched) return;
  const [fullPath, typeStatic, name] = matched;

  const stream = createReadStream(getFullPath(`/${typeStatic}/${name}.jpeg`));

  stream.pipe(response);
}

export async function serverHandle(request, response) {
  await Db.init();
  const routes = {
    '/ping': pingRoute,
    '/echo': echoRoute,
    '/api/v1/movie/:id': movieRoute,
    '/api/v1/search': searchRoute,
    // '/favicon.ico': (r, res) => res.end('fav'),
  };
  const url = request.url.replace(/\?.*$/, '');

  if (url.includes('static')) {
    return handleStatic(request, response);
  }

  const matchedRoute = matchRoutes(routes, url);
  console.log('matchedRoute', matchedRoute, matchedRoute && !matchedRoute.handler);

  if (!matchedRoute || (matchedRoute && !matchedRoute.handler)) {
    response.statusCode = 404; // адрес не найден
    response.end('Not Found');
    return;
  }

  const handler = typeof matchedRoute === 'object' ? matchedRoute.handler : matchedRoute;

  return handler(request, response, matchedRoute.params);
}
export async function app() {
  const server = http.createServer(serverHandle);

  server.listen(PORT);

  return server;
}

app();
