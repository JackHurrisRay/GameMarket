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
                                    var _account_data = {"ID":data.account_id,"PWD":data.account_pwd,"create_time":new Date()};
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
                var request  = req;
                var response = res;

                var data = req.body;

                if( data.account_id != null && data.account_pwd )
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

                                    res.cookie("user",{uid:data.account_id},{maxAge:600000, httpOnly:false})

                                    system.login(cursor);
                                    protocal.send_ok(res, cursor);
                                }
                            }
                        });

                }
            },
            logout:function(req,res)
            {
                res.clearCookie();
                protocal.send_ok(res, null);
            },
        };

        return _instance;
    }

