/**
 * Created by Jack.L on 2017/5/2.
 */
var express = require('express');
var cookie  = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var wxService = require('./wxService');
var protocal = require('./protocal');
var httpRequest = require('./HttpRequest');

////////
module.exports =
    function(webServer)
    {
        webServer.use(bodyParser.json());
        webServer.use(bodyParser.raw());
        webServer.use(cookie());
        webServer.use(bodyParser.urlencoded({extended:false}));
        webServer.use(session(
            {
                secret:"Welcome to Jack.L's WeChat Server",
                cookie:{maxAge:60000}
            }
        ));

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

        ////////
        var _htmlDouNiu = null;
        this.getDouNiuHtml =
            function(callback_gethtml)
            {
                if( _htmlDouNiu == null )
                {
                    httpRequest.http_getCode(
                        "http://app.huyukongjian.cn/douniu/game.html",
                        function(html)
                        {
                            _htmlDouNiu = html;
                            callback_gethtml(_htmlDouNiu);
                        }
                    );
                }
                else
                {
                    callback_gethtml(_htmlDouNiu);
                }
            };

        webServer.get('/douniu_test',
            function(req, res)
            {
                this.getDouNiuHtml(
                    function(html)
                    {
                        var _resData = "<script>const wx_data = {ID:'1495616455785281',IMG:'',NICKNAME:'Jack'}</script>";
                        _resData += html;

                        res.end(_resData);
                    }
                );
            }
        );

        webServer.get('/douniu',
            function(req, res)
            {
                if(req.session && req.session.wx_data)
                {
                    const _wx_data = req.session.wx_data;

                    this.getDouNiuHtml(
                        function(html)
                        {
                            var _resData = "<script>const wx_data = {ID:'"+ _wx_data.UID + "',IMG:'',NICKNAME:'"+ _wx_data.nickname +"'}</script>";
                            _resData += html;

                            res.end(_resData);
                        }
                    );
                }
                else
                {
                    res.writeHead(302,{'Location':"/auth"});
                    res.end();
                }

            }
        );

        ////////
        var _htmlProjectJson = null;
        webServer.get('/project.json',
            function(req, res)
            {
                if( _htmlProjectJson == null )
                {
                    httpRequest.http_getCode(
                        "http://app.huyukongjian.cn/douniu/project.json",
                        function(html)
                        {
                            _htmlProjectJson = html;

                            res.end(_htmlProjectJson);
                        }
                    );
                }
                else
                {
                    res.end(_htmlProjectJson);
                }

            }
        );

        var _serverEx = webServer.listen(80, function(){
            console.log('SERVER＿RUNNING: 80 PORT');
        });
    };
