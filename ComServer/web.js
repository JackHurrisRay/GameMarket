/**
 * Created by Jack.L on 2017/5/2.
 */
var express = require('express');
var cookie  = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var wxService = require('./wxService');
var protocal = require('./protocal');

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
                /*
                var _ip = wxService.getClientIP(req);
                console.log("client visit by " + _ip);

                if( wxService.processCodeAndState(req, res) )
                {

                }
                else
                {
                    wxService.validateToken(req, res);
                }
                */

                res.end("Welcome to Jack.L's Server");
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

        webServer.get('/MP_verify_Rdd6b2FIu8V72Ser.txt',
            function(req,res)
            {
                res.send('Rdd6b2FIu8V72Ser');
            }
        );

        webServer.get('/redirect',
            function(req, res)
            {
                var _data =
                {
                    "code":0,
                    "data":"Jack's Test"
                };

                req.APP_KEY = _data;

                res.cookie("redirect",_data,{maxAge:600000, httpOnly:true});
                res.writeHead(302,{'Location':"http://47.92.88.155:1021/"});
                res.end();
            }
        );

        webServer.get('/app',
            function(req, res)
            {
                //res.send("Hello, This is Jack.L's APP");

                var _ip = wxService.getClientIP(req);
                console.log("client visit by " + _ip);

                wxService.processCodeAndState(req, res)
            }
        );

        webServer.get('/image_test',
            function(req, res)
            {
                wxService.getImage(req, res);
            }
        );

        webServer.get('/error_code',
            function(req, res)
            {
                protocal.send_ok(res, protocal.error_code);
            }
        );

        var _serverEx = webServer.listen(80, function(){
            console.log('SERVER＿RUNNING: 80 PORT');
        });
    };
