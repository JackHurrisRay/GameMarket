/**
 * Created by Jack.L on 2017/4/29.
 */


////
var express = require('express');
var serverApp = new express();
var webApp = new express();

var mongodb = require('./mongoDB');
var routes = require('./route');
var web = require('./web');

mongodb.init(
    function()
    {
        routes(serverApp);
        web(webApp);
    }
);

////////////////



