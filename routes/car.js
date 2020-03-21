const express     = require('express');
const router      = express.Router()
const Car        = require('../models/car')
const Good        = require('../models/goods')
const User        = require('../models/user')

//获取购物车
router.get('/list', async (req, res) => {
  let userId = req.cookies.userId;
  if (userId) {
    try {
      const userDoc = await User.findOne({userId});
      if (userDoc) {
        Car.find({userId}, (err, data) => {
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

//添加购物车
router.post('/add', async (req, res) => {
  let userId = req.cookies.userId;
  let data = req.body;
  data.userId = userId;
  if (userId) {
    try {
      const userDoc = await User.findOne({userId});
      if (userDoc) {
        let doc = await Car.findOne(data);
        if (doc) {
          if (!data.productNum) {
            if (!doc.productNum) {
              data.productNum = 1
            } else {
              data.productNum = doc.productNum + 1;
            }
          } else {
            if (!doc.productNum) {
              data.productNum = data.productNum + 1;
            } else {
              data.productNum = doc.productNum + data.productNum;
            }
          }
          Car.update({userId, productId: data.productId}, {productNum: data.productNum, "checked": "1"}, (err) => {
            if (!err) {
              res.json({
                status: 0,
                msg: '操作成功',
                result: ''
              })
            }
          })
        } else {
          if (!data.productNum) {
            data.productNum = 1;
          }
          let detail = await Good.findById(data.productId);
          Car.create({
            ...data,
            productPrice: detail.salePrice,
            productName: detail.productName,
            productImg: detail.productImageBig,
            "checked": "1"
          }, (err) => {
            if (!err) {
              res.json({
                status: 0,
                msg: '操作成功',
                result: ''
              })
            }
          })
        }
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
//批量添加购物车
router.post('/addBatch', async (req, res) => {
  let userId = req.cookies.userId;
  let data = req.body;
  let productMsg = data.productMsg;
  if (userId) {
    try {
      const userDoc = await User.findOne({userId});
      if (userDoc) {
        let productIdList = productMsg.map(v => v.productId);
        let doc = await Car.find({userId: userId, productId: {$in: productIdList}});
        Good.find({_id: {$in: productIdList}}, function (err, goodDocs) {
          if (!err) {
            let goodsDetail = [];
            goodDocs.forEach(v => {
              let obj = productMsg.find(v1 => v1.productId == v._id);
              goodsDetail.push({
                productPrice: v.salePrice,
                productName: v.productName,
                productImg: v.productImageBig,
                ...obj
              })
            });
            if (doc) {
              //只加入购物车中没有的数据
              let needAdd = [];
              goodsDetail.forEach(v => {
                let obj = doc.find(v1 => v1.productId == v._id);
                if (!obj) {
                  needAdd.push(v);
                }
              });
              Car.create(needAdd, (err) => {
                if (!err) {
                  res.json({
                    status: 0,
                    msg: '操作成功',
                    result: ''
                  })
                } else {
                  res.json({
                    status: 1,
                    msg: '查询失败',
                    result: ''
                  })
                }
              })
            } else {
              Car.create(goodsDetail, (err) => {
                if (!err) {
                  res.json({
                    status: 0,
                    msg: '操作成功',
                    result: ''
                  })
                } else {
                  res.json({
                    status: 1,
                    msg: '查询失败',
                    result: ''
                  })
                }
              })
            }
          } else {
            res.json({
              status: 1,
              msg: '查询失败',
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
// 修改数量
router.post('/cartEdit', function (req, res) {
  let userId = req.cookies.userId,
    productId = req.body.productId,
    productNum = req.body.productNum > 10 ? 10 : req.body.productNum,
    checked = req.body.checked;
  if (userId) {
    Car.update({productId, userId}, {productNum, checked}, (err, doc) => {
      if (err) {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        });
      } else {
        res.json({
          status: '0',
          msg: '',
          result: 'suc'
        });
      }
    })
  }
});
// 全选
router.post('/editCheckAll', function (req, res) {
  let userId = req.cookies.userId,
    checkAll = req.body.checkAll ? '1' : '0';
  Car.update({userId}, {checked: checkAll}, (err) => {
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
});
//删除
router.post('/cartDel', async (req, res) => {
  let userId = req.cookies.userId;
  let data = req.body;
  data.userId = userId;
  if (userId) {
    try {
      const userDoc = await User.findOne({userId});
      if (userDoc) {
        let doc = await Car.findOne(data);
        if (doc) {
          doc.remove((err) => {
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
            msg: '商品不存在',
            result: ''
          })
        }
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