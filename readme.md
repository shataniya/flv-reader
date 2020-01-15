#### flv-reader
- 解析flv视频
##### 下载方式
> npm i flv-reader
##### 使用方法
```javascript
const flv = require('flv-reader')
// 如果是解析本地的flv视频
flv('./video/demo.flv').info(function(msg){
    console.log(msg)
})
// 如果是通过http请求获取的flv视频
flv('http://example.com/demo.flv').info(function(msg){
    console.log(msg)
})
```