import { express } from './express';
import { cors } from './cors';
import { bodyParser } from './bodyParser';
import { Middleware } from './types';
import { readdir } from 'fs/promises';
import * as path from 'path';
import { statSync } from 'fs';
//https://dev.to/wesleymreng7/creating-your-own-expressjs-from-scratch-part-3-treating-request-and-response-objects-4ecf
const app = express();

app.use(bodyParser.json());

// app.use(app.static('public'));
app.use(cors);
app.get('/', (req, res) => {
  res.sendFile('./public/index.html');
});

app.get('/data', (req, res) => {
  const query = req.query;
  res.json(query);
});

app.get('/users/:userId/books/:bookId', (req, res) => {
  res.json(req.query);
});

// (2)
const auth: Middleware = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    res.status(400).send('Not registered');
  }
  next();
};

app.post('/', auth, (req, res) => {
  res.send('POST');
});

app.listen(5001);

async function* traverse(folder) {
  let result = [];
  const files = await readdir(folder);

  for (const n of files) {
    const absolutePath = path.join(folder, n);
    if (statSync(absolutePath).isDirectory()) {
      yield traverse(n);
    } else {
      yield n;
    }
    console.log(n);
  }

  return result;
}

const getFiles = async (folder) => {
  const dir = path.join(process.cwd(), folder);

  for await (const file of traverse(dir)) {
    console.log('file', file);
  }
};

getFiles('/public');
