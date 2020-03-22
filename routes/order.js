const express     = require('express');
const router      = express.Router()
const Order        = require('../models/order')
const Address        = require('../models/address')
const Car        = require('../models/car')
const Good        = require('../models/goods')
const User        = require('../models/user')

// 生成订单
router.post('/payMent', async (req, res) => {
  try {
    let {addressId, orderTotal, productId, productNum} = req.body
    const {userId} = req.cookies
    // 是否登录
    if (userId) {
      // 需要地址id 以及 订单价格
      if (addressId && orderTotal) {
        let goodsList = [];
        let userAddress = await Address.findById(addressId);
        const cartList = await Car.find({userId, checked: '1'});

        // 生成订单号
        let platform = '618';
        let r1 = Math.floor(Math.random() * 10);
        let r2 = Math.floor(Math.random() * 10);
        let sysDate = new Date().Format('yyyyMMddhhmmss');
        let createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
        let orderId = platform + r1 + sysDate + r2;
        let order = {
          userId,
          orderId: orderId,
          orderTotal: orderTotal,
          addressInfo: userAddress,
          goodsList: goodsList,
          orderStatus: '1',
          createDate: createDate
        };
        if (productId && productNum) {
          let goodsDoc = await Good.findOne({_id: productId})
          let item = {
            productId: goodsDoc.productId,
            productImg: goodsDoc.productImageBig,
            productName: goodsDoc.productName,
            checked: '1',
            productNum,
            productPrice: goodsDoc.salePrice
          };

          goodsList.push(item)
          cb()

        } else {
          // 获取用户购物车的购买商品
          console.log(cartList);
          cartList.forEach((item) => {
              goodsList.push(item);
          });
          cb()
        }

        function cb() {
          //TODO: 清除购物车
          order.goodsList = goodsList;
          Order.create(order, (err1, data) => {
            if (err1) {
              res.json({
                status: 1,
                msg: '插入失败',
                result: ''
              });
            } else { // 保存
              Car.remove({userId, checked: '1'}, (err2) => {
                res.json({
                  status: 0,
                  msg: '',
                  result: {
                    orderId: order.orderId,
                    orderTotal: order.orderTotal
                  }
                });
              });
            }
          });
        }
      } else {
        res.json({
          status: 1,
          msg: '缺少必须参数',
          result: ''
        })
      }
    } else {
      res.json({
        status: 1,
        msg: '未登录',
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


})
// 查询订单
router.post('/orderList', async (req, res) => {
  const {userId} = req.cookies
  if (userId) {
    try {
      const orderList = await Order.find({userId})
      if (orderList) {
        let msg = 'suc';
        if (orderList.length <= 0) {
          msg = '该用户暂无订单'
        }
        res.json({
          status: 0,
          msg: msg,
          result: orderList
        })
      } else {
        res.json({
          status: 0,
          msg: "用户不存在",
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
  }
})
// 删除订单
router.post('/delOrder', function (req, res) {
  let userId = req.cookies.userId,
    orderId = req.body.orderId;
  if (userId) {
    if (orderId) {
      Order.remove({orderId}, (err) => {
        if (!err) {
          res.json({
            status: 0,
            msg: '删除成功',
            result: ''
          })
        } else {
          res.json({
            status: 1,
            msg: '删除失败',
            result: ''
          })
        }
      })
    } else {
      res.json({
        status: 1,
        msg: '缺少订单号',
        result: ''
      })
    }
  } else {
    res.json({
      status: 1,
      msg: '未登录',
      result: ''
    })
  }
})

module.exports = router;