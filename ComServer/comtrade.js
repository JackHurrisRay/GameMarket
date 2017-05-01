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

                this.COLLECTION_TRADE.find({},
                    function(error, cursor)
                    {
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
                if( this.check_Jurisdiction(req, res) )
                {
                    const data = req.body;

                    var check = false;
                    if(  CHECK_STRING_LIMIT(data.name, 32) &&  CHECK_STRING_LIMIT(data.type, 16) &&  CHECK_STRING_LIMIT(data.info, 1024) && CHECK_OBJECT(data.GOLD) )
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
                                    this.CONTENT_ARRAY[_UID] = _content;
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
                ////
                if( this.check_Jurisdiction(req, res) )
                {
                    const data = req.body;

                    if( CHECK_STRING_LIMIT(data.UID, COM_TRAND_UID_LENGTH) && data.UID.length == COM_TRAND_UID_LENGTH  )
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
                                    this.CONTENT_ARRAY[UID] = null;
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
            update_content:function(req,res)
            {
                if( this.check_Jurisdiction(req, res) )
                {
                    const data = req.body;

                    var check = false;
                    if(   CHECK_STRING_LIMIT(data.name, 32) &&  CHECK_STRING_LIMIT(data.type, 16) &&  CHECK_STRING_LIMIT(data.info, 1024) && CHECK_OBJECT(data.GOLD)
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
                                    {$set:{name:data.name,type:data.type, info:data.info, GOLD:data.GOLD }},
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