/**
 * Created by Jack on 2017/5/1.
 */
var protocal = require('./protocal');

const COM_TRAND_UID_LENGTH = 16;

function CHECK_STRING_LIMIT(data, length)
{
    var check = false;
    if( data && typeof data == 'string' && data.length <= length )
    {
        check = true;
    }

    return check;
}

function CHECK_NUMBER(data)
{
    return data && typeof data == 'number';
}

function CHECK_OBJECT(data)
{
    return data && typeof data == 'object';
}

module.exports =
    function(system)
    {
        var _sys = system;
        var _db  = system.getDB();
        var checkDBError = protocal.checkDBError;

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
                                                if( checkDBError(error) )
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
                                    if( checkDBError(error) )
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
            }

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