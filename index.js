const express=require('express');//引入模块
const app=express();
const config = require('./config')
const compress = require('compression')

const route = require('./route/index')

app.use(compress())
app.use(express.urlencoded({extended: false}))
app.use(express.json())

/*
  跨域配置：响应头允许跨域
*/
app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type,x-access-token');
    if(req.method=="OPTIONS") res.sendStatus(200);
    else next();
})

app.use('/api', route)

app.listen(config.network.port, function () {
    console.log(`端口${config.network.port}开启成功~~~`);
});