// 解析flv文件
const { float_point_array, data_string, buffer_to_hex, __and } = require('./tools')
const { get_tag_type } = require('./common')
const { parse_media } = require('./media')

function isArray(__array){
    return Array.isArray(__array)
}

// 获取 back-pointers
function get_back_pointers(__array){
    return parseInt(__array.join(''), 16)
}



// 获取tag的数据长度
function get_tag_data_size(__array){
    return parseInt(__array.join(''), 16)
}

// 获取时间戳
function get_Timestamp(__array){
    return parseInt(__array.join(''), 16)
}

// 获取时间戳扩展字段
function get_TimestampExtended(__num){
    return parseInt(__num, 16)
}

// 获取stream id 
function get_stream_id(__array){
    return parseInt(__array.join(''), 16)
}

// Get the length of the data according to the data type
// 根据数据类型，获取数据的长度，字节为单位
function get_data_type_and_size(__num){
    var num = parseInt(__num, 16)
    var type = null
    var size = null
    switch(num){
        case 0:
            type = 'number' // 一旦是number类型，那么后面的8个字节组成一个64位浮点数
            size = 8
            break
        case 1:
            type = 'boolean' // 一旦是boolean类型，那么后面的1个字节就是数据的长度
            size = 1
            break
        case 2:
            type = 'string' // 一旦是string，那么后边的2个字节就是数据长度
            size = 2
            break
        case 3:
            type = 'object'
            break
        case 8:
            type = 'array' // 一旦是数组类型，那么数据就是键值对的形式，类似于map
            size = 4
            break
        case 10:
            type = 'strict_array'
            size = 4
            break
    }
    return { type, size }
}



// 解析flv header部分
function parse_flv_header(__array){
    if(!isArray(__array)){
        throw new Error('the param is not array')
    }
    // 前三个字节是 flv文件标识符 
    var ident = data_string(__array.splice(0,3))
    var version = __array.shift()
    var flags = __array.shift()
    var data_offset = parseInt(__array.join(''),16)
    var header = {
        'file-type':ident,
        version,
        flags,
        data_offset
    }
    return header
}

// 解析flv body部分
function parse_tag_header(__array){
    // back-poinrts 4个字节
    var back_points = get_back_pointers(__array.splice(0,4))
    // tag-type 1个字节
    var tag_type = get_tag_type(__array.shift())
    // tag-data-size 3个字节
    var tag_data_size = get_tag_data_size(__array.splice(0,3))
    // Timestamp 3个字节
    var Timestamp = get_Timestamp(__array.splice(0,3))
    // TimestampExtended 1个字节
    var TimestampExtended = get_TimestampExtended(__array.shift())
    // stream id 3个字节
    var stream_id = get_stream_id(__array.splice(0,3))
    var tag_header = {
        'back-pointers':back_points,
        'tag-type':tag_type,
        'tag-data-size':tag_data_size,
        Timestamp,
        TimestampExtended,
        'stream-id':stream_id
    }
    return { tag_header, __array }
}

// 获取第一个AMF包，主要就是获取装入 onMetaData 标签的包
function get_first_AMF_package(__array){
    var { type, size } = get_data_type_and_size(__array.shift())
    if(type === 'string'){
        var data_length = parseInt(__array.splice(0,size).join(''), 16)
        var value = data_string(__array.splice(0,data_length))
        return { type, value, __array }
    }else{
        throw new Error('is not first package')
    }
}

function get_data_info(__array){
    var { type, size } = get_data_type_and_size(__array.shift())
    if(type === 'string'){
        var data_length = parseInt(__array.splice(0,size).join(''), 16)
        var value = data_string(__array.splice(0,data_length))
        return { type, value, __array }
    }
    if(type === 'number'){
        var data_length = size
        var value = float_point_array(__array.splice(0, data_length))
        return { type, value, __array }
    }
    if(type === 'boolean'){
        // var data_length = size
        var value = parseInt(__array.shift(), 16) ? true : false
        return { type, value, __array }
    }
    if(type === 'array'){
        var data_length = parseInt(__array.splice(0, size).join(''), 16)
        var arraymap_length = data_length
        return { type, value, __array, arraymap_length }
    }
    if(type === 'strict_array'){
        var data_length = parseInt(__array.splice(0, size).join(''), 16)
        var strict_array_length = data_length
        return { type, value, __array, strict_array_length }
    }
    if(type === 'object'){
        return { type, __array }
    }
}


