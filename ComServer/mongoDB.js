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
                init:function()
                {
                    var DBServer = mongodb.Server;
                    var DataBase = mongodb.Db;

                    this.Server = new DBServer('localhost', 27017, {auto_reconnect:true});
                    this.Db = new DataBase('ComServerDB', this.Server);

                    this.Db.open(
                        function(err,db)
                        {
                            if(!err)
                            {
                                console.log('MongoDB connected Successfull');
                            }
                        }
                    );
                },
                getDB:function()
                {
                    return this.Db;
                }
            };

            return _instance;
        }
    )();
