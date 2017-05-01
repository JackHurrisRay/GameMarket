/**
 * Created by Jack.L on 2017/4/29.
 */

var express = require('express');
var cookie  = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var protocal = require('./protocal');
var system  = require('./serverSystem');
var sysLogin = require('./sysLogin')(system);
var comtrade = require('./comtrade')(system);

var tcpServer = require('./TCPServer');

module.exports = function(app)
{
    //use
    app.use(bodyParser.json());
    app.use(bodyParser.raw());
    app.use(cookie());

    //login
    app.post('/login/test', function(req,res)
    {
        sysLogin.test(req,res);
    });

    app.post('/login/register', function(req,res)
    {
        sysLogin.register(req,res);
    });

    app.post('/login/login', function(req,res)
    {
        sysLogin.login(req,res);
    });

    app.post('/login/logout', function(req, res)
    {
       sysLogin.logout(req,res);
    });

    //trade
    app.use('/trade',
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

    app.post('/trade/test', function(req,res)
    {
        res.send("Welcome to Jack.L's Server");
    });

    app.put('/trade/create_content',
        function(req,res)
        {
            comtrade.create_content(req,res);
        }
    );

    app.delete('/trade/delete_content',
        function(req, res)
        {
            comtrade.delete_content(req,res);
        }
    );

    app.put('/trade/get_all_content',
        function(req, res)
        {
            comtrade.get_all_content(req, res);
        }
    );

    app.put('/trade/update_content',
        function(req, res)
        {
            comtrade.update_content(req, res);
        }
    );

    app.put('/trade/applicate_content',
        function(req, res)
        {
            comtrade.applicate_content(req, res);
        }
    );

    ////
    var waitFor = system.waitFor;

    waitFor(
        function()
        {
            return system.isDBConn() && comtrade.isInit;
        },
        function()
        {
            tcpServer.run();
        }
    );

    waitFor(
        function()
        {
            return tcpServer.isInit;
        },
        function()
        {
            const PORT = 1021;
            var server = app.listen(PORT, function(){
                var address = server.address();

                var host = address.address;
                var port = address.port;

                console.log('SERVER＿RUNNING: http://%s:%s', host, port);
            });
        }
    );

}