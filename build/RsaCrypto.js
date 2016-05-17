"use strict";

var crypto = require("crypto");
var path = require("path");
var fs = require("fs");

var encryptStringWithRsaPublicKey = function encryptStringWithRsaPublicKey(toEncrypt, relativeOrAbsolutePathToPublicKey) {
    var absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey);
    var publicKey = fs.readFileSync(absolutePath, "utf8");
    var buffer = new Buffer(toEncrypt);
    var encrypted = crypto.publicEncrypt(publicKey, buffer);
    return encrypted.toString("base64");
};

var decryptStringWithRsaPrivateKey = function decryptStringWithRsaPrivateKey(toDecrypt, relativeOrAbsolutePathtoPrivateKey) {
    var absolutePath = path.resolve(relativeOrAbsolutePathtoPrivateKey);
    var privateKey = fs.readFileSync(absolutePath, "utf8");
    var buffer = new Buffer(toDecrypt, "base64");
    var decrypted = crypto.privateDecrypt(privateKey, buffer);
    return decrypted.toString("utf8");
};

module.exports = {
    encryptStringWithRsaPublicKey: encryptStringWithRsaPublicKey,
    decryptStringWithRsaPrivateKey: decryptStringWithRsaPrivateKey
};

function test() {
    var cleartext = 'hello';
    var encrypted = encryptStringWithRsaPublicKey('hello', '/home/evans/.redishub/cert.pem');
    console.log('encrypted', encrypted);
    var decrypted = decryptStringWithRsaPrivateKey(encrypted, '/home/evans/.redishub/privkey.pem');
    console.log('decrypted', decrypted);
}

test();
//# sourceMappingURL=RsaCrypto.js.map