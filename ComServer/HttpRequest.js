/**
 * Created by Jack.L on 2017/5/24.
 */

var https = require('https');
var http  = require('http');
var iconv = require("iconv-lite");

module.exports =
{
    https_get:function(url, callback_success, callback_error)
    {
        var _http  = https;
        var _iconv = iconv;

        _http.get(url,
            function(req, res)
            {
                var datas = [];
                var size  = 0;

                req.on('data',
                    function(data)
                    {
                        datas.push(data);
                        size += data.length;
                    }
                );

                req.on('end',
                    function()
                    {
                        var buff = Buffer.concat(datas, size);
                        var result = _iconv.decode(buff, "utf8");//转码//var result = buff.toString();//不需要转编码,直接tostring

                        var _resultObj = null;

                        try
                        {
                            _resultObj = JSON.parse(result);
                        }
                        catch (e)
                        {

                        }

                        callback_success( _resultObj );

                    }
                );

                req.on('error',
                    function(error)
                    {
                        console.log('error:' + error.message);
                        callback_error(error);
                    }
                );

            }
        );
    },
    http_getCode:function(_url, _callback_finished)
    {
        var http = require('http');
        var fs = require('fs');

        // 要抓取的网页地址
        var url = _url;

        http.get(url, function(res) {
            var html = '';
            res.on('data', function(data) {
                html += data;
            });

            res.on('end', function() {

                /*
                // 将抓取的内容保存到本地文件中
                fs.writeFile('index.html', html, function(err) {
                    if (err) {
                        console.log('出现错误!');
                    }
                    console.log('已输出至index.html中');
                })
                */

                if( _callback_finished )
                {
                    _callback_finished(html);
                }
            });

        }).on('error', function(err) {
            console.log('错误信息：' + err);
        })
    }
};