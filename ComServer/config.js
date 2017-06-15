/**
 * Created by Jack.L on 2017/6/15.
 */

var httpRequest = require('./HttpRequest');

module.exports =
    (
        function()
        {
            var instance =
            {
                APP_INFO:
                {
                    "1":
                    {
                        "name":"douniu",
                        "path":"/douniu",
                        "client_url":"http://app.huyukongjian.cn/douniu/game.html"
                    },
                    "24":
                    {
                        "name":"math24",
                        "path":"/math24",
                        "client_url":"http://app.huyukongjian.cn/math24/game.html"
                    },
                    getClientHTML:function(app_id, callback_html)
                    {
                        var SELF = this;
                        var _currentApp = SELF[app_id];

                        if( _currentApp && _currentApp.name && _currentApp.path && _currentApp.client_url )
                        {
                            if( _currentApp.HTML == null )
                            {
                                httpRequest.http_getCode(
                                    _currentApp.client_url,
                                    function(html)
                                    {
                                        _currentApp.HTML = html;
                                        callback_html(_currentApp.HTML);
                                    }
                                );
                            }
                            else
                            {
                                callback_html(_currentApp.HTML);
                            }
                        }
                    }
                },
                WX_CONFIG:
                {
                    APP_ID:"wxaeae042027b2618f",
                    APP_SECRET:'059473bbfe7b7a999163c68a21682d2e',
                },
                WX_MENU:
                {
                    "button": [
                        {
                            "type": "click",
                            "name": "互娱空间",
                            "key": "KEY_MAIN",
                        },
                        {
                            "name": "系列产品",
                            "sub_button": [

                                {
                                    "type": "view",
                                    "name": "极品斗牛",
                                    "url": "http://huyukongjian.cn/auth?content=eyJnYW1lIjoxLCJyb29tIjowfQ==",
                                },
                                {
                                    "type": "view",
                                    "name": "极速24点",
                                    "url": "http://huyukongjian.cn/auth?content=eyJnYW1lIjoyNCwicm9vbSI6MH0=",
                                },
                            ],
                        },
                    ]
                }
            };

            return instance;
        }
    )();
