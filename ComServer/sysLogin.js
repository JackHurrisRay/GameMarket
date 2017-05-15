/**
 * Created by Jack.L on 2017/4/29.
 */
var protocal = require('./protocal');

module.exports =
    function(system)
    {
        var checkDBError = protocal.checkDBError;
        var _sys = system;
        var _db  = _sys.getDB();
        var _collection = _db.collection('Account');
        _sys.COLLECTION = _collection;

        var _instance;

        _instance =
        {
            test:function(req,res)
            {
                res.send("Welcome to Jack.L's Server");
            },
            register:function(req,res)
            {
                var data = req.body;

                if( data.account_id != null && data.account_pwd )
                {
                    var where = {"ID":data.account_id};

                    _collection.findOne(where,
                        function(error, cursor)
                        {
                            if( checkDBError(res, error))
                            {
                                if( cursor == null )
                                {
                                    var _createTime = (new Date()).getTime();

                                    var _account_ex =
                                    {
                                        "Jurisdiction":0
                                    };

                                    var _account_content = {};

                                    var _UID = (Math.floor(_createTime)).toString()
                                        + (Math.floor(Math.random() * 10)).toString()
                                        + (Math.floor(Math.random() * 10)).toString()
                                        + (Math.floor(Math.random() * 10)).toString();

                                    var _account_data =
                                    {
                                        "UID":_UID,
                                        "ID":data.account_id,"PWD":data.account_pwd,"create_time":_createTime,
                                        "data":
                                        {
                                            "extern":_account_ex
                                        },
                                        "cookies":{},
                                        "content":{}
                                    };

                                    _collection.insert(_account_data,
                                        function(error, result)
                                        {
                                            if( checkDBError(res, error) )
                                            {
                                                protocal.send_ok(res);
                                            }
                                        }
                                    );
                                }
                                else
                                {
                                    protocal.send_error(res, protocal.error_code.error_register_account_exist);
                                }
                            }
                        }
                    );


                }
                else
                {
                    protocal.send_error(res, protocal.error_code.error_format);
                }
            },
            login:function(req,res)
            {
                var data = req.body;
                const uid = data.account_id;
                const hr_checkCookies = system.checkCookiesAndSession(req);

                if( hr_checkCookies == 1 )
                {
                    ////already login
                    protocal.send_error(res, protocal.error_code.error_login_already_in);
                }
                else if( data.account_id != null && data.account_pwd && hr_checkCookies == 0)
                {
                    var where = {"ID": data.account_id, "PWD":data.account_pwd};

                    var _findCollection =
                    _collection.findOne(where,
                        function(error, cursor) {
                            if (checkDBError(res, error)) {
                                if (cursor == null) {
                                    protocal.send_error(res, protocal.error_code.error_login_wrong_data);
                                }
                                else
                                {
                                    //account exist
                                    _sys.login(req, res, cursor);
                                    protocal.send_ok(res, cursor.data);
                                }
                            }
                        });

                }
                else
                {
                    protocal.send_error(res, protocal.error_code.error_wrongdata);
                }
            },
            logout:function(req,res)
            {
                var req_cookies = req.cookies;
                var _cookies_uid = null;
                if( req_cookies.account )
                {
                    _cookies_uid = req_cookies.account.uid;
                }

                if( _cookies_uid && system.checkCookiesAndSession(req) == 1 )
                {
                    system.clearCookie(res, _cookies_uid);
                    protocal.send_ok(res, null);
                }
                else
                {
                    protocal.send_error(res, protocal.error_code.error_login_already_out);
                }

            },
            login_by_wechat:function(req, res)
            {

            }
        };

        return _instance;
    }

