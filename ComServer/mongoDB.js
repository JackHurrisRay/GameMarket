/**
 * Created by Jack.L on 2017/4/29.
 */

var mongodb = require('mongodb');

module.exports =
    (
        function()
        {
            var _instance =
            {
                Server:null,
                Db:null,
                isConn:false,
                init:function()
                {
                    var SELF = this;
                    var DBServer = mongodb.Server;
                    var DataBase = mongodb.Db;

                    this.Server =
                        new DBServer('localhost', 1937, {auto_reconnect:true, 'connect-timeout':60000, 'max-wait-time':60000});

                    this.Db = new DataBase('ComData', this.Server);

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
                                    }
                                );
                            }
                            else
                            {
                                console.log('MongoDB failed :' + err.message);

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
