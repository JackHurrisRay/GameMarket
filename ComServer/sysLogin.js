/**
 * Created by Jack.L on 2017/4/29.
 */
var protocal = require('./protocal');

function checkDBError(res, error)
{
    var check = false;
    if( !error )
    {
        check = true;
    }
    else
    {
        protocal.send_error_db(res, error);
    }

    return check;
}

module.exports =
    function(system)
    {
        var _sys = system;
        var _db  = _sys.getDB();
        var _collection = _db.collection('Account');

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
                                    var _createTime = new Date();
                                    var _account_data = {"ID":data.account_id,"PWD":data.account_pwd,"create_time":_createTime.getTime()};
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
                const hr_checkCookies = system.checkCookies(req, uid);

                if( hr_checkCookies == 1 )
                {
                    ////already login
                    protocal.send_error(res, protocal.error_code.error_login_already_in);
                }
                else if( data.account_id != null && data.account_pwd && hr_checkCookies == 0)
                {
                    var where = {"ID": data.account_id, "PWD":data.account_pwd};

                    _collection.findOne(where,
                        function(error, cursor) {
                            if (checkDBError(res, error)) {
                                if (cursor == null) {
                                    protocal.send_error(res, protocal.error_code.error_login_wrong_data);
                                }
                                else
                                {
                                    //account exist
                                    system.login(req, res, uid, cursor);
                                    protocal.send_ok(res, cursor.data);
                                }
                            }
                        });

                }
            },
            logout:function(req,res)
            {
                var req_cookies = req.cookies;
                var _cookies_uid = null;
                if( req_cookies.uid )
                {
                    _cookies_uid = req_cookies.uid.uid;
                }

                if( _cookies_uid && system.checkCookies(req, _cookies_uid) == 1 )
                {
                    system.clearCookie(res, _cookies_uid);
                    protocal.send_ok(res, null);
                }
                else
                {
                    protocal.send_error(res, protocal.error_code.error_login_already_out);
                }

            },
        };

        return _instance;
    }

