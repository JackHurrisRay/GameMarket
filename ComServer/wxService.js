/**
 * Created by Jack.L on 2017/5/4.
 */
var url = require("url");
var crypto = require("crypto");
var urlEncode = require('urlencode');
var https = require('https');
var iconv = require("iconv-lite");

var common = require('./common');
var alioss = require('./alioss');

////////
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

module.exports =
{
    TOKEN_VALUE:getToken(),
    APP_ID:"wxaeae042027b2618f",
    APP_SECRET:'059473bbfe7b7a999163c68a21682d2e',
    CUR_URL:"http://m.huyukongjian.com/app",
    WX_TOKEN:"",
    WX_TOKEN_INVALID_TIME:0,
    getImage:function(req, res)
    {
        var img_url = req.query.img;

        if( img_url && common.checkURLInvalid(img_url) )
        {
            common.getImageFromURL(
                img_url,
                function(data, err)
                {
                    if( err )
                    {
                        res.send("Jack.L's error:" + err.message);
                    }
                    else
                    {
                        ////
                        var image =  data;

                        if( image == "" )
                        {
                            res.send("Jack.L's tell you there is nothing");
                        }
                        else
                        {
                            ////
                            alioss.upload('account_wx_img/test.jpeg', image);

                            res.writeHead('200',{'Content-Type':'image/jpeg'});
                            res.end(image, 'base64');
                        }
                    }

                }
            );
        }
        else
        {
            res.send('You must have correct IMG parament, my firend');
        }
    },
    validateToken:function(req, res)
    {
        var query = url.parse(req.url,true).query;
        var signature = query.signature;
        var echostr = query.echostr;
        var timestamp = query['timestamp'];
        var nonce = query.nonce;
        var oriArray = new Array();
        oriArray[0] = nonce;
        oriArray[1] = timestamp;
        oriArray[2] = this.TOKEN_VALUE;//"*********";//这里是你在微信开发者中心页面里填的token，而不是****
        oriArray.sort();
        var original = oriArray.join('');
        console.log("Original str : " + original);
        console.log("Signature : " + signature );
        var scyptoString = sha1(original);
        if(signature == scyptoString){
            res.end(echostr);
            console.log("Confirm and send echo back");
        }else {
            res.end("Welcome to Jack.L's World!");
            console.log("Failed!");
        }
    },
    getClientIP:function(req)
    {
        return req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
    },
    getWXAPPUrl:function()
    {
        const ENCODE_URL = urlEncode.encode(this.CUR_URL);
        const APP_URL =
            "https://open.weixin.qq.com/connect/oauth2/authorize?" +
            "appid=" + this.APP_ID + "&redirect_uri=" + ENCODE_URL +
            "&response_type=code&scope=snsapi_userinfo&state=0#wechat_redirect";

        return APP_URL;
    },
    getWXTokenURL:function()
    {
        const TOKEN_URL =
            "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid="+
            this.APP_ID +
            "&secret=" +
            this.APP_SECRET;

        return TOKEN_URL;
    },
    getWXAccess_TokenURL:function(code)
    {
        const TOKEN_URL =
            "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + this.APP_ID +
            "&secret=" + this.APP_SECRET +
            "&code=" + code +
            "&grant_type=authorization_code";

        return TOKEN_URL;
    },
    getWXRefresh_Access_TokenURL:function()
    {
        const TOKEN_URL =
            "https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=" + this.APP_ID +
            "&grant_type=refresh_token&refresh_token=REFRESH_TOKEN";

        return TOKEN_URL;
    },
    requestWXToken:function (callback)
    {
        var _wxHttp = https;
        var _iconv  = iconv;

        _wxHttp.get(this.getWXTokenURL(),
            function( req, res )
            {
                var datas = [];
                var size = 0;

                req.on('data',
                    function(data)
                    {
                        if( callback )
                        {
                            callback(data, null);
                        }

                        datas.push(data);
                        size += data.length;
                    }
                );

                req.on('end',
                    function()
                    {
                        var buff = Buffer.concat(datas, size);
                        var result = _iconv.decode(buff, "utf8");//转码//var result = buff.toString();//不需要转编码,直接tostring

                        console.log('wx token:' + result);

                        if( callback )
                        {
                            callback(result, null);
                        }
                    }
                );

                req.on('error',
                    function(err)
                    {
                        console.log('wx error:' + err.message);

                        if( callback )
                        {
                            callback(null, err);
                        }
                    }
                );

            }
        );
    },
    taskTokenRefresh:function()
    {
        var SELF = this;

        var times = [];
        for(var i=1; i<60; i++){
            times.push(i);
        }

        var schedule = require('node-schedule');
        var taskRule = new schedule.RecurrenceRule();
        taskRule.second = times;
        //taskRule.minute = 60;

        var callback_refresh =
            function( data, error )
            {
                if( error == null && data != null && data.access_token != null )
                {
                    ////////
                    SELF.WX_TOKEN = data.access_token;
                }
                else
                {

                }
            };

        var task = schedule.scheduleJob(taskRule,
            function()
            {
                const _currentTime = Math.floor((new Date()).getTime() * 0.001);

                if( _currentTime - SELF.WX_TOKEN_INVALID_TIME > 3600 )
                {
                    SELF.WX_TOKEN_INVALID_TIME = _currentTime;
                    console.log('Task refrsh Token from WX');
                    SELF.requestWXToken(callback_refresh);
                }
            }
        );
    },
    processCodeAndState:function(req, res)
    {
        var check = false;

        var query = req.query;
        if( query.code && query.state )
        {
            check = true;

            ////////
            var _wxHttp = https;
            var _iconv  = iconv;

            _wxHttp.get(this.getWXAccess_TokenURL(query.code),
                function( req, res )
                {
                    var datas = [];
                    var size = 0;

                    req.on('data',
                        function(data)
                        {

                            datas.push(data);
                            size += data.length;
                        }
                    );

                    req.on('end',
                        function()
                        {
                            var buff = Buffer.concat(datas, size);
                            var result = _iconv.decode(buff, "utf8");//转码//var result = buff.toString();//不需要转编码,直接tostring

                            console.log('wx token:' + result);

                        }
                    );

                    req.on('error',
                        function(err)
                        {
                            console.log('wx error:' + err.message);

                        }
                    );

                }
            );

            ////////
            console.log('Step for veryfi code & state');
            res.send("Jack.L's Verify");
        }

        return check;
    }
};
