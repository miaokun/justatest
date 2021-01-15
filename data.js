/**
 * Created by miaokun on 2014/9/13.
 */
var fs = require("fs");
var util = require("./action/util");


var source = [];
initData();
setInterval(saveData,1000 * 1 * 60);

/**
 * 数据元素已改变
 * @type {boolean}
 */
var isChanged = true;
/**
 * 是否需要保存
 * @type {boolean}
 */
var isNeedSave = false;
var dataString = "";

function saveData()
{
    if(isNeedSave)
    {
        console.log("data saved");
        isNeedSave = false;
        var result = toString();
        fs.writeFileSync("./res/data.txt",result,"utf8");
    }
}

function toString()
{
    if(isChanged)
    {
        var result = "";
        var length = source.length;
        for (var i = 0;i<length;i++)
        {
            var item = source[i];
            result += item.name + " " + item.score + " " + item.dan + " " + item.level + "\r";
        }
        //console.log("toString():" + result);
        dataString = result;
        isChanged = false;
    }
    return dataString;
}

function initData()
{
   var result = fs.readFileSync("./res/data.txt","utf8");
   var arr = result.split("\r");
   var length = arr.length;
    for(var i = 0;i<length;i++)
    {
        var items = arr[i].split(" ");
        if (items.length > 3) {
            var item = {};
            item.name = items[0];
            item.score = util.parseInt(items[1]);
            item.dan = util.parseInt(items[2]);
            item.level = util.parseInt(items[3]);
            source.push(item);
        }
    }
    source = source.sort(sortSource);
}

function sortSource(item1,item2)
{
    if(item1.score < item2.score)
    {
        return 1;
    }
    else if(item1.score > item2.score)
    {
        return -1;
    }
    else
    {
        return 0;
    }
}

/**
 * 添加元素
 */
function addItem(item)
{
    var index = getItemIndex(item.name);
    if(index != -1)
    {
        var targetItem = source[index];
        if (targetItem.score < item.score) {
            source[index] = item;
            source = source.sort(sortSource);
            isChanged = true;
            isNeedSave = true;
        }
    }
    else
    {
        source.push(item);
        source = source.sort(sortSource);
        if (source.length > 100)
        {
            source.pop();
        }
        isChanged = true;
        isNeedSave = true;
    }
}

function getItemByName(name)
{
    var length = source.length;
    for (var i = 0;i<length;i++) {
        var item = source[i];
        if(item.name == name)
        {
            return item;
        }
    }
    return null;
}

function getItemIndex(name)
{
    var length = source.length;
    for (var i = 0;i<length;i++) {
        var item = source[i];
        if(item.name == name)
        {
            return i;
        }
    }
    return -1;
}

exports.addItem = addItem;
exports.saveData = saveData;
exports.toString = toString;