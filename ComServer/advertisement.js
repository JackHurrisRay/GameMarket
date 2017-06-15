/**
 * Created by Jack.L on 2017/6/16.
 */
var mongodb = require('./mongoDB');
var DB = mongodb.getDB();

module.exports =
    (
        function()
        {
            var collection = DB.collection('Advertisement');

            var instance =
            {
                listenTouch:function(req, res)
                {
                    const body = req.body;

                    if( body && body.name )
                    {
                        const name  = body.name;
                        const where = {name:name};

                        collection.findOne(where,
                            function(error, cursor)
                            {
                                if( !error )
                                {
                                    if( !cursor )
                                    {
                                        collection.insert({name:name, touchtimes:1, createtime:(new Date()).getTime()});
                                    }
                                    else
                                    {
                                        var data = cursor;
                                        data.touchtimes += 1;

                                        collection.update(where,
                                            {$set:{touchtimes:data.touchtimes, updatetime:(new Date()).getTime()}}
                                        );
                                    }
                                }
                            }
                        );
                    }

                    res.end('{status:0}');
                }
            };

            return instance;
        }
    )();
