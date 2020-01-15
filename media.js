const { get_tag_type } = require('./common')
const { parse_video } = require('./video')
const { parse_audio } = require('./audio')

function parse_media(__array, __media){
    if(!__media){
        var __media = []
    }
    if(!__array.length){
        return __media
    }
    var tag_type = get_tag_type(__array[4])
    if(tag_type === 'video'){
        // 说明是视频
        var { __video, __array } = parse_video(__array)
        __media.push(__video)
        return parse_media(__array, __media)
    }
    if(tag_type === 'audio'){
        // 说明是音频
        var { __audio, __array } = parse_audio(__array)
        __media.push(__audio)
        return parse_media(__array, __media)
    }
}



module.exports = {
    parse_media
}