import fs from "fs";
import http from "http";
import path from "path";

http.createServer(function (req, res) {
  if (req.url.length < 2) {
    req.url = "/index.html";
  }

  if (!req.url.endsWith(".html") && !req.url.endsWith(".css") && !req.url.endsWith(".jpg")) {
    req.url += ".html";
  }

  fs.readFile(path.join(__dirname, 'dist') + req.url, function (err, data) {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
    }

    res.writeHead(202);
    res.end(data);
  });
}).listen(1313);
