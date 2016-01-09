#!/usr/local/bin/node


var encryptionRequest = {
    serverID: "",
    publicKey: hexToBuf("30819f300d06092a864886f70d010101050003818d0030818902818100bd02330c13baabebf19270e10a0cee2d9eeadfb88b27cf66c25d7517cee1dee4c5123f1d264e85cb08fadafbe0fd575a23e8754729501e496b36b13c02143e2e8a02ea7e696c274f44e1baa4b13d697e0aab47bc2622be7e972ecc248e9d630aaaf4f52aacd8c346387b5f72b190d4c4d53848946aea33c9fd7fe76bc8a1553b0203010001"),
    verifyToken: hexToBuf("e2565417")
};

var resp = "8502010080511469b993b1de11e789a91650b07167ea5e4113ecc09a4ef475d2fd45da156966512ea3ad29a034b545cb1c7abf83fb5f5ec2b765d24d39631397be3c1448ef0ae560683e8d121977e0e46370990a238efa8aa07e9c6db22e4ea015ab6a3d4b44f76cde6588d8764797a5ffe7cda3a33dbf71cbc145b8b68b166f8b5577306b00800ecfd8e159871e6003858d82571818cb92f239c62dd95e2adef13760a6a1824b1a7950e4a3e3b40135b613dfa0992cc31ea9842402d1af588a2fbfbc81ce27fb7ebfe96b4111bc81931c69c4cb474ffe3cc0d78363075d4010aa9d999ab6482298191dd5a9ae9e2795304ab1d6cee63050265956184a5c94134a489a951aaf18";
var bytes = [];
for (var i = 0; i < resp.length / 2; ++i)
    bytes.push(eval("0x" + resp[i * 2] + resp[i * 2 + 1]));

function hexToBuf(hex)
{
    var bytes = [];
    for (var i = 0; i < hex.length / 2; ++i)
        bytes.push(eval("0x" + hex[i * 2] + hex[i * 2 + 1]));
    return new Buffer(bytes);
}

var d = require("./deserializer.js");
var deserializer = new d.Deserializer();
deserializer.appendBuffer(new Buffer(bytes));

var p = require("./packets.js");

var serverBoundLoginProtocol = new p.ServerBoundLoginProtocol();
var packetReader = new p.PacketReader(deserializer);

serverBoundLoginProtocol.on("encryptionResponse", (data) => {
    var encryptionResponse = { sharedSecret: data. sharedSecret.toString("hex"), verifyToken: data.verifyToken.toString("hex") };
    analyze(encryptionRequest, encryptionResponse);
});

packetReader.readPacket(serverBoundLoginProtocol);

var crypto = require('crypto');
var assert = require('assert');

function mcHexDigest(secret, publicKey) {
  var hash = new Buffer(crypto.createHash('sha1').update(secret).update(publicKey).digest(), 'binary');
  return hash.toString("hex");
  // check for negative hashes
  var negative = hash.readInt8(0) < 0;
  if (negative) performTwosCompliment(hash);
  var digest = hash.toString('hex');
  // trim leading zeroes
  digest = digest.replace(/^0+/g, '');
  if (negative) digest = '-' + digest;
  return digest;

}

function performTwosCompliment(buffer) {
  var carry = true;
  var i, newByte, value;
  for (i = buffer.length - 1; i >= 0; --i) {
    value = buffer.readUInt8(i);
    newByte = ~value & 0xff;
    if (carry) {
      carry = newByte === 0xff;
      buffer.writeUInt8(newByte + 1, i);
    } else {
      buffer.writeUInt8(newByte, i);
    }
  }
}
function analyze(request, response)
{
    console.log(request, response);
    var sharedSecret = hexToBuf('511469b993b1de11e789a91650b07167ea5e4113ecc09a4ef475d2fd45da156966512ea3ad29a034b545cb1c7abf83fb5f5ec2b765d24d39631397be3c1448ef0ae560683e8d121977e0e46370990a238efa8aa07e9c6db22e4ea015ab6a3d4b44f76cde6588d8764797a5ffe7cda3a33dbf71cbc145b8b68b166f8b5577306b');
    console.log(mcHexDigest(sharedSecret, request.publicKey));
}
/*
0:0:ak239:121753314820542860016:68394201325234:37fd7581dbe31283945376b101a6f440:6825315354b5f23c5d0e15a4cb462320:60aca8501e7eb25ed1990c44354f3a0f:0
*/
/*

{ serverID: '',
  publicKey:    '30819f300d06092a864886f70d010101050003818d0030818902818100bd02330c13baabebf19270e10a0cee2d9eeadfb88b27cf66c25d7517cee1dee4c5123f1d264e85cb08fadafbe0fd575a23e8754729501e496b36b13c02143e2e8a02ea7e696c274f44e1baa4b13d697e0aab47bc2622be7e972ecc248e9d630aaaf4f52aacd8c346387b5f72b190d4c4d53848946aea33c9fd7fe76bc8a1553b0203010001',
  verifyToken: 'e2565417' }
{ sharedSecret: '511469b993b1de11e789a91650b07167ea5e4113ecc09a4ef475d2fd45da156966512ea3ad29a034b545cb1c7abf83fb5f5ec2b765d24d39631397be3c1448ef0ae560683e8d121977e0e46370990a238efa8aa07e9c6db22e4ea015ab6a3d4b44f76cde6588d8764797a5ffe7cda3a33dbf71cbc145b8b68b166f8b5577306b',
  verifyToken:  '0ecfd8e159871e6003858d82571818cb92f239c62dd95e2adef13760a6a1824b1a7950e4a3e3b40135b613dfa0992cc31ea9842402d1af588a2fbfbc81ce27fb7ebfe96b4111bc81931c69c4cb474ffe3cc0d78363075d4010aa9d999ab6482298191dd5a9ae9e2795304ab1d6cee63050265956184a5c94134a489a951aaf18' }

                 121753314820542860016:68394201325234:37fd7581dbe31283945376b101a6f440:6825315354b5f23c5d0e15a4cb462320:60aca8501e7eb25ed1990c44354f3a0f
*/
