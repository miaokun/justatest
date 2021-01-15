/**
 * Created by miaokun on 2014/9/8.
 * 启动程序
 */
var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var data = require("./data");
var rank = require("./fly/rank");

var handle = {}
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/upload"] = requestHandlers.upload;
handle["/node/post"] = requestHandlers.post;
handle["/node/rank"] = requestHandlers.handleGet;
handle["/node/fly"] = requestHandlers.fly;
handle["/node/flyrank"] = requestHandlers.rank;
handle["/node/count"] = requestHandlers.count;
handle["/node/realrank"] = requestHandlers.realRank;
handle["/node/showcount"] = requestHandlers.showCount;
server.start(router.route, handle);
rank.init();