const { get_tag_type } = require('./common')
const { hex_to_ten_array } = require('./tools')

function parse_audio(__array){
    // 处理音频
    // back-pointers 4个字节
    var back_pointers = hex_to_ten_array(__array.splice(0, 4))
    // tag 类型
    var tag_type = get_tag_type(__array.shift())
    // size 3个字节 视频头信息数据长度
    var size = hex_to_ten_array(__array.splice(0, 3))
    // timestreamp 3个字节
    var timestreamp = hex_to_ten_array(__array.splice(0, 3))
    // TimestampExtended 1个字节
    var TimestampExtended = hex_to_ten_array(__array.shift())
    // stream id 3个字节
    var stream_id = hex_to_ten_array(__array.splice(0, 3))
    var audio_info = {
        'back-pointers':back_pointers,
        'tag-type':tag_type,
        size,
        timestreamp,
        TimestampExtended,
        'stream id':stream_id
    }
    var audio_data = __array.splice(0, size)
    var audio_body = parse_audio_data(audio_data)
    var __audio = {
        header: audio_info,
        body: audio_body
    }
    return { __audio, __array }
}

// 解析音频格式
function get_sound_format(__num){
    var num = hex_to_ten_array(__num)
    // 0	Linear PCM, platform endian
    // 1	ADPCM
    // 2	MP3
    // 3	Linear PCM, little endian
    // 4	Nellymoser 16-kHz mono
    // 5	Nellymoser 8-kHz mono
    // 6	Nellymoser
    // 7	G.711 A-law logarithmic PCM
    // 8	G.711 mu-law logarithmic PCM
    // 9	reserved
    // 10	AAC
    // 11	Speex
    // 14	MP3 8-Khz
    // 15	Device-specific sound
    switch(num){
        case 0:
            return 'Linear PCM, platform endian'
        case 1:
            return 'ADPCM'
        case 2:
            return 'MP3'
        case 3:
            return 'Linear PCM, little endian'
        case 4:
            return 'Nellymoser 16-kHz mono'
        case 5:
            return 'Nellymoser 8-kHz mono'
        case 6:
            return 'Nellymoser'
        case 7:
            return 'G.711 A-law logarithmic PCM'
        case 8:
            return 'G.711 mu-law logarithmic PCM'
        case 9:
            return 'reserved'
        case 10:
            return 'AAC'
        case 11:
            return 'Speex'
        case 14:
            return 'MP3 8-Khz'
        case 15:
            return 'Device-specific sound'
    }
}

// 获取采样率
function get_sound_rate(__array){
    var num = parseInt(__array.join(''), 2)
    // 0	5.5-kHz
    // 1	11-kHz
    // 2	22-kHz
    // 3	44-kHz
    switch(num){
        case 0:
            return '5.5-kHz'
        case 1:
            return '11-kHz'
        case 2:
            return '22-kHz'
        case 3:
            return '44-kHz'
    }
}

// 获取采样长度
function get_sound_size(__num){
    var num = parseInt(__num, 2)
    // 0	snd8Bit
    // 1	snd16Bit
    if(num){
        return 'snd16Bit'
    }else{
        return 'snd8Bit'
    }
}

// 获取音频类型
function get_sound_type(__num){
    var num = parseInt(__num, 2)
    // 0	sndMono
    // 1	sndStereo
    if(num){
        return 'sndStereo'
    }else{
        return 'sndMono'
    }
}

// 解析音频数据有信息
function parse_audio_data(__array){
    // 音频信息是 1个字节
    // 前4位为音频格式
    var __info = __array.shift().split('')
    // 解析前4位，获取音频格式
    var sound_format = get_sound_format(__info[0])
    // 2位是采样率
    var __infos = Number(hex_to_ten_array(__info[1])).toString(2).split('')
    // 获取采样率
    var sound_rate = get_sound_rate(__infos.splice(0, 2))
    // 获取采样长度
    var sound_size = get_sound_size(__infos.shift())
    // 获取音频类型
    var sound_type = get_sound_type(__infos.shift())
    var sound_info = {
        SoundFormate: sound_format,
        SoundRate: sound_rate,
        SoundSize: sound_size,
        SoundType: sound_type
    }
    // 如果 sound_formate为10，那么会多出一个字节
    if(sound_format === 'AAC'){
        // 说明 sound_format 为10，那么会多出一个字节
        sound_info.AACPacketType = __array.shift()
    }
    sound_info['audio-data'] = __array
    return sound_info
}


module.exports = {
    parse_audio
}