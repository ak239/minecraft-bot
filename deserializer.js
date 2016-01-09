Deserializer = function()
{
    this.buffers = [];
    this.currentBuffer = -1;
    this.currentByte = -1;
}

Deserializer.ImplementedTypes = [];

Deserializer.prototype = {
    appendBuffer: function(buffer)
    {
        if (buffer.length)
            this.buffers.push(buffer);
        return this;
    },

    readVarInt: function()
    {
        var val = 0;
        var x = 1;
        do {
            d = this._nextByte();
            val += (d & ((1 << 8) - 1 >> 1)) * x;
            x *= 128;
        } while (d & 1 << 7);
        return val;
    },

    readVarLong: function()
    {
        return this.readVarInt();
    },

    readUnsignedShort: function()
    {
        var h = this._nextByte();
        var l = this._nextByte();
        return h * 256 + l;
    },

    readUtf8String: function()
    {
        var len = this._nextByte();
        var bytes = [];
        for (var i = 0; i < len; ++i)
            bytes.push(this._nextByte());
        return new Buffer(bytes).toString("utf8");
    },

    readBoolean: function()
    {
        return !!this._nextByte();
    },

    readUnsignedByte: function()
    {
        return this._nextByte();
    },

    readByte: function()
    {
        return this._nextByte(true);
    },

    readShort: function()
    {
        return new Buffer([this._nextByte(), this._nextByte()]).readInt16BE();
    },

    readFloat: function()
    {
        var bytes = [];
        for (var i = 0; i < 4; ++i)
            bytes.push(this._nextByte());
        return new Buffer(bytes).readFloatBE();
    },

    readDouble: function()
    {
        var bytes = [];
        for (var i = 0; i < 8; ++i)
            bytes.push(this._nextByte());
        return new Buffer(bytes).readDoubleBE();
    },

    readByteArrayWithLength: function()
    {
        var l = this.readShort();
        var bytes = [];
        for (var i = 0; i < l; ++i)
            bytes.push(this._nextByte());
        return new Buffer(bytes);
    },

    atEnd: function()
    {
        return this._peekNextByte() === null;
    },

    _peekNextByte: function()
    {
        var currentByte = this.currentByte;
        var currentBuffer = this.currentBuffer;
        if (currentBuffer === -1)
            return this.buffers.length !== 0 ? this.buffers[0].readUInt8(0) : null;
        if (currentByte < this.buffers[currentBuffer].length - 1)
            return this.buffers[currentBuffer].readUInt8(currentByte + 1);
        if (currentBuffer < this.buffers.length - 1)
            return this.buffers[currentBuffer + 1].readUInt8(0);
        return null;
    },

    _nextByte: function(isSigned)
    {
        if (this.currentBuffer === -1) {
            if (this.buffers.length === 0)
                throw new Error("Unexpected buffer finish");
            this.currentBuffer = 0;
            this.currentByte = 0;
        } else if (this.currentByte < this.buffers[this.currentBuffer].length - 1) {
            ++this.currentByte;
        } else if (this.currentBuffer < this.buffers.length - 1) {
            ++this.currentBuffer;
            this.currentByte = 0;
        } else {
            throw new Error("Unexpected buffer finish");
        }
        if (!isSigned)
            return this.buffers[this.currentBuffer].readUInt8(this.currentByte);
        return this.buffers[this.currentBuffer].readInt8(this.currentByte);
    }
}

for (var x in Deserializer.prototype) {
    if (x.startsWith("read"))
        Deserializer.ImplementedTypes.push(x.substr(4));
}

module.exports = {
    Deserializer: Deserializer
}
