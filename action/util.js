/**
 * Created by miaokun on 2014/9/15.
 */
function parseIntEx(value)
{
    var result = parseInt(value);
    if(isNaN(result))
    {
        return 0;
    }
    else
    {
        return result;
    }
}

exports.parseInt = parseIntEx;