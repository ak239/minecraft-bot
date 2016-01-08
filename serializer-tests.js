#!/usr/local/google/home/kozyatinskiy/node/bin/node

TestRunner.startGroup("serializer");

var s = require("./serializer.js");

var serializer = new s.Serializer();

TestRunner.addTest(test.bind(null, serializer.appendVarInt(1).buffer(),   "01"), "1");
serializer.reset();
TestRunner.addTest(test.bind(null, serializer.appendVarInt(10).buffer(),  "0a"), "10");
serializer.reset();
TestRunner.addTest(test.bind(null, serializer.appendVarInt(300).buffer(), "ac02"), "300");
serializer.reset();
TestRunner.addTest(test.bind(null, serializer.appendVarInt(127).buffer(), "7f"), "127");
serializer.reset();
TestRunner.addTest(test.bind(null, serializer.appendVarInt(128).buffer(), "8001"), "128");
serializer.reset();

TestRunner.addTest(test.bind(null, serializer.appendUnsignedShort(4).buffer(), "0004"), "4");
serializer.reset();

TestRunner.addTest(test.bind(null,
    serializer.appendUtf8String("37.59.31.213").buffer(), "0c33372e35392e33312e323133"), "37.59.31.213");
serializer.reset();

TestRunner.addTest(test.bind(null,
    serializer.appendVarInt(4).appendUtf8String("37.59.31.213").appendUnsignedShort(25570).appendVarInt(2).buffer(),
    "040c33372e35392e33312e32313363e202"), "handshake packet data");
serializer.reset();

TestRunner.addTest(test.bind(null,
    serializer.appendVarInt(0).appendVarInt(4).appendUtf8String("37.59.31.213")
    .appendUnsignedShort(25570).appendVarInt(2).prependLength().buffer(), "1200040c33372e35392e33312e32313363e202"),
    "handshake packet");
serializer.reset();

function test(buffer, expected)
{
    var result = buffer.toString("hex");
    if (result !== expected)
        console.log("FAIL" + ": " + result + " != " + expected);
    return result === expected;
}
