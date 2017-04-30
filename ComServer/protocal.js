/**
 * Created by Jack.L on 2017/4/29.
 */

module.exports =
{
    msg:
    {
        "error_code":0,
        "data":{}
    },
    error_code:
    {
        //common
        "error_unknown":100,
        "error_format":101,
        "error_wrongdata":102,

        "error_database":110,
        "error_notlogin":120,


        //login
        "error_register_account_exist":201,
        "error_login_wrong_data":202,

        "error_login_already_in":210,
        "error_login_already_out":211,
        "error_login_in_timeout":212,

    },
    send_ok:function(res, data)
    {
        var msg = {"error_code":0};

        if( data )
        {
            msg.data = data;
        }

        res.send(JSON.stringify(msg));
    },
    send_error:function(res, error)
    {
        var msg = {"error_code":0};
        msg.error_code = error;
        res.send(JSON.stringify(msg));
    },
    send_error_db:function(res, error_data)
    {
        var msg = {"error_code":0};
        msg.error_code = this.error_code.error_database;
        msg.error_data = error_data;
        res.send(JSON.stringify(msg));
    }
};

