const { get_tag_type } = require('./common')
const { hex_to_ten_array, __and } = require('./tools')
const { parse_sps } = require('./sps')

// ****** 处理视频 ******
function parse_video(__array){
    // 处理视频
    // back-pointers 4个字节
    var back_pointers = hex_to_ten_array(__array.splice(0, 4))
    // tag类型
    var tag_type = get_tag_type(__array.shift())
    // size 3个字节 视频头信息数据长度
    var size = hex_to_ten_array(__array.splice(0, 3))
    // timestreamp 3个字节
    var timestreamp = hex_to_ten_array(__array.splice(0, 3))
    // TimestampExtended 1个字节
    var TimestampExtended = hex_to_ten_array(__array.shift())
    // stream id 3个字节
    var stream_id = hex_to_ten_array(__array.splice(0, 3))
    var video_info = {
        'back-pointers':back_pointers,
        'tag-type':tag_type,
        size,
        timestreamp,
        TimestampExtended,
        'stream id':stream_id
    }
    var __video = {}
    __video.header = video_info
    var video_data = __array.splice(0, size)
    var { __object, array } = parse_video_data(video_data)
    __video.body = __object
    if(__object.AVCPacketType === 'AVCDecoderConfigurationRecord'){
        // 说明包含 sps和pps数据
        var sps_pps_info = parse_sps(array)
        __video.body['SPS'] = sps_pps_info
    }
    if(__object.AVCPacketType === 'AVC NALU'){
        // 说明是视频帧数据
        // __video.NALU = array
        __video.NALU = parse_NALU(array)
    }
    return { __video, __array }
}

// 解析 NALU
function parse_NALU(__array, __nalus){
    if(!__nalus){
        __nalus = []
    }
    if(!__array.length){
        return __nalus
    }
    // 一般来说，描述 NALU的长度为4个字节
    var NALU_Length = hex_to_ten_array(__array.splice(0, 4))
    var NALU_data = __array.splice(0, NALU_Length)
    var NALU_TYPE = get_NALU_TYPE(NALU_data[0])
    var __nalu = {
        NALU_Length,
        NALU_TYPE,
        NALU_data
    }
    __nalus.push(__nalu)
    return parse_NALU(__array, __nalus)
}

// 获取 NALU的类型
function get_NALU_TYPE(__num){
    // 获取 NALU包的第一个字节，这个字节的前5位就是NALU包的类型
    var num = __and(__num, '1f')
    // #define NALU_TYPE_SLICE 1
    // #define NALU_TYPE_DPA 2
    // #define NALU_TYPE_DPB 3
    // #define NALU_TYPE_DPC 4
    // #define NALU_TYPE_IDR 5
    // #define NALU_TYPE_SEI 6
    // #define NALU_TYPE_SPS 7
    // #define NALU_TYPE_PPS 8
    // #define NALU_TYPE_AUD 9　　//访问分隔符
    // #define NALU_TYPE_EOSEQ 10
    // #define NALU_TYPE_EOSTREAM 11
    // #define NALU_TYPE_FILL 12
    switch(num){
        case 1:
            return 'NALU_TYPE_SLICE'
        case 2:
            return 'NALU_TYPE_DPA'
        case 3:
            return 'NALU_TYPE_DPB'
        case 4:
            return 'NALU_TYPE_DPC'
        case 5:
            return 'NALU_TYPE_IDR'
        case 6:
            return 'NALU_TYPE_SEI'
        case 7:
            return 'NALU_TYPE_SPS'
        case 8:
            return 'NALU_TYPE_PPS'
        case 9:
            return 'NALU_TYPE_AUD' //访问分隔符
        case 10:
            return 'NALU_TYPE_EOSEQ'
        case 11:
            return 'NALU_TYPE_EOSTREAM'
        case 12:
            return 'NALU_TYPE_FILL'
    }
}

// 获取 帧类型 （Frame type）
function get_frame_type(__num){
    var num = hex_to_ten_array(__num)
    // 1	keyframe (for AVC, a seekable frame) 关键帧
    // 2	inter frame (for AVC, a non-seekable frame)
    // 3	disposable inter frame (H.263 only)
    // 4	generated keyframe (reserved for server use only)
    // 5	video info/command frame
    switch(num){
        case 1:
            return 'keyframe'
        case 2:
            return 'inter frame'
        case 3:
            return 'disposable inter frame'
        case 4:
            return 'generated keyframe'
        case 5:
            return 'video info/command frame'
    }
}

// 获取 编码ID （CodecID）
function get_codecid(__num){
    var num = hex_to_ten_array(__num)
    // 1	JPEG (currently unused)
    // 2	Sorenson H.263
    // 3	Screen video
    // 4	On2 VP6
    // 5	On2 VP6 with alpha channel
    // 6	Screen video version 2
    // 7	AVC(H.264)
    switch(num){
        case 1:
            return 'JPEG'
        case 2:
            return 'Sorenson H.263'
        case 3:
            return 'Screen video'
        case 4:
            return 'On2 VP6'
        case 5:
            return 'On2 VP6 with alpha channel'
        case 6:
            return 'Screen video version 2'
        case 7:
            return 'AVC(H.264)'
    }
}

// 获取 AVC包类型 AVCPacketType
function get_avc_packet_type(__num){
    var num = hex_to_ten_array(__num)
    // 0	AVCDecoderConfigurationRecord(AVC sequence header)
    // 1	AVC NALU
    // 2	AVC end of sequence (lower level NALU sequence ender is not required or supported)
    switch(num){
        case 0:
            return 'AVCDecoderConfigurationRecord'
        case 1:
            return 'AVC NALU'
        case 2:
            return 'AVC end of sequence'
    }
}

// 获取 CompositionTime
function get_CompositionTime(__num,__array){
    var AVCPacketType = hex_to_ten_array(__num)
    // AVCPacketType ==1	Composition time offset
    // AVCPacketType !=1	0
    if(AVCPacketType === 1){
        return hex_to_ten_array(__array)
    }else{
        return 0
    }
}

// 特殊情况下 解析多追加多4个字节
function parse_avc_packet(__array){
    // AVCPacketType 占1个字节
    var avc_num = __array[0]
    var avc_packet_type = get_avc_packet_type(__array.shift())
    // CompositionTime 占3个字节
    var CompositionTime = get_CompositionTime(avc_num, __array)
    return {
        AVCPacketType:avc_packet_type,
        CompositionTime
    }
}



// 解析视频数据头信息
function parse_video_data(__array){
    // 视频信息 1个字节
    // 前4位是 帧类型Frame Type，后4位为 编码ID (CodecID)
    var __info = __array.shift().split('')
    var frame_type = get_frame_type(__info[0])
    var codecid = get_codecid(__info[1])
    var __object = {}
    __object['FrameType'] = frame_type
    __object['Codecid'] = codecid
    // 视频的格式(CodecID)是AVC（H.264）的话，VideoTagHeader会多出4个字节的信息
    if(codecid === 'AVC(H.264)'){
        // 说明是特殊情况，要多追加4个字节
        var { AVCPacketType, CompositionTime } = parse_avc_packet(__array.splice(0, 4))
        __object['AVCPacketType'] = AVCPacketType
        __object['CompositionTime'] = CompositionTime
    }
    var array = __array
    return { __object, array }
}


module.exports = {
    parse_video
}