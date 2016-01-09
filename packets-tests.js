TestRunner.startGroup("packets");

var p = require("./packets.js");

TestRunner.addTest(function(){
for (var field in p.FieldsForTests) {
    console.log(field);
}
return true;
}, "dump fields");
