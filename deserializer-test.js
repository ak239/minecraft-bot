var s = require("./serializer.js");
var d = require("./deserializer.js");

var serializer = new s.Serializer();
var deserializer = new d.Deserializer();

TestRunner.startGroup("serialize-deserialize");

TestRunner.addTest(function(){
for (var type of d.Deserializer.ImplementedTypes) {
    console.log(type);
    // IntField = function(name) { Field.call(this, name, "Int"); }
}
return true;
}, "dump implemented");

/**
 * VarInt
 */
var testValues = [];
for (var i = 0; i <= 1024; ++i)
    testValues.push(i);
testValues.push(214748364);
for (var i = 0; i < 100; ++i)
    testValues.push(Math.floor(Math.random() * 2147483647));

TestRunner.addTest(serializeDeserializeTest.bind(null, "VarInt", testValues), "VarInt");

/**
 * Unsigned short
 */
var testValues = [];
for (var i = 0; i < 65535; ++i)
    testValues.push(i);

TestRunner.addTest(serializeDeserializeTest.bind(null, "UnsignedShort", testValues), "UnsignedShort");

/**
 * String
 */
var testValues = ["", "ak239", "127.0.0.1", "\n\n\n"];

TestRunner.addTest(serializeDeserializeTest.bind(null, "Utf8String", testValues), "Utf8String");

/**
 * Boolean
 */
var testValues = [true, false];

TestRunner.addTest(serializeDeserializeTest.bind(null, "Boolean", testValues), "Boolean");

/**
 * UnsignedByte
 */
var testValues = [];
for (var i = 0; i <= 255; ++i)
    testValues.push(i);

TestRunner.addTest(serializeDeserializeTest.bind(null, "UnsignedByte", testValues), "UnsignedChar");

/**
 * Float
 */
var testValues = [0.0, 0.5, 3/14];

TestRunner.addTest(serializeDeserializeTest.bind(null, "Float", testValues), "Float");

/**
 * Double
 */
var testValues = [0.0, 0.5, 3/14];

TestRunner.addTest(serializeDeserializeTest.bind(null, "Double", testValues), "Double");

/**
 * VarLong
 */
var testValues = [];
for (var i = 0; i <= 1024; ++i)
    testValues.push(i);
testValues.push(9223372036854775807);

TestRunner.addTest(serializeDeserializeTest.bind(null, "VarLong", testValues), "VarLong");

/**
 * Byte
 */
var testValues = [];
for (var i = -127; i <= 127; ++i)
    testValues.push(i);

TestRunner.addTest(serializeDeserializeTest.bind(null, "Byte", testValues), "Byte");

/**
 * Short
 */
var testValues = [];
for (var i = -32768; i < 32767; ++i)
    testValues.push(i);

TestRunner.addTest(serializeDeserializeTest.bind(null, "Short", testValues), "Short");

function serializeDeserializeTest(type, testValues)
{
    var serializeFunction = eval("s.Serializer.prototype.append" + type);
    var deserializeFunction = eval("d.Deserializer.prototype.read" + type);
    for (var v of testValues)
        deserializer.appendBuffer(serializeFunction.call(serializer.reset(), v).buffer());

    var fail = false;
    for (var v of testValues) {
        var t = deserializeFunction.call(deserializer);
        if ((type !== "Float" && v !== t) || (type === "Float" && (Math.abs(v - t) > 0.000001))) {
            console.log("\tFAIL:", t, "!==", v);
            fail = true;
        }
    }
    return !fail;
}
