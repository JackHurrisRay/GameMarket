/**
 * Created by Jack.L on 2017/4/30.
 */

var crypto = require('crypto');

exports.TYPE =
{
    "aes":"aes-256-cbc",
    "blowfish":"blowfish",
};

//加密
exports.encode = function(algorithm, key, buf) {
    var encrypted = "";
    var cip = crypto.createCipher(algorithm, key);
    encrypted += cip.update(buf, 'binary', 'hex');
    encrypted += cip.final('hex');
    return encrypted
};

//解密
exports.decode = function(algorithm, key, encrypted) {
    var decrypted = "";
    var decipher = crypto.createDecipher(algorithm, key);
    decrypted += decipher.update(encrypted, 'hex', 'binary');
    decrypted += decipher.final('binary');
    return decrypted
};