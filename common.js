// 获取tag的类型，8为audio，9为video，18为scripts
function get_tag_type(__num){
    var num = parseInt(__num, 16)
    if(num === 8){
        return 'audio'
    }
    if(num === 9){
        return 'video'
    }
    if(num === 18){
        return 'scripts'
    }
}



module.exports = {
    get_tag_type
}