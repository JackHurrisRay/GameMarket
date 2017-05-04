/**
 * Created by Jack.L on 2017/5/4.
 */
var url = require("url");
var crypto = require("crypto");
var urlEncode = require('urlencode');

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
    requestWXToken:function (callback)
    {
        var wxHttp = require('https');
        var iconv = require("iconv-lite");

        wxHttp.get(this.getWXTokenURL(),
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
                        var result = iconv.decode(buff, "utf8");//转码//var result = buff.toString();//不需要转编码,直接tostring

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
    }
};
