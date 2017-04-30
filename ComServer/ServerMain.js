/**
 * Created by Jack.L on 2017/4/29.
 */

var PORT = 1021;

var http = require('http');
var url=require('url');
var fs=require('fs');
var mine=require('./mine').types;
var path=require('path');

var express = require('express');
var serverApp = express();

/*
var server = http.createServer(function (request, response) {

    var pathname = url.parse(request.url).pathname;
    var realPath = path.join("assets", pathname);

    //console.log(realPath);
    var ext = path.extname(realPath);
    ext = ext ? ext.slice(1) : 'unknown';
    fs.exists(realPath, function (exists) {
        if (!exists) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });

            response.write("This request URL " + pathname + " was not found on this server.");
            response.end();
        } else {
            fs.readFile(realPath, "binary", function (err, file) {
                if (err) {
                    response.writeHead(500, {
                        'Content-Type': 'text/plain'
                    });
                    response.end(err);
                } else {
                    var contentType = mine[ext] || "text/plain";
                    response.writeHead(200, {
                        'Content-Type': contentType
                    });
                    response.write(file, "binary");
                    response.end();
                }
            });
        }
    });

});
server.listen(PORT);
console.log("Server runing at port: " + PORT + ".");
    */

var routes = require('./route');
routes(serverApp);

var server = serverApp.listen(PORT, function(){
    var host = server.address().address;
    var port = server.address().port;

    console.log('SERVER＿RUNNING: http://%s:%s', host, port);
});