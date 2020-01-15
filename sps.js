const { hex_to_ten_array } = require('./tools')


// 解析sps和pps数据
function parse_sps(__array){
    var sps = []
    // sps和pps的存储的格式如下：
    // 0x01+sps[1]+sps[2]+sps[3]+0xFF+0xE1+sps size+sps+01+pps size+pps
    var configurationVersion = __array.shift()
    if(configurationVersion !== '01'){
        // 0x01
        throw new Error('is not 0x01 in sps')
    }
    // AVCProfileIndication
    sps[1] = __array.shift()
    var AVCProfileIndication = sps[1]
    // profile_compatibility
    sps[2] = __array.shift()
    var profile_compatibility = sps[2]
    // AVCLevelIndication
    sps[3] = __array.shift()
    var AVCLevelIndication = sps[3]
    // lengthSizeMinusOne
    var lengthSizeMinusOne = __array.shift()
    if(lengthSizeMinusOne !== 'ff'){
        // 0xff
        throw new Error('is not 0xff in sps')
    }
    // numOfSequenceParameterSets
    var numOfSequenceParameterSets = __array.shift()
    if(numOfSequenceParameterSets !== 'e1'){
        // 0xe1
        throw new Error('is not 0xe1 in sps')
    }
    // sps size 2个字节 sps数据的长度
    var __sps_size = hex_to_ten_array(__array.splice(0, 2))
    var __sps_data = __array.splice(0, __sps_size)
    var __sps = {
        // sps,
        sequenceParameterSetLength: __sps_size,
        sequenceParameterSetNALUnits: __sps_data,
        configurationVersion,
        AVCProfileIndication,
        profile_compatibility,
        AVCLevelIndication,
        lengthSizeMinusOne,
        numOfSequenceParameterSets
    }
    // numOfPictureParameterSets
    var numOfPictureParameterSets = __array.shift()
    if(numOfPictureParameterSets !== '01'){
        throw new Error('is not 0x01 in pps')
    }
    // pictureParameterSetLength
    var __pps_size = hex_to_ten_array(__array.splice(0, 2))
    // pictureParameterSetNALUnits
    var __pps_data = __array.splice(0, __pps_size)
    var __pps = {
        pictureParameterSetLength: __pps_size,
        pictureParameterSetNALUnits: __pps_data
    }
    var __body = {
        __sps,
        __pps
    }
    return __body
}


module.exports = {
    parse_sps
}