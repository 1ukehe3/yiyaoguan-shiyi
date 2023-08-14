const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const Core = require('@alicloud/pop-core');
const mongoose = require('mongoose');

let users = [];

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500'); // 允许来自指定源的请求
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // 允许的 HTTP 方法
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // 允许的请求头部
  next();
});

let sentVerificationCode = '';
let sentUsersname="";
let sentPassword="";
let sentPhone="";
// 验证码存储对象，用于存储手机号和对应的验证码


function generateVerificationCode(digits) {
    var code = "";
    for (var i = 0; i < digits; i++) {
      code += Math.floor(Math.random() * 10);
    }
    return code;
  }

  app.post('/sendVerificationCode', (req, res) => {
    // 从请求体中获取手机号码
    const {username,password,phone } = req.body;
    const verificationCode = generateVerificationCode(6);
    sentVerificationCode = verificationCode.toString();
     sentUsersname=username;
     sentPassword=password;
     sentPhone=phone;
    // 检查用户名是否已存在


    // 调用短信服务提供商的 API，发送验证码到指定手机号码
    sendVerificationCode(phone,verificationCode)
      .then(response => {
       
        // 发送成功
        res.status(200).json({ success: true, message: '验证码发送成功' });
      })
      .catch(error => {
        // 发送失败
        console.error('发送验证码请求失败:', error);
        res.status(500).json({ success: false, message: '验证码发送失败' });
      });
 } );

// 发送短信验证码
async function sendVerificationCode(phone,code) {
      // 构建发送验证码的 API 请求参数
      
      const accessKeyId = 'LTAI5tP6JhX1Kpg8wKpS3iEZ';
    const accessKeySecret = 'dqX96HRUcxBQy3Bqiso11E4rppQfAN';
    const regionId = 'cn-hangzhou'; // 替换为你的短信服务所在的地域
    const signName = '阿里云短信测试'; // 替换为你的短信签名
    const templateCode = 'SMS_154950909'; // 替换为你的短信模板 CODE
     
  
      const client = new Core({
        accessKeyId: accessKeyId,
        accessKeySecret: accessKeySecret,
        endpoint: `https://dysmsapi.aliyuncs.com`,
        apiVersion: '2017-05-25'
      });
    
      const params = {
        accessKeyId: accessKeyId,
        accessKeySecret:accessKeySecret,
      
        RegionId: regionId,
        PhoneNumbers: phone,
        SignName: signName,
        TemplateCode: templateCode,
        TemplateParam: JSON.stringify({ code: code })
      };
  
   // 发送 API 请求
   const requestOption = {
    method: 'POST'
  };
  try {


    const response = await client.request('SendSms', params, requestOption);
    if (response.Code === 'OK') {
     
      console.log('验证码已成功发送到手机号码:',sentVerificationCode);
      
      return true;
    } else {
      console.error('发送验证码请求失败' );
      
      return false;
    }
  } catch (error) {
    
    console.error('发送验证码请求失败:',sentVerificationCode);
    
    return false;
  }
}

// 验证验证码
function verifyVerificationCode(userVerificationCode) {
  if (userVerificationCode === sentVerificationCode) {
    // 验证码匹配，返回验证通过的响应
    return { success: true, message: '验证码验证通过' };
  } else {
    // 验证码不匹配，返回验证失败的响应
    return { success: false, message: '验证码验证失败' };
  }
}
function verifyUsername(username) {
  if (username === sentUsersname) {
    // 验证码匹配，返回验证通过的响应
    return { success: true, message: '用户名验证通过' };
  } else {
    // 验证码不匹配，返回验证失败的响应
    return { success: false, message: '用户名验证失败' };
  }
}
function verifyPassword(password) {
  if (password === sentPassword) {
    // 验证码匹配，返回验证通过的响应
    return { success: true, message: '密码验证通过' };
  } else {
    // 验证码不匹配，返回验证失败的响应
    return { success: false, message: '密码验证失败' };
  }
}
function verifyPhone(phone) {
  if (phone === sentPhone) {
    // 验证码匹配，返回验证通过的响应
    return { success: true, message: '手机号验证通过' };
  } else {
    // 验证码不匹配，返回验证失败的响应
    return { success: false, message: '手机号验证失败' };
  }
}

// 注册的路由

  app.post('/register', (req, res) => {
    
    // 获取用户提交的表单数据
    const {username,password,phone, userVerificationCode} = req.body;
  
  


  // 调用验证验证码的函数
  const verificationResult = verifyVerificationCode(userVerificationCode);
  const verifyUsernameResult=verifyUsername(username);
  const verifyPasswordResult=verifyPassword(password);
  const verifyPhoneResult=verifyPhone(phone);

  if (verificationResult.success&&verifyUsernameResult.success&&verifyPasswordResult.success&&verifyPhoneResult.success){
     // 创建新用户对象
     const newUser = { username, password, phone };
  
     // 将新用户添加到数组中
     users.push(newUser);
   
     // 返回注册成功的响应
     res.status(200).json({ success: true, message: '注册成功' });

  }
  
  else {
    sentVerificationCode = '';
    // 返回注册失败的响应
    res.status(400).json({ success: false, message: '注册失败，信息填写错误' });
  }
   
  });

  






app.listen(3002, () => {
  console.log('Server started on port 3002');
});
