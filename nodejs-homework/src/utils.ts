export async function readPostData(request) {
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
