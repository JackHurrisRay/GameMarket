/**
 * Created by Jack.L on 2017/5/8.
 */

var common = require('./common');
var system = require('./serverSystem');

const ENUM_MSG_TYPE =
{
    ////
    "ENUM_C2S_HEART":2010,
    "ENUM_S2C_HEART":2015,

    ////
    "ENUM_C2S_CONNECT":1000,
    "ENUM_C2S_REQUEST_GOLD":1001,
    "ENUM_C2S_COST_GOLD":1002,

    ////
    "ENUM_S2C_CONNECT":2000,
    "ENUM_S2C_REQUEST_GOLD":2001,
    "ENUM_S2C_COST_GOLD":2002
};

const ENUM_COM_RESULT_STATUS =
{
    "S_OK":0,
    "error_unknown":255,
    "error_noprotocal":100,
    "error_nodata":101,
    "error_notenough":102,
};

const protocal_c2s =
{
    "MSG_C2S_HEART":
    {
        "protocal":ENUM_MSG_TYPE.ENUM_C2S_HEART,
    },
    "MSG_C2S_CONNECT":
    {
        "protocal":ENUM_MSG_TYPE.ENUM_C2S_CONNECT,
        "COM SERVER":"Jack.L's Server",
        "content_id":0
    },
    "MSG_C2S_REQUEST_GOLD":
    {
        "protocal":ENUM_MSG_TYPE.ENUM_C2S_REQUEST_GOLD,
        "content_id":0,
        "player_id":0
    },
    "MSG_C2S_COST_GOLD":
    {
        "protocal":ENUM_MSG_TYPE.ENUM_C2S_COST_GOLD,
        "content_id":0,
        "player_id":0,
        "player_diamond":0
    }
};

const protocal_s2c =
{
    "MSG_S2C_HEART":
    {
        "protocal":ENUM_MSG_TYPE.ENUM_S2C_HEART,
    },
    "MSG_S2C_CONNECT":
    {
        "protocal":ENUM_MSG_TYPE.ENUM_S2C_CONNECT,
        "status":0
    },
    "MSG_S2C_REQUEST_GOLD":
    {
        "protocal":ENUM_MSG_TYPE.ENUM_S2C_REQUEST_GOLD,
        "status":0,
        "player_id":0,
        "player_diamond":0
    },
    "MSG_S2C_COST_GOLD":
    {
        "protocal":ENUM_MSG_TYPE.ENUM_S2C_COST_GOLD,
        "status":0,
        "player_id":0,
        "player_diamond":0
    },
    "MSG_S2C_ERROR":
    {
        "protocal":0,
        "status":ENUM_COM_RESULT_STATUS.error_unknown
    }
};



module.exports =
    (
        function()
        {
            var instance =
            {
                SOCKET_POOL:{},
                check_msg_after_login:function(socket)
                {
                    var check = false;

                    ////////
                    for( var i in this.SOCKET_POOL )
                    {
                        var socket_object = this.SOCKET_POOL[i];

                        if( socket_object.socket == socket )
                        {
                            check = true;
                            break;
                        }
                    }

                    return check;
                },
                process_msg:function( recvData, socket )
                {
                    if( this.check_msg_protocal(recvData) )
                    {
                        const protocal = recvData["protocal"];

                        switch(protocal)
                        {
                            case ENUM_MSG_TYPE.ENUM_C2S_CONNECT:
                            {
                                if( recvData.content_id )
                                {
                                    if( this.SOCKET_POOL[recvData.content_id] )
                                    {
                                        this.SOCKET_POOL[recvData.content_id].socket.end();
                                    }

                                    var socket_object = {};
                                    this.SOCKET_POOL[recvData.content_id] = socket_object
                                    socket_object.content_id = recvData.content_id;
                                    socket_object.socket = socket;

                                    var msg = common.extendDeep(protocal_s2c.MSG_S2C_CONNECT);
                                    return msg;
                                }
                                else
                                {
                                    socket.end();
                                }

                                break;
                            }
                            case ENUM_MSG_TYPE.ENUM_C2S_HEART:
                            {
                                if( !this.check_msg_after_login(socket) )
                                {
                                    socket.end();
                                }
                                else
                                {
                                    var msg = common.extendDeep(protocal_s2c.MSG_S2C_HEART);
                                    return msg;
                                }

                                break;
                            }
                            case ENUM_MSG_TYPE.ENUM_C2S_REQUEST_GOLD:
                            {
                                if( !this.check_msg_after_login(socket) )
                                {
                                    socket.end();
                                }
                                else
                                {
                                    var msg = common.extendDeep(protocal_s2c.MSG_S2C_REQUEST_GOLD);

                                    if(recvData.content_id && recvData.player_id )
                                    {
                                        var socket_obj = this.SOCKET_POOL[recvData.content_id];
                                        var account    = system.ACCOUNTS[recvData.player_id];
                                        var content    = null;

                                        if( account )
                                        {
                                            content = account.content[recvData.content_id];
                                        }

                                        if( socket_obj && account && content )
                                        {
                                            msg.player_diamond = content.GOLD;
                                        }
                                    }

                                    return msg;
                                }

                                break;
                            }
                            case ENUM_MSG_TYPE.ENUM_C2S_COST_GOLD:
                            {
                                if( !this.check_msg_after_login(socket) )
                                {
                                    socket.end();
                                }
                                else
                                {
                                    var msg = common.extendDeep(protocal_s2c.MSG_S2C_COST_GOLD);
                                    msg.status = -1;

                                    if(recvData.content_id && recvData.player_id )
                                    {
                                        var socket_obj = this.SOCKET_POOL[recvData.content_id];
                                        var account    = system.ACCOUNTS[recvData.player_id];
                                        var content    = null;
                                        const cost       = recvData.player_diamond;

                                        if( account )
                                        {
                                            content = account.content[recvData.content_id];
                                        }

                                        if( socket_obj && account && content )
                                        {
                                            if( content.GOLD >= cost )
                                            {
                                                content.GOLD = content.GOLD - cost;

                                                msg.player_diamond = content.GOLD;
                                                msg.status = 0;

                                                account.update_content();
                                            }
                                            else
                                            {
                                                msg.player_diamond = content.GOLD;
                                                msg.status = 1;
                                            }
                                        }
                                    }

                                    return msg;
                                }

                                break;
                            }
                            default:
                            {
                                if( !this.check_msg_after_login(socket) )
                                {
                                    socket.end();
                                }
                                else
                                {
                                    var msg = common.extendDeep(protocal_s2c.MSG_S2C_ERROR);
                                    msg.status = ENUM_COM_RESULT_STATUS.error_noprotocal;
                                    return msg;
                                }

                                break;
                            }
                        }

                    }
                    else
                    {
                        var msg = common.extendDeep(protocal_s2c.MSG_S2C_ERROR);
                        msg.status = ENUM_COM_RESULT_STATUS.error_noprotocal;
                        return msg;
                    }

                    return null;
                },
                check_msg_protocal:function( recvData )
                {
                    var check = false;

                    if( recvData && recvData["protocal"] && typeof recvData["protocal"] == "number" )
                    {
                        check = true;
                    }

                    return check;
                }
            };

            return instance;
        }
    )();