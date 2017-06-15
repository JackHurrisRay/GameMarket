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

                    if( body && body.content && body.name )
                    {
                        const name       = body.name;
                        const content_id = body.content_id;

                        const where = {name:name};

                        collection.findOne(where,
                            function(error, cursor)
                            {
                                if( !error )
                                {
                                    if( !cursor )
                                    {
                                        var contents = {};
                                        contents[content_id] = 1;

                                        collection.insert({name:name, contents:contents, createtime:(new Date()).getTime()});
                                    }
                                    else
                                    {
                                        var data = cursor;

                                        var contents = data.contents;

                                        if( contents[content_id] )
                                        {
                                            contents[content_id] += 1;
                                        }
                                        else
                                        {
                                            contents[content_id] = 1;
                                        }

                                        collection.update(where,
                                            {$set:{contents:contents, updatetime:(new Date()).getTime()}}
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
