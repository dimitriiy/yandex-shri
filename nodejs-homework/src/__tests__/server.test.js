import request from 'supertest';
import { describe, test, it } from 'node:test';

import { serverHandle } from '../../index.js'; // Ваш сервер, который вы хотите протестировать

// describe('GET /', function () {
//   it('should return Hello World!', function (done) {
//     request(serverHandle)
//       .get('/')
//       .expect(200)
//       .expect(/Hello World!/, done);
//   });
// });
//
// describe('GET movie:id', function () {
//   it('should return Movie', function (done) {
//     request(serverHandle)
//       .get('/api/v1/movie/2')
//       .expect(200)
//       .expect('Content-Type', /json/)
//       .expect(
//         {
//           title: 'Jurassic Park',
//           description:
//             'A billionaire philanthropist has created an amusement park filled with cloned dinosaurs, but chaos ensues when a power failure allows the dinosaurs to escape their enclosures.',
//           genre: 'Science Fiction, Thriller',
//           release_year: 1993,
//         },
//         done
//       )
//       .end(function (err, res) {
//         console.log(err);
//         if (err) return done(err);
//         done();
//       });
//   });
// });

describe('GET search', function () {
  it('should search', function (done) {
    request(serverHandle)
      .get('/api/v1/search?title=a&page=0')
      .query({
        title: 'a',
        page: 0,
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(
        {
          title: 'Jurassic Park',
          description:
            'A billionaire philanthropist has created an amusement park filled with cloned dinosaurs, but chaos ensues when a power failure allows the dinosaurs to escape their enclosures.',
          genre: 'Science Fiction, Thriller',
          release_year: 1993,
        },
        done
      )
      .end(function (err, res) {
        console.log(err);
        if (err) return done(err);
        done();
      });
  });
});
