/**
 * Created by Jack.L on 2017/5/1.
 */


var net = require('net');
var base64 = require('./base64');
var ComServerToGameServer = require('./ComServerToGameServer');

module.exports =
    (
        function()
        {
            const TCP_PORT = 0628;
            var tcpServer = net.createServer();

            var _instance;
            _instance =
            {
                SOCKET_POOL:[],
                SOCKET_TO_GAME_SERVER:{},
                isInit:false,
                addSocket:function(socket)
                {
                    this.SOCKET_POOL.push(socket);
                },
                delSocket:function(socket)
                {
                    const index = this.SOCKET_POOL.indexOf(socket);
                    this.SOCKET_POOL.splice(index, 1);
                },
                run:function()
                {
                    tcpServer.on('listening',
                        this.start
                    );

                    tcpServer.on('connection',
                        this.connect
                    );

                    tcpServer.on('close',
                        function()
                        {
                            console.log('TCP SERVER CLOSED');
                        }
                    );

                    tcpServer.on('error',
                        function(err)
                        {
                            console.log('SERVER ERROR:' + err.message);
                        }
                    );

                    tcpServer.listen(TCP_PORT);
                },
                start:function()
                {
                    console.log('TCP SERVER RUNNING');
                    _instance.isInit = true;
                },
                connect:function(socket)
                {
                    var SELF = _instance;

                    SELF.addSocket(socket);

                    console.log('Client Join');

                    socket.on('data',
                        function(data)
                        {
                            SELF.data(socket, data);
                        }
                    );

                    socket.on('timeout',
                        function()
                        {
                            SELF.timeout(socket);
                        }
                    );

                    socket.on('close',
                        function()
                        {
                            SELF.close(socket);
                            SELF.delSocket(socket);
                        }
                    );
                },
                close:function(socket)
                {
                    console.log('Client Leave');
                },
                error:function(socket, error)
                {

                },
                data:function(socket, data)
                {
                    //console.log('Recv:' + data.toString());

                    var _resultData = null;

                    try
                    {
                        var _resultString = data.toString('utf8');
                        var _parseString = base64.transAscToStringArray( base64.decoder(_resultString) );

                        _resultData = JSON.parse(_parseString);
                    }
                    catch(e)
                    {
                        //throw e;
                    }

                    if( _resultData )
                    {
                        //
                        var _result = ComServerToGameServer.process_msg(_resultData, socket);

                        if( _result )
                        {
                            var _strData = JSON.stringify(_result);
                            var _msg = base64.encoder(_strData);
                            this.send(socket, _msg);
                        }
                        else
                        {
                            socket.end();
                        }
                    }
                    else
                    {
                        //
                        console.log('Not save client, must be closed');
                        socket.end();
                    }
                },
                timeout:function(socket)
                {

                },
                send:function(socket, msg)
                {
                    socket.write(msg);
                }
            };



            return _instance;
        }
    )();
