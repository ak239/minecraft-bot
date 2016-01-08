var sb = require("./serverbound-packets.js");

var gen = new sb.ServerBoundPackets();

TestRunner.startGroup("serverbound-packets-tests");

TestRunner.addTest(test.bind(null, gen.handshake({
    host: "37.59.31.213",
    port: 25570,
    login: true
}), "1200040c33372e35392e33312e32313363e202"), "handshake");

TestRunner.addTest(test.bind(null, gen.loginStart({
    name: "ak239"
}), "070005616b323339"), "loginStart");

function test(buffer, expected)
{
    var hex = buffer.toString("hex");
    var failed = hex !== expected;
    if (failed)
        console.log("\t" + text + " != " + hex);
    return !failed;
}
