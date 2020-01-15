// 创建flv解析的应用接口
const parse_flv = require('./anls')
const http = require('http')
const https = require('https')
const url = require('url')
const fs = require('fs')
const { buffer_to_hex } = require('./tools')

// 判断url是不是一个http请求还是文件的路径
function ishttp(__url){
    return /^http/g.test(__url)
}

// 创建一个类来封装应用接口
function flv(opt){
    if(!(this instanceof flv)){
        return new flv(opt)
    }
    if(typeof opt === "string"){
        this.url = opt
    }
    if(typeof opt === "object"){
        this.url = opt.url
    }
}

// 创建解析flv信息的接口
flv.prototype.info = function(__fn){
    this.__once().then((data)=>{
        var hex = buffer_to_hex(data)
        var result = parse_flv(hex)
        var message = result.body.__info.body
        __fn(message)
    })
}

// 解析flv视频的全部信息
flv.prototype.message = function(__fn){
    this.__init().then((data)=>{
        var hex = buffer_to_hex(data)
        var result = parse_flv(hex)
        __fn(result)
    })
}

// 获取视频的全部buffer数据
flv.prototype.__init = function(){
    return new Promise((__resolve, __reject)=>{
        if(ishttp(this.url)){
            // 说明是一个http或者https请求
            this.__ishttp = true
            this.__protocol = url.parse(this.url).protocol
            if(this.__protocol === 'http:'){
                var chunks = []
                http.get(this.url,(__res)=>{
                    __res.on("data", (chunk)=>{
                        chunks.push(chunk)
                    })
                    __res.on("end", ()=>{
                        this.__buffer = Buffer.concat(chunks)
                        __resolve(this.__buffer)
                    })
                })
            }
            if(this.__protocol === 'https:'){
                var chunks = []
                https.get(this.url, (__res)=>{
                    __res.on("data", (chunk)=>{
                        chunks.push(chunk)
                    })
                    __res.on('end', ()=>{
                        this.__buffer = Buffer.concat(chunks)
                        __resolve(this.__buffer)
                    })
                })
            }
        }else{
            this.__ishttp = false
            this.__protocol = null
            fs.readFile(this.url, (err, data)=>{
                if(err) throw err
                this.__buffer = data
                __resolve(data)
            })
        }
    })
}

// 获取视频的最开始一段的buffer数据
flv.prototype.__once = function(){
    return new Promise((__resolve, __reject)=>{
        if(ishttp(this.url)){
            // 说明是一个http或者https请求
            this.__ishttp = true
            this.__protocol = url.parse(this.url).protocol
            if(this.__protocol === 'http:'){
                http.get(this.url,(__res)=>{
                    __res.on("data", (chunk)=>{
                        this.__buffer = chunk
                        __resolve(chunk)
                    })
                })
            }
            if(this.__protocol === 'https:'){
                https.get(this.url, (__res)=>{
                    __res.on("data", (chunk)=>{
                        this.__buffer = chunk
                        __resolve(chunk)
                    })
                })
            }
        }else{
            this.__ishttp = false
            this.__protocol = null
            fs.readFile(this.url, (err, data)=>{
                if(err) throw err
                this.__buffer = data
                __resolve(data)
            })
        }
    })
}

module.exports = flv