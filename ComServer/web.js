/**
 * Created by Jack.L on 2017/5/2.
 */
var express = require('express');
var cookie  = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var http = require("http");
var url = require("url");
var crypto = require("crypto");

function sha1(str){
    var md5sum = crypto.createHash("sha1");
    md5sum.update(str);
    str = md5sum.digest("hex");
    return str;
}

const STR_TOKEN = "Jack.L's World";
function getToken()
{
    var _result = "";
    var s = (new Buffer(STR_TOKEN)).toString('base64');

    for(var i=0;i<s.length;i++)
    {
        var p = s.charAt(i);

        if( (p >= 'a' && p <= 'z') ||
            (p >= 'A' && p <= 'Z') ||
            (p >= '0' && p <= '9')
            )
        {
            _result = _result + p.toString();
        }
    }

    return _result;

};

const __TOKEN_VALUE = getToken();

function validateToken(req,res){
    var query = url.parse(req.url,true).query;
    //console.log("*** URL:" + req.url);
    //console.log(query);
    var signature = query.signature;
    var echostr = query.echostr;
    var timestamp = query['timestamp'];
    var nonce = query.nonce;
    var oriArray = new Array();
    oriArray[0] = nonce;
    oriArray[1] = timestamp;
    oriArray[2] = __TOKEN_VALUE;//"*********";//这里是你在微信开发者中心页面里填的token，而不是****
    oriArray.sort();
    var original = oriArray.join('');
    console.log("Original str : " + original);
    console.log("Signature : " + signature );
    var scyptoString = sha1(original);
    if(signature == scyptoString){
        res.end(echostr);
        console.log("Confirm and send echo back");
    }else {
        res.end("Welcome to Jack.L's World! You can add me QQ:24387124");
        console.log("Failed!");
    }
}

module.exports =
    function(webServer)
    {
        webServer.use(bodyParser.json());
        webServer.use(bodyParser.raw());
        webServer.use(cookie());

        webServer.get('/', function(req, res)
            {
                //res.send("Welcome To Jack.L's Server");
                validateToken(req, res);
            }
        );

        const APP_ID = "wxaeae042027b2618f";
        const CUR_URL = "http://47.92.88.155/app";

        const REDIRECT_URL = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf0e81c3bee622d60&redirect_uri=http%3A%2F%2Fnba.bluewebgame.com%2Foauth_response.php&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect";

        const APP_URL =
            "https://open.weixin.qq.com/connect/oauth2/authorize?" +
            "appid=" + APP_ID + "&redirect_uri=" + CUR_URL +
            "&response_type=code&scope=snsapi_userinfo&state=0#wechat_redirect";

        webServer.get('/auth',
            function(req, res)
            {
                res.writeHead(302,{'Location':APP_URL});
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
