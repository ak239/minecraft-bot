/**
 * Methods related to auth.minecraftonly.ru
 */

var network = require("./network.js");

AuthClient = function()
{
}

AuthClient.prototype = {
    auth: function(login, password, callback)
    {
        network.request("user=" + login + "&password=" + password + "&servertype=Classic&checkh=0&version=0", {
            method: "POST",
            hostname: "auth.minecraftonly.ru",
            port: 80,
            path: "/serverauth/a.php"
        }, function(e, result){
            if (!e)
                callback(result);
        });
    }
}

// TODO: move methods to AuthClient
function getUpdates(callback)
{
    network.request(undefined, {
        method: "GET",
        hostname: "auth.minecraftonly.ru",
        port: 80,
        path: "/serverauth/updates.php?type=Classic"
    }, function(result){
        session.updates = result;
        callback();
    });
}

function getLibVer(callback)
{
    network.request("", {
        method: "GET",
        hostname: "auth.minecraftonly.ru",
        port: 80,
        path: "/serverauth/getlibver.php?os=mac&arch=x86_64"
    }, function(result){
        session.libVer = result;
        callback();
    });
}

function getPromotionsSlim(callback)
{
    network.request("", {
        method: "GET",
        hostname: "files.minecraftforge.net",
        port: 80,
        path: "/maven/net/minecraftforge/forge/promotions_slim.json"
    }, function(result){
        session.promotionsSlim = result;
        callback();
    });
}

module.exports = { AuthClient: AuthClient };
