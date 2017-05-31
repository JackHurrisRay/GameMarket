/**
 * Created by Jack.L on 2017/5/4.
 */
var url = require("url");
var crypto = require("crypto");
var urlEncode = require('urlencode');
var qs    = require("qs");

var common = require('./common');
var alioss = require('./alioss');
var httpRequest = require('./HttpRequest');

var system  = require('./serverSystem');
var sysLogin = require('./sysLogin')(system);

var protocal = require('./protocal');

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
    CUR_URL:"http://huyukongjian.cn/app",
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
    getWXTicket:function(access_token)
    {
        const _URL =
            "https://qyapi.weixin.qq.com/cgi-bin/get_jsapi_ticket?access_token=" + access_token + "&type=jsapi";

        return _URL;
    },
    getWXRefresh_Access_TokenURL:function()
    {
        const TOKEN_URL =
            "https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=" + this.APP_ID +
            "&grant_type=refresh_token&refresh_token=REFRESH_TOKEN";

        return TOKEN_URL;
    },
    getWXUserInfoURL:function(_openid, _access_token)
    {
        const _URL = "https://api.weixin.qq.com/sns/userinfo?";
        const params =
        {
            access_token:_access_token,
            openid:_openid,
            lang:'zh_CN'
        };

        const options =
        {
            method:'get',
            url:_URL + qs.stringify(params)
        };

        return options;
    },
    requestWXToken:function (callback)
    {

        httpRequest.https_get(this.getWXTokenURL(),
            function(data)
            {
                if( callback )
                {
                    callback(data, null);
                }
            },
            function(error)
            {
                if( callback )
                {
                    callback(null, error);
                }
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
        var SELF  = this;

        var request  = req;
        var response = res;

        var query = req.query;

        ////////
        if( query.code && query.state )
        {
            httpRequest.https_get(this.getWXAccess_TokenURL(query.code),
                function(data)
                {
                    var _resultObj = data;

                    if( _resultObj.errcode )
                    {
                        ////
                        res.writeHead(302,{'Location':'/auth'});
                        res.end();
                    }
                    else
                    {
                        ////success
                        console.log('wx token:' + _resultObj.access_token);
                        console.log('open id:' + _resultObj.openid);

                        const _app_name = req.session.APP_NAME;
                        const _requestURL = SELF.getWXUserInfoURL(_resultObj.openid, _resultObj.access_token);
                        const _open_id = _resultObj.openid;

                        httpRequest.https_get(_requestURL.url,
                            function(data)
                            {
                                //response.send("Welcome to Jack's APP");

                                ////////
                                var callback_login =
                                    function()
                                    {
                                        sysLogin.login_by_wx(request, response, _open_id,
                                            function(req, res, accountdata)
                                            {
                                                ////////
                                                const _account = accountdata;

                                                var _wx_data =
                                                {
                                                    UID:_account.UID,
                                                    access_token: _resultObj.access_token,

                                                    city:_account.wx_userinfo.city,
                                                    province:_account.wx_userinfo.province,
                                                    country:_account.wx_userinfo.country,
                                                    nickname:_account.wx_userinfo.nickname,
                                                    headimgurl:_account.wx_userinfo.headimgurl,
                                                    sex:_account.wx_userinfo.sex,

                                                    ID:_account.ID,
                                                    PWD:_account.PWD
                                                };

                                                SELF.uploadImgToOSS(_wx_data.headimgurl, _wx_data.UID);

                                                req.session.wx_data = _wx_data;

                                                ////////
                                                const _ticket_url = SELF.getWXTicket(_wx_data.access_token);
                                                httpRequest.https_get(_ticket_url,
                                                    function(ticket_data)
                                                    {
                                                        return;
                                                    },
                                                    function(ticket_error)
                                                    {
                                                        return;
                                                    }
                                                );

                                                ////////
                                                res.writeHead(302,{'Location':_app_name});
                                                res.end();
                                                //protocal.send_ok(res, _wx_data);

                                            }
                                        );
                                    };

                                sysLogin.regist_by_wx(response, _open_id, data,
                                    callback_login,
                                    callback_login
                                );

                            },
                            function(error)
                            {
                                response.send("There is some error in Jack's Server");
                            }
                        );
                    }

                },
                function(error)
                {
                    response.send("There is some error in Jack's Server");
                }
            );
        }
        else
        {

        }


    },
    uploadImgToOSS:function(_img, _id)
    {
        var img_url = _img;

        if( img_url && common.checkURLInvalid(img_url) )
        {
            common.getImageFromURL(
                img_url,
                function(data, err)
                {
                    if( err )
                    {
                        ////
                    }
                    else
                    {
                        ////
                        var image =  data;

                        if( image == "" )
                        {
                            ////
                        }
                        else
                        {
                            ////
                            alioss.upload('account_wx_img/' + _id.toString(), image);
                        }
                    }

                }
            );
        }
    }
};
