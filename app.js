// app.js

const express = require('express');
const app = express();

// 引入bazi.js和veriy.js文件
const bazi = require('./bazi');
const verify = require('./verify');

// 设置路由
app.get('./app/bazi', (req, res) => {
  // 处理bazi.js中的逻辑，并返回相应的数据
  const result = bazi.calculateBazi(req.query);
  res.json(result);
});

app.get('/verify', (req, res) => {
  // 处理verify.js中的逻辑，并返回相应的数据
  const result = verify.verifyData(req.query);
  res.json(result);
});

// 启动服务器
const port = 3003;
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
