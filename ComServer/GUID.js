/**
 * Created by Jack.L on 2017/5/1.
 */

var GUID_POOL = {};

const GUID_TYPE =
{
    "number":['1','2','3','4','5','6','7','8','9','0'],
    "char-small":['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
    "char-big":['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
};

function CONCAT(type1, type2)
{
    return type1.concat(type2);
}

function CHECK_GUID_REPEAT(key, guid)
{
    var check = false;

    if( GUID_POOL.key )
    {
        for( var i in GUID_POOL.key )
        {
            if( GUID_POOL.key[i] == guid )
            {
                check = true;
                break;
            }
        }
    }

    return check;
};
function rand_type(typearray)
{
    var _timeFlag = new Date();
    var _flag     = _timeFlag.getTime();

    var _index = Math.floor(Math.random() * 1000 + _flag) ;
    var _posindex = _index % typearray.length;

    return typearray[ _posindex ];
}

var GUID =
    function(key, length, type)
    {
        if( !GUID_POOL.key )
        {
            GUID_POOL.key = {};
        }

        var check = true;
        var result = null;

        var _firstArray = [];
        for( var i in type )
        {
            if( type[i] != '0' )
            {
                _firstArray.push(type[i]);
            }
        }

        while(check)
        {
            var _guid = rand_type(_firstArray);
            for( var i=0; i<length-1; i++ )
            {
                _guid += rand_type(type);
            }

            if( !CHECK_GUID_REPEAT(key, _guid) )
            {
                result = _guid;
                break;
            }
        }

        return result;
    };

module.exports =
    function()
    {

    };
