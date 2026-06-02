const http = require('http');
const fs = require('fs');

const PORT = 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    fs.readFile('index.html', (err, data) => {
      if (err) {
        res.writeHead(500, { 'content-type': 'text/plain' });
        res.end('Server error');
        return;
      }
      res.writeHead(200, { 'content-type': 'text/html' });
      res.end(data);
    });
  } else if (req.url === '/about') {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end('Welcome About page');
  } else {
    res.writeHead(404, { 'content-type': 'text/html' });
    res.end('Page not found');
  }
});

server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
