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





}