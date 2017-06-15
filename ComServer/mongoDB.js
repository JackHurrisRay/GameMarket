/**
 * Created by Jack.L on 2017/4/29.
 */

var mongodb = require('mongodb');

module.exports =
    (
        function()
        {
            var DBServer = mongodb.Server;
            var DataBase = mongodb.Db;

            _Server = new DBServer('localhost', 1937, {auto_reconnect:true, 'connect-timeout':60000, 'max-wait-time':60000});
            _Db = new DataBase('ComData', _Server);

            var _instance =
            {
                Server:_Server,
                Db:_Db,
                isConn:false,
                init:function(callback_after_success)
                {
                    var SELF = this;

                    this.Db.open(
                        function(err,db)
                        {
                            if(!err)
                            {
                                console.log('MongoDB connected Successfull, then will be authenticated');

                                //
                                db.authenticate('JackAdmin','leitaoluan20101021',
                                    function(res)
                                    {
                                        SELF.isConn = true;
                                        console.log('Authenticated Successfully');

                                        if( callback_after_success )
                                        {
                                            callback_after_success();
                                        }
                                    }
                                );
                            }
                            else
                            {
                                console.log('MongoDB failed :' + err.message);
                                console.log('reconnect to mongodb...');

                                setTimeout(
                                    function()
                                    {
                                        SELF.init(callback_after_success);
                                    },
                                    3000
                                );

                            }
                        }
                    );

                    return;

                },
                getDB:function()
                {
                    return this.Db;
                }

            };

            return _instance;
        }
    )();
