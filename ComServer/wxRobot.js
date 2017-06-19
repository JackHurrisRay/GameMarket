/**
 * Created by Jack.L on 2017/6/19.
 */

var request = require('http');
var urlSys = require('url');
var iconv  = require('iconv-lite');

module.exports =
    (
        function()
        {
            var instance =
            {
                chatToRobot:function( id, text, callback )
                {
                    const _msgdata =
                    {
                        "key":    "b0282038f2a34fbabcd0593ed52be2c9",
                        "info":   text,
                        "loc":    "北京市中关村",
                        "userid": id
                    };

                    const postdata = new Buffer( JSON.stringify(_msgdata), 'utf8' );

                    var options  = urlSys.parse('http://www.tuling123.com/openapi/api');
                    options.port = 80;
                    options.method = 'POST';
                    options.async  = true;
                    options.crossDomain = true;

                    options.headers =
                    {
                        'Content-Type': 'application/json; encoding=utf-8',
                        'Content-Length':postdata.length
                    };

                    var req = request.request(options,
                        function(res)
                        {
                            var datas = [];
                            var size  = 0;

                            res.on('data',
                                function(data)
                                {
                                    datas.push(data);
                                    size += data.length;
                                }
                            );

                            res.on('end',
                                function()
                                {
                                    var buff = Buffer.concat(datas, size);
                                    var result = iconv.decode(buff, "utf8");//转码//var result = buff.toString();//不需要转编码,直接tostring

                                    var _resultObj = null;

                                    try
                                    {
                                        _resultObj = JSON.parse(result);
                                    }
                                    catch (e)
                                    {

                                    }

                                    if( callback )
                                    {
                                        callback( _resultObj );
                                    }
                                }
                            );

                            res.on('error',
                                function()
                                {

                                }
                            );
                        }
                    );

                    req.write(postdata);
                    req.end();

                }
            };

            return instance;
        }
    )();

