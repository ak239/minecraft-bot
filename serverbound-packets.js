/**
 * Server bound packets generator
 */

var s = require("./serializer.js");

const PROTOCOL_VERSION = 4;

ServerBoundPackets = function(idGenerator)
{
    this.serializer = new s.Serializer();
}

ServerBoundPackets.prototype = {
    handshake: function(data)
    {
        this._startPacket(0);
        this.serializer.appendVarInt(PROTOCOL_VERSION)
            .appendUtf8String(data.host)
            .appendUnsignedShort(data.port)
            .appendVarInt(data.login ? 2 : 1);
        return this._endPacket();
    },

    loginStart: function(data)
    {
        this._startPacket(0);
        this.serializer.appendUtf8String(data.name);
        return this._endPacket();
    },

    _startPacket: function(id)
    {
        this.serializer.reset();
        this.serializer.appendVarInt(id);
        return this.serializer;
    },

    _endPacket: function()
    {
        return this.serializer.prependLength().buffer();
    }
}

module.exports = {
    ServerBoundPackets: ServerBoundPackets
}
