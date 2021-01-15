/**
 * Created by miaokun on 2014/9/8.
 */
//var exec = require("child_process").exec;
var querystring = require("querystring");

var allData = require("./data")

var util = require("./action/util");

var crypto = require('crypto');

var rank = require("./fly/rank");

var url = require("url");

function start(response,request) {
     response.writeHead(200, {"Content-Type": "text/plain"});
     response.write("hello node");
     response.end();
}

function upload(response,request) {
    //console.log("update被调用到。");
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello Upload");
    response.end();
}

function handlePost(response,request){
    request.setEncoding('utf-8');
    var postData = ""; //POST & GET ： name=zzl&email=zzl@sina.com
    // 数据块接收中
    request.addListener("data", function (postDataChunk) {
        postData += postDataChunk;
    });
    // 数据接收完毕，执行回调函数
    request.addListener("end", function () {
        //console.log('数据接收完毕');
        var params = querystring.parse(postData);//GET & POST  ////解释表单数据部分{name="zzl",email="zzl@sina.com"}
        console.log("[receive post:]" + postData);
        //PushToRedis(params["name"]);
        var item = {};
        item.name = params["name"];
        item.score = util.parseInt(params["score"]);
        item.dan = util.parseInt(params["dan"]);
        item.level = util.parseInt(params["level"]);
        allData.addItem(item);
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write("Hello post");
        response.end();
    });
}

function handleFly(response,request){
    request.setEncoding('utf-8');
    var postData = ""; //POST & GET ： name=zzl&email=zzl@sina.com
    // 数据块接收中
    request.addListener("data", function (postDataChunk) {
        postData += postDataChunk;
    });
    // 数据接收完毕，执行回调函数
    request.addListener("end", function () {
        //console.log('数据接收完毕');
        //rank.test(request,response);
        //return;

        var params = querystring.parse(postData);//GET & POST  ////解释表单数据部分{name="zzl",email="zzl@sina.com"}
        console.log("[receive post:]" + postData);
        //PushToRedis(params["name"]);
        var name = params["name"];
        var score = util.parseInt(params["score"]);
        var t = params["t"];
        var t2 = params["t2"];
        var type = params["type"];
        if (t && t2 && type)
        {
            t = t + "dcs9(1" + score;
            t = crypto.createHash('md5').update(t).digest('hex');
            if (t != t2) {
            } else {
                rank.addData(type, name, score, params["phone"],params["add"]);
                /*
                 if (type == 2)
                 {
                 var add = encodeURI(params["add"]);
                 if (!add)
                 {
                 add = ""
                 }
                 rank.addData(type,name + "-" + add,score);
                 }
                 */
                console.log("[receive right]:" + name + " " + score)

                response.writeHead(200, { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
                response.write("0");
                response.end();
                return;
            }
        }

        //allData.addItem(item);
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write("1");
        response.end();
    });
}

function handleGet(response,request)
{
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write(allData.toString());
    response.end();
}

function handleCount(response,request)
{
    var params = url.parse(request.url, true).query;//解释url参数部分name=zzl&email=zzl@sina.com

    if (params.hasOwnProperty("type"))
    {
        rank.countAdd(params["type"]);
        response.writeHead(200, { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
        response.write("0");
        response.end();
    }
    else {
        response.writeHead(200, { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
        response.write("1");
        response.end();
    }

}

function handleRealRank(response,request)
{
    var params = url.parse(request.url, true).query;//解释url参数部分name=zzl&email=zzl@sina.com

    if (params.hasOwnProperty("type"))
    {
        rank.getRealData(params["type"],params["page"],request,response);
    }
    else {
        response.writeHead(200, { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
        response.write("1");
        response.end();
    }
}

function handleRank(response,request)
{
    var params = url.parse(request.url, true).query;//解释url参数部分name=zzl&email=zzl@sina.com

    if (params.hasOwnProperty("type"))
    {
        rank.getData(params["type"],request,response);
    }
    else {
        response.writeHead(200, { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
        response.write("1");
        response.end();
    }
}

function handleShowCount(response,request) {
    var params = url.parse(request.url, true).query;//解释url参数部分name=zzl&email=zzl@sina.com

    if (params.hasOwnProperty("type"))
    {
        rank.showCount(params["type"],params["tag"],request,response);
    }
    else {
        response.writeHead(200, { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
        response.write("3");
        response.end();
    }
}


exports.start = start;
exports.upload = upload;
exports.post = handlePost;
exports.handleGet = handleGet;
exports.fly = handleFly;
exports.rank = handleRank;
exports.count = handleCount;
exports.realRank = handleRealRank;
exports.showCount = handleShowCount;
