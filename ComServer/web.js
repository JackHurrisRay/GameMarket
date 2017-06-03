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
var system      = require('./serverSystem');
var game        = require('./comtrade')(system);

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
        const GAME_NAME =
        {
            "1":"/douniu"
        };

        webServer.get('/auth',
            function(req, res)
            {
                const game_id = req.query.game;

                if( game_id )
                {
                    req.session.APP_NAME = GAME_NAME[game_id];
                    req.session.APP_ID   = game_id;
                }

                res.writeHead(302,{'Location':wxService.getWXAPPUrl()});
                res.end();
            }
        );

        ////////
        const _wx_verify =
        {
            "path":"/MP_verify_Rdd6b2FIu8V72Ser.txt",
            "info":"Rdd6b2FIu8V72Ser"
        };

        webServer.get(_wx_verify.path,
            function(req,res)
            {
                res.send(_wx_verify.info);
            }
        );

        webServer.get('/gameapp' + _wx_verify.path,
            function(req,res)
            {
                res.send(_wx_verify.info);
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

        webServer.use('/game',
            function(req,res,next)
            {
                if( system.connected(req) == 1 )
                {
                    next();
                }
                else
                {
                    protocal.send_error(res, protocal.error_code.error_notlogin);
                }
            }
        );

        webServer.put('/game/content_option',
            function(req, res)
            {
                game.content_option(req, res);
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
                        const _data =
                        {
                            "ID":"1495616455785281",
                            "NICKNAME":"Jack Game",
                            "login_id":"omkfuwEIzl7MrmHHdc0RK5Gsb9I0",
                            "login_pwd":"b21rZnV3RUl6bDdNcm1ISGRjMFJLNUdzYjlJMA==",
                            "sex":1
                        };

                        var _resData = "<script>const wx_data = " + JSON.stringify(_data) + ";</script>";
                        _resData += html;

                        res.end(_resData);
                    }
                );
            }
        );

        webServer.get('/gameapp',
            function(req, res)
            {
                if(req.session && req.session.wx_data && req.session.APP_NAME)
                {
                    const _wx_data = req.session.wx_data;
                    const _data =
                    {
                        "ID":_wx_data.UID,
                        "NICKNAME":_wx_data.nickname,
                        "login_id":_wx_data.ID,
                        "login_pwd":_wx_data.PWD,
                        "sex":_wx_data.sex,
                        "ticket":wxService.signature(req)
                    };

                    this.getDouNiuHtml(
                        function(html)
                        {
                            var _resData = "<script>const wx_data = " + JSON.stringify(_data) + ";</script>";
                            _resData += html;

                            res.end(_resData);
                        }
                    );
                }
                else
                {
                    const game_id = req.query.game;

                    if( game_id )
                    {
                        res.writeHead(302,{'Location':'auth?game=' + game_id});
                        res.end();
                    }
                    else
                    {
                        res.end('Sorry, You must relogin by WeChat!');
                    }
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

        ////////
        var _htmlIconFav = null;
        webServer.get('/favicon.ico',
            function(req, res)
            {
                if( _htmlIconFav == null )
                {
                    httpRequest.http_getCode(
                        "http://5941game.oss-cn-qingdao.aliyuncs.com/favicon.ico",
                        function(data)
                        {
                            _htmlIconFav = data;

                            res.end(_htmlIconFav);
                        }
                    );
                }
                else
                {
                    res.end(_htmlIconFav);
                }

            }
        );

        var _serverEx = webServer.listen(80, function(){
            console.log('SERVER＿RUNNING: 80 PORT');
        });
    };
