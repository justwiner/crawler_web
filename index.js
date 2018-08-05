const express=require('express');//引入模块
const app=express();
const config = require('./config')
const compress = require('compression')

const route = require('./route/index')

app.use(compress())
app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use('/api', route)

app.listen(config.network.port, function () {
    console.log(`端口${config.network.port}开启成功~~~`);
});