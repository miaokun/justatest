/**
 * Created by miaokun on 2014/9/8.
 * 主程序
 */
var http = require("http");
var url = require("url");

function start(route, handle) {
    function onRequest(request, response) {
        var pathname = url.parse(request.url).pathname;
        //console.log("收到该地址的请求： " + pathname);
        route(handle, pathname, response, request);
    }

    http.createServer(onRequest).listen(18080);
    //console.log("Server has started.");
}

exports.start = start;