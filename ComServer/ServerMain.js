/**
 * Created by Jack.L on 2017/4/29.
 */


////
var express = require('express');
var serverApp = new express();
var webApp = new express();

var routes = require('./route');
routes(serverApp);

var web = require('./web');
web(webApp);

////////////////



