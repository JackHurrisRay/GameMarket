/**
 * Created by Jack.L on 2017/4/29.
 */

var Secret = require('./secret');

var dbSystem = require('./mongoDB');
dbSystem.init();

const _ex_key = "Welcome to jack.L's Server";

module.exports =
    (
        function()
        {
            var instance =
            {
                ACCOUNTS:{},
                getDB:function()
                {
                    return dbSystem.getDB();
                },
                clearCookie:function(res, uid)
                {
                    this.ACCOUNTS[uid].cookie = null;
                    res.clearCookie();
                },
                setCookie:function(res, uid, account)
                {
                    ////
                    res.cookie("user",{uid:uid},{maxAge:600000, httpOnly:false});

                    var _cookieTime = new Date();
                    var _key =
                    {
                        "uid":uid,
                        "time":_cookieTime.getTime()
                    };

                    account.cookie = _key;

                    var _key_value = JSON.stringify(_key);
                    var _secret_key = Secret.encode(Secret.TYPE.aes,uid + _ex_key, _key_value);

                    var _value = new Buffer(_secret_key);
                    _key_value = _value.toString('base64');

                    res.cookie("uid",{uid:uid},{maxAge:600000, httpOnly:false});
                    res.cookie("key",{key:_key_value},{maxAge:600000, httpOnly:false});
                },
                connected:function(req)
                {
                    var req_cookies = req.cookies;
                    var _cookies_uid = null;
                    if( req_cookies.uid )
                    {
                        _cookies_uid = req_cookies.uid.uid;
                    }

                    return this.checkCookies(req, _cookies_uid) == 1;
                },
                checkCookies:function(req, uid)
                {
                    var _check = 0;

                    const account = this.ACCOUNTS[uid];

                    if( account )
                    {
                        const _account_cookie = account.cookie;
                        var req_cookies = req.cookies;

                        var _cookies_uid = null;
                        var _cookies_key = null;

                        if( req_cookies.uid )
                        {
                            _cookies_uid = req_cookies.uid.uid;
                        }

                        if( req_cookies.key )
                        {
                            _cookies_key = req_cookies.key.key;
                        }

                        if( _cookies_uid  && _cookies_key && _cookies_uid == uid )
                        {
                            //check the cookies
                            var _str_key = new Buffer(_cookies_key, 'base64').toString();
                            var _decode_key = Secret.decode(Secret.TYPE.aes, uid + _ex_key, _str_key);

                            var _key_data = JSON.parse(_decode_key);

                            if( !_account_cookie )
                            {

                            }
                            else
                            {
                                const _time_check =
                                    [
                                        _account_cookie.time,
                                        _key_data.time
                                    ];

                                if(
                                    _account_cookie.uid == _key_data.uid
                                    && _time_check[0] - _time_check[1] == 0
                                )
                                {
                                    ////////
                                    //already login
                                    _check = 1;
                                }
                            }
                        }
                    }

                    return _check;
                },
                login:function(req, res, uid, account)
                {
                    var _result = 0;

                    ////
                    this.ACCOUNTS[uid] = account;
                    if( !this.ACCOUNTS[uid].data )
                    {
                        this.ACCOUNTS[uid].data = {};
                    }

                    ////
                    const _hr = this.checkCookies(req,uid);
                    switch(_hr)
                    {
                        case 0:
                        {
                            this.setCookie(res, uid, this.ACCOUNTS[uid]);
                            break;
                        }
                        case 1:
                        {
                            break;
                        }
                        case 2:
                        {
                            break;
                        }
                        case 3:
                        {
                            break;
                        }
                        default:
                        {
                            break;
                        }
                    }

                    return _result;

                }
            };

            return instance;
        }
    )();
