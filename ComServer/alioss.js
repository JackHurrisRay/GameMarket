/**
 * Created by Jack.L on 2017/5/4.
 */

var OSS = require('ali-oss').Wrapper;
var CO  = require('co');
var FS  = require('fs');

module.exports =
    (
        function()
        {
            var _instance =
            {
                REGION:"oss-cn-qingdao",
                ACCESS_KEY_ID:"LTAIU9RJOmXrAkwq",
                ACCESS_KEY_SECRET:"6PiyzTqeHpUtrpFpRrhINhlEevwGha",
                BUCKET_NAME:"huyukongjian",
                CLIENT:null,
                init:function()
                {
                    this.CLIENT = new OSS(
                        {
                            region:this.REGION,
                            accessKeyId:this.ACCESS_KEY_ID,
                            accessKeySecret:this.ACCESS_KEY_SECRET,
                            bucket:this.BUCKET_NAME
                        }
                    );
                },
                upload:function(path, data)
                {
                    var SELF = this;
                    var _fileName = "c:/temp/" + path;

                    var func_upload =
                        function(path, file)
                        {
                            var client = SELF.CLIENT;

                            client.useBucket(SELF.BUCKET_NAME);
                            client.put(path, file).then(
                                function(val)
                                {
                                    console.log("OSS upload result:" + val.res);
                                }
                            );
                        };

                    var buff = new Buffer(data,'base64');
                    FS.writeFile(_fileName, buff,
                        function( err )
                        {
                            if( err )
                            {
                                console.log(err.message);
                            }
                            else
                            {
                                func_upload(path, _fileName);
                            }
                        }
                    );
                }

            };

            _instance.init();
            return _instance;
        }
    )();


