var http = require('http'),
    util = require('util'),
    nodeStatic = require('node-static');

var file = new nodeStatic.Server('.');

var server = http.createServer(function (req, res) {
  req.addListener('end', function () {
    file.serve(req, res);
  });
});

var port = process.env.PORT || 3000;

server.listen(port, function() {
  console.log("Static server started on " + port);
});

