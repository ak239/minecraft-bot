/**
 * Minecraft Client
 */

var net = require("net");
var crypto = require('crypto');
var assert = require('assert');

var p = require("./packets.js");
var s = require("./serializer.js");
var d = require("./deserializer.js");

function mcHexDigest(str) {
  var hash = new Buffer(crypto.createHash('sha1').update(str).digest(), 'binary');
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

function hexToBuf(hex)
{
    var bytes = [];
    for (var i = 0; i < hex.length / 2; ++i)
        bytes.push(eval("0x" + hex[i * 2] + hex[i * 2 + 1]));
    return new Buffer(bytes);
}

MinecraftClient = function()
{
    this.handshakingProtocol = new p.HandshakingProtocol();
    this.serverBoundLoginProtocol = new p.ServerBoundLoginProtocol();
    this.clientBoundLoginProtocol = new p.ClientBoundLoginProtocol();

    this.clientBoundLoginProtocol.on("disconnect", this.disconnect.bind(this));
    this.clientBoundLoginProtocol.on("encryptionRequest", this.encryptionRequest.bind(this));
    this.clientBoundLoginProtocol.on("loginSuccess", this.loginSuccess.bind(this));

    this.serializer = new s.Serializer();
    this.deserializer = new d.Deserializer();

    this.packetReader = new p.PacketReader(this.deserializer);
    this.packetWriter = new p.PacketWriter(this.serializer);

    this.client = null;
}

MinecraftClient.prototype = {
    connect: function(host, port, user)
    {
        this.client = net.connect({port: port, host: host}, () => { //'connect' listener
            this.client.write(this.packetWriter.writePacket(this.handshakingProtocol, 0x00, {
                protocolVersion: 4,
                serverAddress: host,
                serverPort: port,
                nextState: 2
            }));
            this.client.write(this.packetWriter.writePacket(this.serverBoundLoginProtocol, 0x00, { name: user }));
        });

        this.client.on("data", (chunk) =>{
            this.deserializer.appendBuffer(chunk);
            this.packetReader.readPacket(this.clientBoundLoginProtocol);
        });
    },

    disconnect: function(data)
    {
        console.log("disconnect", data);
    },

    encryptionRequest: function(data)
    {
        console.log("encryptionRequest", data);
        console.log(data.verifyToken.toString("hex"));
        console.log(data.publicKey.toString("hex"));
        this.client.write(this.packetWriter.writePacket(this.serverBoundLoginProtocol, 0x01, {
            sharedSecret: hexToBuf('511469b993b1de11e789a91650b07167ea5e4113ecc09a4ef475d2fd45da156966512ea3ad29a034b545cb1c7abf83fb5f5ec2b765d24d39631397be3c1448ef0ae560683e8d121977e0e46370990a238efa8aa07e9c6db22e4ea015ab6a3d4b44f76cde6588d8764797a5ffe7cda3a33dbf71cbc145b8b68b166f8b5577306b'),
            verifyToken:  hexToBuf('0ecfd8e159871e6003858d82571818cb92f239c62dd95e2adef13760a6a1824b1a7950e4a3e3b40135b613dfa0992cc31ea9842402d1af588a2fbfbc81ce27fb7ebfe96b4111bc81931c69c4cb474ffe3cc0d78363075d4010aa9d999ab6482298191dd5a9ae9e2795304ab1d6cee63050265956184a5c94134a489a951aaf18')
        }));
    },

    loginSuccess: function(data)
    {
        console.log("loginSuccess", data);
    }
}
