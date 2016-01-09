/**
 * Minecraft Packets
 */

var s = require("./serializer.js");
var d = require("./deserializer.js");

Fields = {};

Field = function(name, type)
{
	this.name = name;
	this.reader = eval("d.Deserializer.prototype.read" + type);
    this.writer = eval("s.Serializer.prototype.append" + type);
}

/**
 * Generate typed fields
 */
for (var type of d.Deserializer.ImplementedTypes) {
    eval("Fields." + type + " = function(name) { Field.call(this, name, \"" + type + "\"); }");
}

Protocol = function(version)
{
    this.version = version;
    this.handlers = new Map();
    this.packetIdToDescription = new Map();
    this._generate();
}

Protocol.prototype = {
    _generate: function()
    {

    },

    handlePacket: function(name, data)
    {
        if (this.handlers.has(name))
            setTimeout(this.handlers.get(name).bind(null, data), 0);
    },

    on: function(name, handler)
    {
        this.handlers.set(name, handler);
    }
}

HandshakingProtocol = function()
{
    Protocol.call(this, 4);
}

HandshakingProtocol.prototype = {
    _generate: function()
    {
        var m = this.packetIdToDescription;
        m.set(0x00, { name: "handshake", fields: [
            new Fields.VarInt("protocolVersion"),
            new Fields.Utf8String("serverAddress"),
            new Fields.UnsignedShort("serverPort"),
            new Fields.VarInt("nextState")
            ]});
    },

    __proto__: Protocol.prototype
}

ServerBoundLoginProtocol = function()
{
    Protocol.call(this, 4);
}

ServerBoundLoginProtocol.prototype = {
    _generate: function()
    {
        var m = this.packetIdToDescription;
        m.set(0x00, { name: "loginStart", fields: [ new Fields.Utf8String("name")]});
        m.set(0x01, { name: "encryptionResponse", fields: [
            new Fields.ByteArrayWithLength("sharedSecret"),
            new Fields.ByteArrayWithLength("verifyToken")]});
    },

    __proto__: Protocol.prototype
}

ClientBoundLoginProtocol = function()
{
    Protocol.call(this, 4);
}

ClientBoundLoginProtocol.prototype = {
    _generate: function()
    {
        var m = this.packetIdToDescription;
        m.set(0x00, { name: "disconnect", fields: [ new Fields.Utf8String("jsonData")]});
        m.set(0x01, { name: "encryptionRequest", fields: [
            new Fields.Utf8String("serverID"),
            new Fields.ByteArrayWithLength("publicKey"),
            new Fields.ByteArrayWithLength("verifyToken")
            ]});
        m.set(0x02, { name: "loginSuccess", fields: [ new Fields.Utf8String("uuid"), new Fields.Utf8String("username")]});
    },

    __proto__: Protocol.prototype
}

/**
 * Protocol describes only client-bound messages.
 */
GameProtocol = function()
{
    this.version = 4;
    this.packetIdToDescription = new Map();
    this._generate();
}

GameProtocol.prototype = {
    _generate: function()
    {
        var m = this.packetIdToDescription;
        m.set(0x00, { name: "keepAlive", fields: [new Fields.Int("keepAliveID")]});
        m.set(0x01, { name: "joinGame", fields: [
            new Fields.Int("entityID"),
            new Fields.UnsignedByte("gamemode"),
            new Fields.Byte("dimension"),
            new Fields.UnsignedByte("difficulty"),
            new Fields.UnsignedByte("maxPlayers"),
            new Fields.Utf8String("levelType")
            ]});
        m.set(0x02, { name: "chatMessage", fields: [new Fields.Utf8String("jsonData")]});
        m.set(0x03, { name: "timeUpdate", fields: [new Fields.Long("age"), new Fields.Long("time")]});
        /** not implemented
        m.set(0x04, { name: "entityEquipment", fields: [
            new Field("entityId", "Int"),
            new FIeld("slot", "Short"),
            new Field("item", "Slot")]});
        */
        m.set(0x05, { name: "spawnPosition", fields: [new Field("x", "Int"), new Field("y", "Int"), new Field("z", "Int")]});
        m.set(0x06, { name: "updateHealth", fields: [new Field("health", "Float"), new Field("food", "Short"), new Field("foodSaturation", "Float")]});
        m.set(0x07, { name: "respawn", fields: [
            new Field("dimension", "Int"),
            new Field("difficulty", "UnsignedByte"),
            new Field("gamemode", "UnsignedByte"),
            new Fields.Utf8String("levelType")
            ]});
        m.set(0x08, { name: "playerPositionAndLook", fields: [
            new Fields.Double("x"),
            new Fields.Double("y"),
            new Fields.Double("z"),
            new Fields.Float("yaw"),
            new Fields.Float("pitch"),
            new Fields.Bool("onGround")]});
        m.set(0x09, { name: "heldItemChange", fields: [ new Fields.Byte("slot")]});
        // 0x0a "use bed"
        // 0x0b "animation"
        // 0x0c "spawn player"
        // 0x0d "collect item"
        // 0x0e "spawn object"
        // 0x0f "spawn mob"
        // 0x10 "spawn painting"
        // 0x11 "spawn experience orb"
        // 0x12 "entity velocity"
        // 0x13 "destroy entities"
        // 0x14 - 0x1f "entity packets"
        // 0x1f - "set experience"
        // 0x21 - "chunk data"
        // ...
        m.set(0x40, { name: "disconnect", fields: [new Fields.Utf8String("reason")]});
    }
}

PacketReader = function(deserializer)
{
 	this.deserializer = deserializer;
}

PacketReader.prototype = {
    readPacket: function(protocol)
    {
        var length = this.deserializer.readVarInt();
        var packetId = this.deserializer.readVarInt();
        if (protocol.packetIdToDescription.has(packetId)) {
            var description = protocol.packetIdToDescription.get(packetId);
            var data = {};
            for (var field of description.fields)
                data[field.name] = field.reader.call(this.deserializer);
            protocol.handlePacket(description.name, data);
        } else {
            console.log("Unknown packet: " + packetId);
            for (var i = 0; i < length - 1; ++i)
                this.deserializer.readByte();
        }
    }
}

PacketWriter = function(serializer)
{
    this.serializer = serializer;
}

PacketWriter.prototype = {
    writePacket: function(protocol, packetId, data)
    {
        if (protocol.packetIdToDescription.has(packetId)) {
            var description = protocol.packetIdToDescription.get(packetId);
            this.serializer.appendVarInt(packetId);
            for (var field of description.fields)
                field.writer.call(this.serializer, data[field.name]);
            var b = this.serializer.prependLength().buffer();
            this.serializer.reset();
            return b;
        } else {
            console.log("Can't write unknown packet: " + packetId + data);
        }
    },

    writeKeepAlive: function(data)
    {
        var b = this.serializer.appendVarInt(0x00).appendVarInt(data.keepAliveID).prependLength().buffer();
        this.serializer.reset();
        return b;
    }
}

module.exports = {
    FieldsForTests: Fields,
    PacketReader: PacketReader,
    PacketWriter: PacketWriter,
    HandshakingProtocol: HandshakingProtocol,
    ServerBoundLoginProtocol: ServerBoundLoginProtocol,
    ClientBoundLoginProtocol: ClientBoundLoginProtocol
}
