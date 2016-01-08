/**
 * Network utility methods
 */

var http = require("http");

function request(data, options, callback)
{
    options.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": data ? data.length : 0,
        "User-Agent": "Java/1.6.0_65"
    };
    var req = http.request(options, function(response){
        response.setEncoding("utf-8");
        var result = "";
        response.on("data", function(chunk){
            result += chunk;
        });
        response.on("end", function(){
            callback(undefined, result);
        });
    });
    req.on("error", function(e){
        console.log("problem with post request: " + e.message);
        callback(e);
    });
    if (data)
        req.write(data);
    req.end();
}

module.exports = { request: request };
