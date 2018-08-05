function getSalarys (salaryStr) {
    let salarys = salaryStr.split('-')
    salarys = salarys.map(e => {
        return e.substring(0, e.length - 1)
    })
    return {
        minSalary: salarys[0] - 0,
        maxSalary: salarys[1] - 0
    }
}

function spliceJsonVal (obj, ifDeep = true) {
    if (!(obj instanceof Object)) return obj.toString()
    let result = ''
    function spliceJsonVal_Deep (obj, ifDeep = true) {
        let str = ''
        for(let key in obj) {
            if (obj[key] instanceof Object) {
                str += spliceJsonVal_Deep(obj[key], ifDeep)
            } else {
                str += obj[key]
            }
        }
        return str
    }
    result = spliceJsonVal_Deep(obj, ifDeep)
    return result
}

function arrayUnique(arr, key)
{
    let result = []
    const hash = new Object();
    for (var i = 0,j = 0; i < arr.length; i ++)
    {
        if (key !== undefined) {
            if (hash[arr[i][key]] === undefined)
            {
                hash[arr[i][key]] = j++;
                result.push(arr[i])
            }
        } else {
            if (hash[arr[i]] === undefined)
            {
                hash[arr[i]] = j++;
                result.push(arr[i])
            }
        }
    }
    return result;
} 

exports.getSalarys = getSalarys
exports.spliceJsonVal = spliceJsonVal
exports.arrayUnique = arrayUnique