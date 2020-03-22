const express = require('express')
const router = express.Router()
const fs = require('fs');
const qn = require('qn');

const User = require('../models/user');
const Good = require('../models/goods');
require('./../util/dateFormat')
// 空间名
const bucket = 'avatar-img-d';
// 七牛云
const client = qn.create({
    accessKey: 'n83SaVzVtzNbZvGCz0gWsWPgpERKp0oK4BtvXS-Y',
    secretKey: '1Uve9T2_gQX9pDY0BFJCa1RM_isy9rNjfC4XVliW',
    bucket: bucket,
    origin: 'http://ouibvkb9c.bkt.clouddn.com'
})

// 登陆接口
router.post('/login', async (req, res) => {

    let {userName, userPwd} = req.body;
    const doc = await User.findOne({userName, userPwd});
    try {
        if (doc) {
            const {userId, name, avatar} = doc
            res.cookie("userId", userId, {
                path: '/',
                maxAge: 1000 * 60 * 60
            });
            res.json({
                status: '0',
                msg: '登陆成功',
                result: {
                  name,
                  avatar,
                  userId
                }
            })
        } else {
            res.json({
                status: '1',
                msg: '账号或者密码错误',
                result: ''
            })
        }
    } catch (err) {
        res.json({
            status: '1',
            msg: err.message,
            result: ''
        })
    }

})

// 登出登陆
router.post('/loginOut', (req, res) => {
    res.cookie("userId", "", {
        path: "/",
        maxAge: -1
    });
    res.json({
        status: "0",
        msg: '',
        result: ''
    })
})

// 注册账号
router.post('/register', async (req, res) => {
    const {userName, userPwd, nickName} = req.body;
    try {
        const doc = await User.findOne({userName})
        if (doc) {
            res.json({
                status: '1',
                msg: '账号已存在!',
                result: ''
            })
        } else {
            let r1 = Math.floor(Math.random() * 10);
            let r2 = Math.floor(Math.random() * 10);
            let userId = `${r1}${(Date.parse(new Date())) / 1000}${r2}`
            // 可以注册
            User.insertMany({
                // avatar: 'http://osc9sqdxe.bkt.clouddn.com/default-user-avatar.png',
                avatar: '/static/images/avatar.jpg',
                name: nickName,
                cartList: [],
                orderList: [],
                addressList: [],
                userName,
                userId,
                userPwd
            })
            res.json({
                status: '0',
                msg: '注册成功',
                result: ''
            })
        }

    } catch (err) {
        res.json({
            status: '1',
            msg: err.message,
            result: ''
        })
    }
})

// 上传图片
router.post('/upload',  (req, res, next) => {
  var userId = req.cookies.userId;
    // 图片数据流
    var imgData = req.body.imgData;
    // 构建图片名
    var fileName = Date.now() + '.png';
    // 构建图片路径
    var filePath = './image/' + fileName;
  User.update({"userId": userId},
    {
      "avatar": imgData
    }, (err, doc) => {
      if (err) {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        })
      } else {
        res.json({
          status: '0',
          msg: '',
          result: '修改成功'
        });
      }
    })
})

// 获取用户信息
router.post('/userInfo', async (req, res) => {
    const {userId} = req.cookies
    if (userId) {
        let {name, avatar} = await  User.findOne({userId})
        res.json({
            status: 0,
            msg: 'suc',
            result: {
                name,
                avatar
            }
        })
    } else {
        res.json({
            status: 1,
            msg: '未登录',
            result: ''
        })
    }
})

module.exports = router