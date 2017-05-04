/**
 * Created by Jack.L on 2017/5/2.
 */
var express = require('express');
var cookie  = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var wxService = require('./wxService');

////////
module.exports =
    function(webServer)
    {
        webServer.use(bodyParser.json());
        webServer.use(bodyParser.raw());
        webServer.use(cookie());

        webServer.get('/', function(req, res)
            {
                var _ip = wxService.getClientIP(req);
                console.log("client visit by " + _ip);

                //res.send("Welcome To Jack.L's Server");
                wxService.validateToken(req, res);
            }
        );

        wxService.requestWXToken(null);

        ////////
        webServer.get('/auth',
            function(req, res)
            {
                res.writeHead(302,{'Location':wxService.getWXAPPUrl()});
                res.end();
            }
        );

        webServer.get('/app',
            function(req, res)
            {
                res.send("Hello, This is Jack.L's APP");
            }
        );

        var _serverEx = webServer.listen(80, function(){
            console.log('SERVER＿RUNNING: 80 PORT');
        });
    };
