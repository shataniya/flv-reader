function fill_zero(__num){
    var s = ''
    for(let i=0;i<__num;i++){
        s += 0
    }
    return s
}

function hex_to_bin(__array){
    var data_2 = __array.map(el=>{
        var __num = Number(parseInt(el,16)).toString(2) + ''
        if(__num.length < 8){
            return fill_zero(8 - __num.length) + __num
        }else{
            return __num
        }
    })
    return data_2.join('')
}

function decimal_bin(__s){
    var __array = __s.split('')
    var __sum = 0
    for(let i=0,len=__array.length;i<len;i++){
        var __num = +__array[i]
        __sum += __num*Math.pow(2,-(i+1))
    }
    return __sum
}

function float_point(__bin){
    var S = __bin[0]
    var E = __bin.slice(1,12)
    var M = __bin.slice(12)
    var e = parseInt(E,2) - 1023
    var integer = '1' + M.slice(0,e)
    var decimal = M.slice(e)
    var float = parseInt(integer,2) + decimal_bin(decimal)
    return float
}

// 16进制数组 转 浮点数
function float_point_array(__array){
    return float_point(hex_to_bin(__array))
}

// 16进制 转 10进制
function hex_to_ten_array(__array){
    if(!Array.isArray(__array)){
        return parseInt(__array, 16)
    }
    return parseInt(__array.join(''), 16)
}

function data_string(data){
    var data_10 = data.map(el=>parseInt(el,16))
    var data_string = String.fromCharCode.apply(null,data_10)
    return data_string
}

// 16进制转buffer
function hex_to_buffer(__array){
    var array = __array.map(el=>parseInt(el, 16))
    var buf = new Uint8Array(array)
    var __buf = Buffer.from(buf)
    return __buf
}

// buffer转16进制数组
function buffer_to_hex(__buffer){
    if(Object.prototype.toString.call(__buffer) === '[object Uint8Array]'){
        var buf_array = Array.prototype.slice.call(new Uint8Array(__buffer))
        var hex_array = buf_array.map(el=>{
            var __num = Number(el).toString(16)
            if(__num.length === 1){
                return '0' + __num
            }else{
                return __num
            }
        })
        return hex_array
    }else{
        throw new Error('is not buffer')
    }
}

/* 
* @function base_transform
* @param content {array, string, number} 要进行进制转换的内容
* @param to {number} 转换之后的进制
* @param from {number} 转换之前的进制
* @return 转换之后的结果
*/
function base_transform(content, to, from){
    // 默认 10进制 转 16进制
    var to = to || 16
    var from = from || 10
    if(Array.isArray(content)){
        return Number(parseInt(content.join(''), from)).toString(to)
    }
    return Number(parseInt(content, from)).toString(to)
}

// 进行与运算
function __and(__num1, __num2, __base){
    var base = __base || 16 // 默认是16进制
    var num1 = parseInt(__num1, base)
    var num2 = parseInt(__num2, base)
    return num1 & num2
}

module.exports = {
    float_point_array,
    data_string,
    hex_to_buffer,
    hex_to_ten_array,
    buffer_to_hex,
    base_transform,
    __and
}