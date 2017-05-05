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
        webServer.use(bodyParser.urlencoded({extended:false}));

        webServer.get('/', function(req, res)
            {
                var _ip = wxService.getClientIP(req);
                console.log("client visit by " + _ip);

                if( wxService.processCodeAndState(req, res) )
                {

                }
                else
                {
                    wxService.validateToken(req, res);
                }
            }
        );

        webServer.post('./',
            function(req, res)
            {
                res.end("Verify by Jack.L's Server");
            }
        );

        wxService.taskTokenRefresh();

        ////////
        webServer.get('/auth',
            function(req, res)
            {
                res.writeHead(302,{'Location':wxService.getWXAPPUrl()});
                res.end();
            }
        );

        webServer.get('/redirect',
            function(req, res)
            {
                var _cookies =
                {
                    "code":0,
                    "data":"Jack's Test"
                };

                res.cookie("redirect",_cookies,{maxAge:600000, httpOnly:false});
                res.writeHead(302,{'Location':"http://47.92.88.155:1021/"});
                res.end();
            }
        );

        webServer.get('/app',
            function(req, res)
            {
                res.send("Hello, This is Jack.L's APP");
            }
        );

        webServer.get('/image_test',
            function(req, res)
            {
                wxService.getImage(req, res);
            }
        );

        var _serverEx = webServer.listen(80, function(){
            console.log('SERVER＿RUNNING: 80 PORT');
        });
    };
