/**
 * Serializer
 */

Serializer = function()
{
    this.bytes = [];
}

Serializer.prototype = {
    buffer: function()
    {
        return new Buffer(this.bytes);
    },

    prependLength: function()
    {
        this.prependVarInt(this.bytes.length);
        return this;
    },

    reset: function()
    {
        this.bytes = [];
        return this;
    },

    appendVarInt: function(val)
    {
        this.bytes = this.bytes.concat(this._varIntBytes(val));
        return this;
    },

    prependVarInt: function(val)
    {
        this.bytes = this._varIntBytes(val).concat(this.bytes);
        return this;
    },

    appendVarLong: function(val)
    {
        this.bytes = this.bytes.concat(this._varIntBytes(val, true));
        return this;
    },

    appendUnsignedShort: function(val)
    {
        if (val > 65535 || val < 0)
            throw new Error(val + " is not unsigned short");
        this.bytes.push(val / 256);
        this.bytes.push(val % 256);
        return this;
    },

    appendUtf8String: function(val)
    {
        this.appendVarInt(val.length);
        for (var i = 0; i < val.length; ++i)
            this.bytes.push(val.charCodeAt(i));
        return this;
    },

    appendBoolean: function(val)
    {
        this.bytes.push(val ? 1 : 0);
        return this;
    },

    appendUnsignedByte: function(val)
    {
        if (val < 0 || val > 255)
            throw new Error(val + " is not unsigned byte");
        this.bytes.push(val);
        return this;
    },

    appendFloat: function(val)
    {
        var b = new Buffer(4);
        b.writeFloatBE(val, 0);
        for (var i = 0; i < b.length; ++i)
            this.bytes.push(b.readUInt8(i));
        return this;
    },

    appendDouble: function(val)
    {
        var b = new Buffer(8);
        b.writeDoubleBE(val, 0);
        for (var i = 0; i < b.length; ++i)
            this.bytes.push(b.readUInt8(i));
        return this;
    },

    _varIntBytes: function(val, isLong)
    {
        // for varlong this check is always true, because js can store so big number
        if (val < 0 || (!isLong && val > 2147483647) || (isLong && val > 9223372036854775807))
            throw new Error(val + " is not varint");
        // TODO: add support of negative value
        var bytes = [];
        const perBucket = 128;
        do {
            var d = val % 128;
            if (val >= 128)
                d = d | 1 << 7;
            bytes.push(d);
            val = Math.floor(val / 128);
        } while (val);
        return bytes;
    }
}

module.exports = { Serializer: Serializer };