// 获取键值对的 key
function get_arraymap_key(__array){
    var data_length = parseInt(__array.splice(0,2).join(''), 16)
    var arraymap_key = data_string(__array.splice(0, data_length))
    return { arraymap_key, __array }
}

// 获取键值对的value
function get_arraymap_value(__array){
    var { type, value, __array } = get_data_info(__array)
    var arraymap_value = value
    return { arraymap_value, __array, type }
}

// 获取键值对
function get_arraymap(__array, __arraymap){
    var { arraymap_key, __array } = get_arraymap_key(__array)
    var { arraymap_value, __array, type } = get_arraymap_value(__array)
    if(type !== 'object'){
        __arraymap[arraymap_key] = arraymap_value
        return get_arraymap(__array, __arraymap)
    }else{
        var { __array, __object } = deal_object(__array)
        __arraymap[arraymap_key] = __object
        __arraymap['end-mark'] = __array
        return __arraymap
    }
    
}

function deal_array(__array){
    var __arraymap = {}
    return get_arraymap(__array, __arraymap)
}

// 处理 当type为object当情况
function deal_object(__array, __object){
    if(__array.length < 8){
        return { __array, __object }
    }
    if(!__object){
        __object = {}
    }
    var { arraymap_key, __array } = get_arraymap_key(__array)
    var { type, value, __array, strict_array_length } = get_data_info(__array)
    __object[arraymap_key] = {}
    __object[arraymap_key]['length'] = strict_array_length
    __object[arraymap_key]['data'] = []
    if(type === 'strict_array'){
        var { __array } = deal_object_data(__array, __object[arraymap_key])
        // console.log(__array)
        return deal_object(__array, __object)
    }
}

// 处理 keyframes 的元信息
function deal_object_data(__array, __object){
    if(__object.data.length >= __object.length){
        return { __array, __object }
    }
    var { type, value, __array } = get_data_info(__array)
    if(type === 'number'){
        // 判断数据是不是到达指定的长度
        __object.data.push(value)
        return deal_object_data(__array, __object)
    }else{
        return { __array, __object }
    }
}


function parse_tag_data(__array){
    var { type, value, __array } = get_first_AMF_package(__array)
    var first_AMF = value
    var __object = {}
    __object.sign = first_AMF
    var { type, value, __array, arraymap_length } = get_data_info(__array)
    if(type === 'array'){
        __object['tag-data-type'] = 'array-map'
        var __arraymap = deal_array(__array)
        __arraymap.length = arraymap_length
        __object.__arraymap = __arraymap
    }
    return __object
}

function parse_flv_body(__array){
    var __body = {}
    var { tag_header, __array } = parse_tag_header(__array)
    __body.header = tag_header
    var tag_size = tag_header['tag-data-size']
    var tag_body_array = __array.splice(0, tag_size)
    var tag_data = parse_tag_data(tag_body_array)
    // 说明此时已经解析了flv文件的整体信息 scripts
    // 接下就是解析媒体数据，video 和 audio
    // console.log(__array)
    var __media = parse_media(__array)
    // console.log(__media)
    __body.body = tag_data
    var __flv = {}
    __flv.__info = __body
    __flv.__tag = __media
    // return __body
    return __flv
}


function parse_flv(__array){
    var __flv = {}
    var flv_header = parse_flv_header(__array.splice(0,9))
    __flv.header = flv_header
    var flv_body = parse_flv_body(__array)
    __flv.body = flv_body
    return __flv
}

module.exports = parse_flv


// const http = require('http')
// const fs = require('fs')
// http.get('http://localhost:3000',function(__res){
//     var chunks = []
//     var N = 200000
//     __res.on("data",function(chunk){
//         chunks.push(chunk)
//     })
//     __res.on("end",function(){
//         var bufs = Buffer.concat(chunks)
//         var part = bufs.slice(0,N)
//         var hexs = buffer_to_hex(part)
//         var result = parse_flv(hexs)
//         // console.log(result)
//         fs.writeFile('anls.json',JSON.stringify(result,null,5),function(){
//             console.log('ok')
//         })
//     })
// })
