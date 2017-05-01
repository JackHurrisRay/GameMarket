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
                COLLECTION:null,
                getDB:function()
                {
                    return dbSystem.getDB();
                },
                isDBConn:function()
                {
                    return dbSystem.isConn;
                },
                waitFor:function(condition, callback)
                {
                    var _func =
                    function()
                    {
                        var _check = condition();
                        var _callback = callback;

                        if( _check )
                        {
                            callback();
                        }
                        else
                        {
                            setTimeout(
                                _func,
                                600
                            );
                        }
                    };

                    _func();
                },
                saveCookies:function(uid) {
                    var account = this.ACCOUNTS[uid];

                    if (account)
                    {
                        this.COLLECTION.update({UID:uid},{$set:{cookies:account.cookies}},
                            function(error,result)
                            {
                                return;
                            }
                        );
                    }

                },
                clearCookie:function(res, uid)
                {
                    this.ACCOUNTS[uid].cookies = null;
                    res.clearCookie();
                },
                setCookie:function(res, account)
                {
                    ////
                    res.clearCookie();

                    ////
                    var _cookieTime = new Date();
                    var _key =
                    {
                        "uid":account.UID,
                        "id":account.ID,
                        "time":Math.floor( _cookieTime.getTime() )
                    };

                    account.cookies = _key;

                    var _key_value = JSON.stringify(_key);
                    var _secret_key = Secret.encode(Secret.TYPE.aes,account.UID + _ex_key, _key_value);

                    var _value = new Buffer(_secret_key);
                    _key_value = _value.toString('base64');

                    res.cookie("account",{uid:account.UID, id:account.ID, key:_key_value},{maxAge:600000, httpOnly:false});
                },
                connected:function(req)
                {
                    ////////
                    var req_cookies = req.cookies;
                    var _cookies_uid = null;
                    if( req_cookies && req_cookies.uid )
                    {
                        _cookies_uid = req_cookies.uid.uid;
                    }

                    ////////
                    if( _cookies_uid == null )
                    {
                        return -1;
                    }
                    else
                    {
                        return this.checkCookies(req) == 1;
                    }
                },
                checkCookies:function(req)
                {
                    var _check = 0;

                    ////////
                    var req_cookies = req.cookies;
                    var _cookies_uid = null;
                    var _cookies_id  = null;
                    var _cookies_key = null;

                    if( req_cookies && req_cookies.account )
                    {
                        _cookies_uid = req_cookies.account.uid;
                        _cookies_key = req_cookies.account.key;
                        _cookies_id  = req_cookies.account.id;
                    }

                    if( _cookies_uid && _cookies_key && _cookies_id )
                    {
                        const uid = _cookies_uid;
                        const account = this.ACCOUNTS[uid];

                        if( account )
                        {
                            const _account_cookie = account.cookies;

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
                                    && _time_check[0] == _time_check[1]
                                    && _account_cookie.id == _key_data.id
                                )
                                {
                                    ////////
                                    //already login
                                    _check = 1;

                                    ////////
                                    req.__account = account;
                                    req.__collection = this.COLLECTION;
                                }
                            }
                        }
                    }

                    return _check;
                },
                login:function(req, res, account_data)
                {
                    var _result = 0;

                    ////
                    const uid = account_data.UID;
                    this.ACCOUNTS[uid] = account_data;

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
                            this.setCookie(res, this.ACCOUNTS[uid]);
                            this.saveCookies(uid);
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
