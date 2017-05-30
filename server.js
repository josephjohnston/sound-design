var http = require('http'),
	fs = require('fs'),
	path = require('path'),
	mime = require('mime'),
	cache = {};
function serveStatic(response,absPath) {
	if(cache[absPath]) {
		sendFile(response,absPath,cache[absPath]);
	} else {
		fs.exists(absPath,function(exists) {
			if(exists) {
				fs.readFile(absPath,function(err,data) {
					if(err) {
						send404(response);
					} else {
						cache[absPath] = data;
						sendFile(response,absPath,data);
					}
				});
			} else {
				send404(response);
			}
		});
	}
}
function sendFile(response,filePath,fileContents) {
	response.writeHead(200,
		{"content-type": mime.lookup(path.basename(filePath))}
	);
	response.end(fileContents);
}
function send404(response) {
	response.writeHead(404,{'Content-Type':'text/plain'});
	response.end('Error 404: file not found.');
}
var server = http.createServer(function(request,response) {
	var filePath = false;
	if(request.url=='/') {
		filePath = 'public/index.html';
	} else {
		filePath = 'public'+request.url;
	}
	var absPath = './'+filePath;
	serveStatic(response,absPath);
});
server.listen(80,function() {
	console.log('Server listening on port 80');
});

