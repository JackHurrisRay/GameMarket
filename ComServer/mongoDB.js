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

                    //const db_url = 'mongodb://root:Lei_Wei_1981@dds-2ze3e550ea9d5b742.mongodb.rds.aliyuncs.com:3717/database?authMechanism=MONGODB-CR&authSource=ComServerDB';
                    const  db_url = 'mongodb://root:Lei_Wei_1981@dds-2ze3e550ea9d5b741.mongodb.rds.aliyuncs.com:3717/admin?replicaSet=mgset-3986339';

                    this.Server =
                        //new DBServer('localhost', 27017, {auto_reconnect:true});
                        //new DBServer('dds-2ze3e550ea9d5b742.mongodb.rds.aliyuncs.com', 3717, {auto_reconnect:true});
                        mongodb.MongoClient;

                    /*
                    this.Db = new DataBase('ComServerDB', this.Server);

                    this.Db.open(
                        function(err,db)
                        {
                            if(!err)
                            {
                                console.log('MongoDB connected Successfull');
                                SELF.isConn = true;
                            }
                            else
                            {
                                console.log('MongoDB failed');
                            }
                        }
                    );
                    */

                    this.Server.connect(db_url,
                        function(err, db)
                        {
                            if(!err)
                            {
                                console.log('MongoDB connected Successfull');
                                SELF.isConn = true;
                            }
                            else
                            {
                                console.log('MongoDB failed');
                            }
                        }
                    );

                    while(!SELF.isConn)
                    {

                    }

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
