var redis = require('redis');
var utl = require("../action/util");
/*数据库连接信息host,port,user,pwd,dbname(可查询数据库详情页)*/

var username = 'Sl14bRGbfPnD0ShbXSxtPyXM';          // 用户名（API KEY）
var password = 'MUBeG431BNFVT9RveFFAOXmWeaojG4fc';  // 密码（Secret KEY）
var db_host = 'redis.duapp.com';
var db_port = 80;
var db_name = 'eMjPgzWphlAqzXsLQMoU';               // 数据库名
var options = {"no_ready_check":true};


/*
var username;          // 用户名（API KEY）
var password;  // 密码（Secret KEY）
var db_host = '127.0.0.1';
var db_port = 6379;
var db_name;               // 数据库名
var options = {"no_ready_check":true};
*/
/**
 * 是否需要重新加载数据
 * @type {boolean}
 */
var needToLoad = true;
var loadString = [];

var count = 0;


function getClient()
{
    var client = redis.createClient(db_port, db_host, options);
    client.on("error", function (err) {
        console.log("Error1 " + err);
    });

    // 建立连接后，在进行集合操作前，需要先进行auth验证
    if (username) {
        client.auth(username + '-' + password + '-' + db_name);
    }
    //client.unref();
    return client;
}

function addData(type,name,score,phone,add)
{
    type = parseInt(type);
    if (!type)
    {
        return;
    }
    var client = getClient();

    client.incr("gamecount:" + type);

    //zscore test two
    client.zscore("gamerank:" + type,name,function(err, result) {
        if (err) {
            console.log("getData2:" + err);
            //client.end();
            return;
        }
        var old = utl.parseInt(result);
        if (old < score)
        {
            client.zadd("gamerank:" + type, score, name, function (err2, result2) {
                if (type != 2) {
                    client.end();
                }
                console.log("addRank Suc" + type);
            });//zadd test 12 "two"

        }
        else
        {
            if (type != 2)
            {
                client.end();
            }
        }

    });


    if (type == 2)
    {
        if (!phone)
        {
            phone = "";
        }
        if (!add)
        {
            add = "";
        }
        var name2 = name + "-" +phone + "-" + add;
        client.zscore("gamerank2:" + type,name2,function(err, result) {
            if (err) {
                console.log("getData2:" + err);
                //client.end();
                return;
            }
            var old = utl.parseInt(result);
            if (old < score)
            {
                client.zadd("gamerank2:" + type,score,name2,function(err1,result1){
		            client.end();
                    console.log("addRank2 Suc");
		        });//zadd test 12 "two"

            }
            else
            {
                client.end();
            }
            //client.end();
        });
    }

    //client.zadd("gamerank:" + type,score,name);//zadd test 12 "two"
    needToLoad = true;
}

function countAdd(type) {
    type = parseInt(type);
    if (!type)
    {
        return;
    }
    if (type == 2)
    {
        count++;
    }
    else
    {
        var client = getClient();
        client.incr("pagecount:" + type);
        client.end();
    }
}

function showCount(type,tag,req,res){
    tag = utl.parseInt(tag);
    type = parseInt(type);
    if (!type)
    {
        res.writeHead(200, {"Content-Type": "text/plain","Access-Control-Allow-Origin":"*"});
        res.end('1');
        return;
    }

    var name;
    if (tag == 1)//
    {
        name = "gamecount:";//打开页面
    }
    else
    {
        name = "pagecount:";//提交游戏
        if (type == 2)
        {
            res.writeHead(200, {"Content-Type": "text/plain","Access-Control-Allow-Origin":"*"});
            res.end(count + "");
            return
        }
    }
    var client = getClient();
    client.get(name + type,function(err,result){
        if (err) {
            res.writeHead(200, {"Content-Type": "text/plain","Access-Control-Allow-Origin":"*"});
            res.end('2');
            //client.end();
            return;
        }
        res.writeHead(200, {"Content-Type": "text/plain","Access-Control-Allow-Origin":"*"});
        res.end(result);
        client.end();
    });

}

function getData(type,req,res)
{
    type = parseInt(type);
    if (!type)
    {
        res.writeHead(200, {"Content-Type": "text/plain","Access-Control-Allow-Origin":"*"});
        res.end('1');
        return;
    }

    //zrevrange gamerank:1 0 100 withscores
    if (!needToLoad && loadString[type])
    {
        console.log("load cache");
        res.writeHead(200, {"Content-Type": "text/plain","Access-Control-Allow-Origin":"*"});
        res.write(loadString[type]);
        res.end();
        return;
    }


    var client = getClient();
    client.zrevrange("gamerank:" + type,0,49,"withscores",function(err, result) {
        res.writeHead(200, {"Content-Type": "text/plain","Access-Control-Allow-Origin":"*"});
        if (err) {
            console.log("getData3:" + err);
            res.end('get error');
            //client.end();
            return;
        }
        var message = "";
        var length = result.length;
        for(var i = 0;i<length - 1;i+=2)
        {
            message += encodeURI(result[i]) + " " + result[i+1] + "\r";
        }
        loadString[type] = message;
        needToLoad = false;
        res.write(message);
        res.end();
        client.end();
    });

}

function getRealData(type,page,req,res)
{
    page = parseInt(page);
    if (!page)
    {
        page = 0;
    }
    type = parseInt(type);
    if (!type)
    {
        res.writeHead(200, {"Content-Type": "text/plain","Access-Control-Allow-Origin":"*"});
        res.end('1');
        return;
    }
    var client = getClient();
    client.zrevrange("gamerank2:" + type,page*20,page*20 + 19,"withscores",function(err, result) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write('<head><meta charset="utf-8"/></head>');
        res.write('姓名-手机号--地址--分数<br/>');
        if (err) {
            console.log("getData3:" + err);
            res.end('get error');
            //client.end();
            return;
        }
        var message = "";
        var length = result.length;
        for(var i = 0;i<length - 1;i+=2)
        {
            message += result[i] + " " + result[i+1] + "<br/>";
        }
        //loadString[type] = message;
        //needToLoad = false;
        res.write(message);
        res.end();
        client.end();
    });

}

function testRedis(req, res) {
    var client = redis.createClient(db_port, db_host, options);
    client.on("error", function (err) {
        console.log("Error5 " + err);
    });

    // 建立连接后，在进行集合操作前，需要先进行auth验证
    if (username) {
        client.auth(username + '-' + password + '-' + db_name);
    }

    //client.set()
    //client.zadd();
    /*
    client.set('baidu', 'welcome to BAE');

    client.get('baidu', function(err, result) {
        if (err) {
            console.log(err);
            res.end('get error');
            return;
        }
        res.end('result: ' + result);
    });
    */

}

function init()
{
    var client = getClient();
    //client.set("pagecount:2",4534);
    client.get("pagecount:2",function(err,result){
        if (err) {
            console.log("Error7 " + err);
            //client.end();
            return;
        }
        count = utl.parseInt(result);
        client.end();
    });
    setInterval(setCountData,30 * 1000 * 4)
}

function setCountData()
{
    var client = getClient();
    client.set("pagecount:2",count,function(err,result){
	client.end();
	console.log("setcount:" + count);
	});
    //client.end();
}

exports.addData = addData;
exports.getData = getData;

exports.test = testRedis;
exports.countAdd = countAdd;
exports.getRealData = getRealData;
exports.showCount = showCount;
exports.init = init;