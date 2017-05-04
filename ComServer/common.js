/**
 * Created by Jack.L on 2017/5/1.
 */

var $       = require('jquery');
var http    = require('http');
var fs      = require('fs');
var request = require('request');

module.exports =
{
    checkURLInvalid:function(url)
    {
        function checkURL(URL){
            var str=URL;
            //判断URL地址的正则表达式为:http(s)?://([\w-]+\.)+[\w-]+(/[\w- ./?%&=]*)?
            //下面的代码中应用了转义字符"\"输出一个字符"/"
            var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
            var objExp=new RegExp(Expression);
            if(objExp.test(str)==true){
                return true;
            }else{
                return false;
            }
        }

        return checkURL(url);
    },
    getImageFromURL:function(url, callback)
    {
        var img_data = "";

        try
        {
            var options =
            {
                hostname:'http://wx.qlogo.cn',
                port:80,
                path:'/mmopen/deSkYvMWWCicGdNoG1aHjxaickShBlAPu1BvND8kZibWp0moL5TcyElsrVoLHgeB13hrPADR8FnHdTlvR5NRSERMQ2BnNEib6z8a/0',
                method:'POST'
            };

            http.get(
                url,
                function(res)
                {
                    res.setEncoding('base64');

                    res.on('data',
                        function(data)
                        {
                            img_data += data;
                        }
                    );

                    res.on('end',
                        function()
                        {
                            callback(img_data, null);
                        }
                    );

                    res.on('error',
                        function(err)
                        {
                            callback(null, err);
                        }
                    );

                }
            );
        }
        catch (e)
        {
            callback(null, e);
            throw e;
        }


    }
};