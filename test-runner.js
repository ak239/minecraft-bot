#!/usr/local/bin/node

/**
 * TestRunner
 */

TestRunner = {}
TestRunner.tests = [];

var groupName = "";

TestRunner.startGroup = function(name)
{
    groupName = name;
}

TestRunner.addTest = function(func, name)
{
    TestRunner.tests.push({ func: func, name: name, groupName: groupName});
}

require("./serializer-tests.js");
require("./deserializer-test.js");
require("./serverbound-packets-tests.js");
require("./packets-tests.js");

var prevGroupName = "";
for (var test of TestRunner.tests) {
    if (test.groupName !== prevGroupName)
        console.log("Start " + test.groupName + " group");
    prevGroupName = test.groupName;
    console.log("\tRun " + test.name);
    if (!test.func.call(null))
        console.log("\t\tFAILED");
    else
        console.log("\t\tPASS");
}
