const express     = require('express');
const router      = express.Router()
const Address        = require('../models/address')
const User        = require('../models/user')

//新增地址
router.post('/add', async (req, res) => {
  let userId = req.cookies.userId;
  let data = req.body;
  data.userId = userId;
  if (userId) {
    try {
      const userDoc = await User.findOne({userId});
      if (userDoc) {
        //如果设为默认，先去掉之前的默认地址
        if (data.isDefault) {
          await Address.update({isDefault: true}, {isDefault: false})
        }
        Address.create(data, (err) => {
          if (!err) {
            res.json({
              status: 0,
              msg: '操作成功',
              result: ''
            })
          }
        })
      } else {
        res.json({
          status: 1,
          msg: '用户不存在',
          result: ''
        })
      }

    } catch (err) {
      res.json({
        status: 1,
        msg: err.message,
        result: ''
      })
    }

  } else {
    res.json({
      status: 1,
      msg: '用户未登录',
      result: ''
    })
  }
});
//列表
router.get('/list', async (req, res) => {
  let userId = req.cookies.userId;
  if (userId) {
    try {
      const userDoc = await User.findOne({userId});
      if (userDoc) {
        Address.find({userId}, (err, data) => {
          if (!err) {
            res.json({
              status: 0,
              msg: '操作成功',
              result: data
            })
          }
        })
      } else {
        res.json({
          status: 1,
          msg: '用户不存在',
          result: ''
        })
      }

    } catch (err) {
      res.json({
        status: 1,
        msg: err.message,
        result: ''
      })
    }

  } else {
    res.json({
      status: 1,
      msg: '用户未登录',
      result: ''
    })
  }
});
//详情
router.get('/detail', async (req, res) => {
  let userId = req.cookies.userId;
  let _id = req.query.addressId;
  if (userId) {
    try {
      const userDoc = await User.findOne({userId});
      if (userDoc) {
        Address.findById(_id, (err, data) => {
          if (!err) {
            res.json({
              status: 0,
              msg: '操作成功',
              result: data
            })
          }
        })
      } else {
        res.json({
          status: 1,
          msg: '用户不存在',
          result: ''
        })
      }

    } catch (err) {
      res.json({
        status: 1,
        msg: err.message,
        result: ''
      })
    }

  } else {
    res.json({
      status: 1,
      msg: '用户未登录',
      result: ''
    })
  }
});
//修改地址
router.post('/update', async (req, res) => {
  let userId = req.cookies.userId;
  let data = req.body;
  if (userId) {
    try {
      const userDoc = await User.findOne({userId});
      if (userDoc) {
        if (data.isDefault) {
          //将默认地址取消
          await Address.update({isDefault: true},{isDefault: false});
        }
        await Address.update({_id: data._id}, data);
        res.json({
          status: 0,
          msg: '操作成功',
          result: ''
        })
      } else {
        res.json({
          status: 1,
          msg: '用户不存在',
          result: ''
        })
      }

    } catch (err) {
      res.json({
        status: 1,
        msg: err.message,
        result: ''
      })
    }

  } else {
    res.json({
      status: 1,
      msg: '用户未登录',
      result: ''
    })
  }
});
//删除地址
router.post('/del', async (req, res) => {
  let userId = req.cookies.userId;
  let data = req.body;
  if (userId) {
    try {
      const addressDoc = await Address.findById(data._id);
      if (addressDoc) {
        addressDoc.remove((err) => {
          if (!err) {
            res.json({
              status: 0,
              msg: '操作成功',
              result: ''
            })
          } else {
            res.json({
              status: 1,
              msg: '操作失败',
              result: ''
            })
          }
        })
      } else {
        res.json({
          status: 1,
          msg: '数据不存在',
          result: ''
        })
      }

    } catch (err) {
      res.json({
        status: 1,
        msg: err.message,
        result: ''
      })
    }

  } else {
    res.json({
      status: 1,
      msg: '用户未登录',
      result: ''
    })
  }
});
//将地址设为默认
router.post('/setDefault', async (req, res) => {
  let userId = req.cookies.userId;
  let data = req.body;
  let _id = data._id;
  if (userId) {
    try {
      const userDoc = await User.findOne({userId});
      if (userDoc) {
        //将默认地址取消
        await Address.update({isDefault: true},{isDefault: false});
        //设置默认地址
        Address.update({_id},{isDefault: true}, null, (err) => {
          if (!err) {
            res.json({
              status: 0,
              msg: '操作成功',
              result: ''
            })
          }
        })
      } else {
        res.json({
          status: 1,
          msg: '用户不存在',
          result: ''
        })
      }

    } catch (err) {
      res.json({
        status: 1,
        msg: err.message,
        result: ''
      })
    }

  } else {
    res.json({
      status: 1,
      msg: '用户未登录',
      result: ''
    })
  }
});

module.exports = router;