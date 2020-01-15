// const fs = require('fs')
// const __path = require('path')
// function read_directory(path,folder){
//     if(!folder){
//         path = path
//     }else{
//         path = __path.join(path,folder)
//     }
//     var files = {}
//     var ds = fs.readdirSync(path) // 获取目录下的 文件和文件夹
//     for(let i=0,len=ds.length;i<len;i++){
//         var result = fs.statSync(__path.join(path,ds[i]))
//         // result.isDirectory() 判断是不是目录
//         if(result.isDirectory()){
//             // 说明是目录
//             files[ds[i]] = read_directory(path,ds[i])
//         }else{
//             // 说明是文件
//             files[ds[i]] = true
//         }
//     }
//     return files
// }
// var files = read_directory(process.cwd())
// console.log(files)

const http = require('http')
const fs = require('fs')
http.createServer((__req, __res)=>{
    // console.log(__req.url)
    __res.setHeader("Access-Control-Allow-Origin","*")
    fs.createReadStream('./video/告白气球.flv').pipe(__res)
}).listen(3000,function(){
    console.log('server is running at http://localhost:3000')
})


