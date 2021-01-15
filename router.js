/**
 * Created by miaokun on 2014/9/8.
 * 路由文件
 */
function route(handle, pathname, response, request) {
    //console.log("请求该地址： " + pathname);
    if (typeof handle[pathname] === 'function') {// is 操作
        handle[pathname](response, request);
    } else {
        //console.log("没有该请求的处理器：" + pathname);
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("404 Not found");
        response.end();//结束请求
    }
}

exports.route = route;