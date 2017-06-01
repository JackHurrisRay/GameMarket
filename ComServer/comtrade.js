/**
 * Created by Jack on 2017/5/1.
 */
var protocal = require('./protocal');

////////
const COM_TRAND_UID_LENGTH = 16;

function CHECK_STRING_LIMIT(data, length)
{
    var check = false;
    if( data && typeof data == 'string' && data.length <= length )
    {
        check = true;
    }

    if( !check )
    {
        console.log("error check parament of CHECK_STRING_LIMIT:" + data);
    }

    return check;
}

function CHECK_NUMBER(data)
{
    var check = data && typeof data == 'number';

    if( !check )
    {
        console.log("error check parament of CHECK_NUMBER:" + data);
    }

    return check;
}

function CHECK_OBJECT(data)
{
    var check = data && typeof data == 'object';

    if( !check )
    {
        console.log("error check parament of CHECK_OBJECT:" + data);
    }

    return check;
}

module.exports =
    function(system)
    {
        var _sys = system;
        var _db  = system.getDB();
        var checkDBError = protocal.checkDBError;

        var collection_account = _db.collection('Account');
        var collection_transactions = _db.collection('Transactions');

        var _instance =
        {
            COLLECTION_TRADE:_db.collection('Content'),
            CONTENT_ARRAY:{},
            isInit:false,
            init:function()
            {
                var SELF = this;
                var content_array = this.CONTENT_ARRAY;
                var dataArray = [];

                var find =
                this.COLLECTION_TRADE.find({},
                    function(error, cursor)
                    {
                        var _find = find;
                        cursor.forEach(
                            function(doc)
                            {
                                var _cursor = cursor;
                                const UID = doc.UID;

                                content_array[UID] = doc;
                                dataArray.push(doc);

                                if( dataArray.length == _cursor.cursorState.documents.length )
                                {
                                    console.log('TRADE DATA INIT COMPLETED');
                                    SELF.isInit = true;
                                }
                            }
                        );
                    }
                );
            },
            check_Jurisdiction:function(req, res)
            {
                var _check = false;
                const _account = req.__account;

                if( !_account )
                {
                    protocal.send_error(res, protocal.error_code.error_noaccount);
                }
                else
                {
                    if( _account.data.extern.Jurisdiction != 10000 )
                    {
                        protocal.send_error(res, protocal.error_code.error_right_limited);
                    }
                    else
                    {
                        _check = true;
                    }
                }

                return _check;
            },
            create_content:function(req,res)
            {
                var SELF = this;
                if( this.check_Jurisdiction(req, res) )
                {
                    const data = req.body;

                    var check = false;
                    if( data && CHECK_STRING_LIMIT(data.name, 32) &&  CHECK_STRING_LIMIT(data.type, 16) &&  CHECK_STRING_LIMIT(data.info, 1024) && CHECK_OBJECT(data.GOLD) && CHECK_NUMBER(data.init_gold))
                    {
                        check = true;
                    }

                    var time = 0;
                    var _UID = "";

                    if( check )
                    {
                        time = (new Date()).getTime();

                        _UID = (Math.floor(time)).toString()
                            + (Math.floor(Math.random() * 10)).toString()
                            + (Math.floor(Math.random() * 10)).toString()
                            + (Math.floor(Math.random() * 10)).toString();

                        if( _UID.length != COM_TRAND_UID_LENGTH )
                        {
                            check = false;
                        }
                    }

                    if( check )
                    {
                        var _content = data;

                        _content.create_time = time;
                        _content.UID = _UID;

                        this.COLLECTION_TRADE.insert(_content,
                            function(error, result)
                            {
                                if( checkDBError(res, error) )
                                {
                                    protocal.send_ok(res, {UID:_UID});
                                    SELF.CONTENT_ARRAY[_UID] = _content;
                                }
                            }
                        );
                    }
                    else
                    {
                        protocal.send_error(res, protocal.error_code.error_wrongdata);
                    }
                }
            },
            delete_content:function(req, res)
            {
                var SELF = this;
                ////
                if( this.check_Jurisdiction(req, res) )
                {
                    const data = req.body;

                    if( data && CHECK_STRING_LIMIT(data.UID, COM_TRAND_UID_LENGTH) && data.UID.length == COM_TRAND_UID_LENGTH  )
                    {
                        const UID  = data.UID;

                        var where = {UID:UID};
                        this.COLLECTION_TRADE.remove(
                            where,
                            function(error, result)
                            {
                                if( checkDBError(res, error) )
                                {
                                    protocal.send_ok(res);
                                    SELF.CONTENT_ARRAY[UID] = null;
                                }
                            }
                        );
                    }
                    else
                    {
                        protocal.send_error(res, protocal.error_code.error_wrongdata);
                    }
                }
            },
            get_all_content:function(req, res)
            {
                var _data = [];
                for( var i in this.CONTENT_ARRAY )
                {
                    if( this.CONTENT_ARRAY[i] )
                    {
                        _data.push(this.CONTENT_ARRAY[i]);
                    }
                }

                protocal.send_ok(res, _data);
            },
            get_content:function(req, res)
            {
                var account = req.__account;
                var collection = req.__collection;
                const data = req.body;

                if( data && CHECK_STRING_LIMIT(data.content_id, COM_TRAND_UID_LENGTH) )
                {
                    if( account.content && account.content[data.content_id] )
                    {
                        var content = account.content[data.content_id];
                        protocal.send_ok(res, content);
                    }
                    else
                    {
                        protocal.send_error(res, protocal.error_code.error_nodata);
                    }
                }
                else
                {
                    protocal.send_error(res, protocal.error_code.error_wrongdata);
                }
            },
            update_content:function(req,res)
            {
                if( this.check_Jurisdiction(req, res) )
                {
                    const data = req.body;

                    var check = false;
                    if( data && CHECK_STRING_LIMIT(data.name, 32) &&  CHECK_STRING_LIMIT(data.type, 16) &&  CHECK_STRING_LIMIT(data.info, 1024) && CHECK_OBJECT(data.GOLD) && CHECK_NUMBER(data.init_gold)
                        && CHECK_STRING_LIMIT(data.UID, COM_TRAND_UID_LENGTH) && data.UID.length == COM_TRAND_UID_LENGTH )
                    {
                        check = true;
                    }

                    if( check )
                    {
                        const where = {UID:data.UID};
                        var SELF = this;

                        var callback_update =
                            function()
                            {
                                SELF.COLLECTION_TRADE.update(where,
                                    {$set:{name:data.name,type:data.type, info:data.info, GOLD:data.GOLD, init_gold:data.init_gold }},
                                    function(error, result)
                                    {
                                        if( checkDBError(res, error) )
                                        {
                                            const UID = data.UID;
                                            protocal.send_ok(res, data);

                                            SELF.CONTENT_ARRAY[UID].name = data.name;
                                            SELF.CONTENT_ARRAY[UID].type = data.type;
                                            SELF.CONTENT_ARRAY[UID].info = data.info;
                                            SELF.CONTENT_ARRAY[UID].GOLD = data.GOLD;
                                        }
                                    }
                                );
                            };

                        this.COLLECTION_TRADE.findOne(where,
                            function(error, cursor)
                            {
                                if( checkDBError(res, error))
                                {
                                    if (cursor == null)
                                    {
                                        protocal.send_error(res, protocal.error_code.error_notfinddata);
                                    }
                                    else
                                    {
                                        callback_update();
                                    }
                                }
                            }
                        );
                    }
                    else
                    {
                        protocal.send_error(res, protocal.error_code.error_wrongdata);
                    }
                }
            },
            applicate_content:function(req, res)
            {
                var account = req.__account;
                var collection = req.__collection;

                var data = req.body;

                if( data && CHECK_STRING_LIMIT(data.content_id, COM_TRAND_UID_LENGTH) && data.content_id.length == COM_TRAND_UID_LENGTH )
                {
                    /////////
                    if( account.content != null && account.content[data.content_id] )
                    {
                        var content = account.content[data.content_id];
                        protocal.send_ok(res, content);
                    }
                    else
                    {
                        if( !account.content )
                        {
                            account.content = {};
                        }

                        const content_id = data.content_id;
                        var content = account.content;

                        var where = {UID:content_id};

                        this.COLLECTION_TRADE.findOne(
                            where,
                            function(err,cursor)
                            {
                                if( checkDBError(res, err) )
                                {
                                    if (cursor == null) {
                                        protocal.send_error(res, protocal.error_code.error_login_wrong_data);
                                    }
                                    else
                                    {
                                        content[content_id] = {UID:content_id, GOLD:cursor.init_gold, level:0};
                                        collection.update({ID:account.ID},{$set:{content: content}},
                                            function(error, data)
                                            {
                                                if( checkDBError(res, error) )
                                                {
                                                    protocal.send_ok(res, content[content_id]);
                                                }
                                            }
                                        );
                                    }
                                }
                            }
                        );
                    }

                    ////////
                    account.update_content =
                        function()
                        {
                            collection.update({ID:this.ID},{$set:{content: this.content}},
                                function(error, data)
                                {
                                }
                            );
                        };

                }
                else
                {
                    protocal.send_error(res, protocal.error_code.error_wrongdata);
                }
            },
            payfor_content:function(req, res)
            {
                var account = req.__account;
                var collection = req.__collection;

                var data = req.body;

                ////////
                if(
                    data && CHECK_STRING_LIMIT(data.content_id, COM_TRAND_UID_LENGTH) && data.content_id.length == COM_TRAND_UID_LENGTH
                    && CHECK_NUMBER(data.cost_gold) && data.cost_gold > 0
                )
                {
                    ////////
                    var content = account.content[data.content_id];

                    if( content )
                    {
                        if( content.GOLD >= data.cost_gold )
                        {
                            content.GOLD = content.GOLD - data.cost_gold;

                            collection.update({ID:account.ID},{$set:{content: account.content}},
                                function(error, data)
                                {
                                    if( checkDBError(res, error) )
                                    {
                                        protocal.send_ok(res, content);
                                    }
                                }
                            );
                        }
                        else
                        {
                            protocal.send_error(res, protocal.error_code.error_costnotenough);
                        }
                    }
                    else
                    {
                        protocal.send_error(res, protocal.error_code.error_content_notexist);
                    }
                }
                else
                {
                    protocal.send_error(res, protocal.error_code.error_wrongdata);
                }
            },
            update_transactions:function(content_id, master_id, account_id, gold_value, info)
            {
                const transactions =
                {
                    transaction_time:new Date(),
                    content_id:content_id,
                    master_id:master_id,
                    account_id:account_id,
                    gold_value:gold_value,
                    info:info
                };

                collection_transactions.insert(transactions,
                    function(error, result)
                    {
                    }
                );

                return transactions;
            },
            recharge_content_by_admin:function(req, res)
            {
                if( !this.check_Jurisdiction(req, res) )
                {
                    return;
                }

                const account = req.__account;
                var SELF = this;
                const data = req.body;

                ////////
                if(
                    data && CHECK_STRING_LIMIT(data.content_id, COM_TRAND_UID_LENGTH) && data.content_id.length == COM_TRAND_UID_LENGTH
                    && CHECK_NUMBER(data.gold_add) && data.gold_add > 0 && data.account_id
                )
                {
                    ////////
                    const where = {"UID":data.account_id};
                    const add_gold = data.gold_add;

                    collection_account.findOne(where,
                        function(error, cursor)
                        {
                            if( checkDBError(res, error) )
                            {
                                if( cursor != null && cursor.UID == data.account_id && cursor.content[data.content_id] )
                                {
                                    var contents = cursor.content;
                                    var content = contents[data.content_id];

                                    if( content.GOLD != null && content.GOLD != undefined )
                                    {
                                        const _old_gold_value = content.GOLD;
                                        content.GOLD += add_gold;

                                        collection_account.update(where,{$set:{content: contents}},
                                            function(error, data_update)
                                            {
                                                if( checkDBError(res, error) )
                                                {
                                                    var _info = "Transaction by ";

                                                    if( account.wx_data && account.wx_data.nickname )
                                                    {
                                                        _info += account.wx_data.nickname;
                                                    }

                                                    _info += "(ID:" + account.UID + "):  account ";

                                                    if( cursor.wx_data && cursor.wx_data.nickname )
                                                    {
                                                        _info += cursor.wx_data.nickname;
                                                    }

                                                    _info += "(ID:" + cursor.UID + ") GOLD change ";
                                                    _info += _old_gold_value.toString() + " -> " + content.GOLD.toString() + " (+" + add_gold.toString() + ")";

                                                    const transaction_result = SELF.update_transactions(data.content_id, account.UID, data.account_id, add_gold, _info);

                                                    protocal.send_ok(res, transaction_result);
                                                }
                                            }
                                        );
                                    }
                                    else
                                    {
                                        protocal.send_error(res, protocal.error_code.error_notfinddata);
                                    }

                                }
                                else
                                {
                                    protocal.send_error(res, protocal.error_code.error_notfinddata);
                                }
                            }
                        }
                    );
                }
                else
                {
                    protocal.send_error(res, protocal.error_code.error_wrongdata);
                }
            },
            content_option:function(req, res)
            {
                ////////
                var account = req.__account;
                var collection = req.__collection;

                var data = req.body;

                if(
                    data && CHECK_STRING_LIMIT(data.content_id, COM_TRAND_UID_LENGTH) && data.content_id.length == COM_TRAND_UID_LENGTH
                    && typeof data.option_name == 'string'
                )
                {
                    ////////
                    var content = account.content[data.content_id];

                    if( content )
                    {
                        ////////
                        if( !content.options )
                        {
                            content.options = {};
                        }

                        ////////
                        if( data.option_value || data.option_value == false || data.option_value == 0 )
                        {
                            content.options[data.option_name] = data.option_value;

                            collection.update({ID:account.ID},{$set:{content: account.content}},
                                function(error, result)
                                {
                                    if( checkDBError(res, error) )
                                    {
                                        protocal.send_ok(res, {"option_name":data.option_name, "option_value":data.option_value});
                                    }
                                }
                            );
                        }
                        else
                        {
                            var _option_value = content.options[data.option_name];

                            protocal.send_ok(res, {"option_name":data.option_name, "option_value":(_option_value | _option_value==false | _option_value==0)?_option_value:null});
                        }
                    }
                    else
                    {
                        protocal.send_error(res, protocal.error_code.error_content_notexist);
                    }
                }
                else
                {
                    protocal.send_error(res, protocal.error_code.error_wrongdata);
                }
            },

        };

        _sys.waitFor(
            function()
            {
                return _sys.isDBConn();
            },
            function()
            {
                _instance.init();
            }
        );

        return _instance;
    };