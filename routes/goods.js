const express     = require('express');
const router      = express.Router()
const Good        = require('../models/goods')
const User        = require('../models/user')

//获取热门数据
router.get('/hotList', (req, res) => {
  try {
    Good.find({isHot: true, goodsType: 1, isUp: true}, null, {limit: 4}, (err, men) => {
      if (!err) {
        Good.find({isHot: true, goodsType: 2, isUp: true}, null, {limit: 4}, (err, women) => {
          if (!err) {
            let hot = men.slice(0, 2).concat(women.slice(0, 2));
            res.json({
              status: '0',
              msg: '请求成功',
              result: {
                hot,
                men,
                women
              }
            })
          } else {
            res.json({
              status: '1',
              msg: err,
              result: null
            })
          }
        });
      } else {
        res.json({
          status: '1',
          msg: err,
          result: null
        })
      }
    });
  } catch (err) {
    res.json({
      status: '1',
      msg: err.message,
      result: null
    })
  }
});
// 商品列表
router.get('/list', async (req, res, next) => {
    let sort = req.query.sort || '';
    let page = +req.query.page || 1;
    let pageSize = +req.query.pageSize || 20;
    let priceGt = +req.query.priceGt || ''; // 大于
    let priceLte = +req.query.priceLte || ''; // 小于
    let goodsType = +req.query.goodsType || ''; // 商品类型
    let all = +req.query.all || ''; // 商品类型
    let skip = (page - 1) * pageSize;//跳过多少条
    let params = {}
    if (priceGt || priceLte) {
        if (priceGt && priceLte) {
            if (priceGt > priceLte) {
                var l = priceLte, g = priceGt
                priceGt = l
                priceLte = g
            }
            params = {
                'salePrice': {
                    $gt: priceGt,
                    $lte: priceLte
                }
            }
        } else {
            params = {
                'salePrice': {
                    $gt: priceGt || 0,
                    $lte: priceLte || 99999
                }
            }
        }
    }
    if (goodsType) {
      params.goodsType = goodsType;
    }
    let countParams = {};
    if (!all) {
      params.isUp = true;
      countParams.isUp = true;
    }
    let count = await Good.count(countParams);
    let productModel = Good.find({...params}).skip(skip).limit(pageSize);
    // 1 升序 -1 降序
    sort && productModel.sort({'salePrice': sort, createTime: '1'});
    productModel.exec(function (err, doc) {
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            })
        } else {
            res.json({
                status: '0',
                msg: 'successful',
                result: {
                    count: doc.length,
                    total: count,
                    data: doc
                }
            })
        }
    })
});

// 新增商品
router.post('/add',  async (req, res) => {
  let userId = req.cookies.userId;
  let data = req.body;
  if (userId) {
    try {
      const userDoc = await User.findOne({userId})
      if (userDoc) {
        Good.create({...data, isUp: true}, function (err, data) {
          if (err) {
            res.json({
              status: '1',
              message: '服务器异常',
              content: null
            });
          } else {
            res.json({
              status: '0',
              message: '请求成功',
              content: {}
            });
          }
        });
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
// 编辑商品
router.post('/update',  async (req, res) => {
  let userId = req.cookies.userId;
  let data = req.body;
  if (userId) {
    try {
      const userDoc = await User.findOne({userId})
      if (userDoc) {
        Good.findByIdAndUpdate(data._id, data, function (err, data) {
          if (err) {
            res.json({
              status: '1',
              message: '服务器异常',
              content: null
            });
          } else {
            res.json({
              status: '0',
              message: '请求成功',
              content: {}
            });
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
//删除
router.post('/del', async (req, res) => {
  let userId = req.cookies.userId;
  let data = req.body;
  if (userId) {
    try {
      const userDoc = await User.findOne({userId})
      if (userDoc) {
        Good.findByIdAndRemove(data._id, (err) => {
          if (!err) {
            res.json({
              status: 0,
              msg: '',
              result: ''
            })
          } else {
            res.json({
              status: 1,
              msg: err.message,
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

//上下架
router.post('/upDown', async (req, res) => {
  let userId = req.cookies.userId;
  let data = req.body;
  if (userId) {
    try {
      const userDoc = await User.findOne({userId})
      if (userDoc) {
        Good.findById(data._id, (err, data) => {
          if (!err) {
            console.log(data);
            let isUp = data.isUp;
            Good.findByIdAndUpdate(data._id, {isUp: !isUp}, (err1) => {
              if (!err1) {
                res.json({
                  status: 0,
                  msg: '',
                  result: ''
                })
              } else {
                res.json({
                  status: 1,
                  msg: err.message,
                  result: ''
                })
              }
            });
          } else {
            res.json({
              status: 1,
              msg: err.message,
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

// 加入购物车
router.post('/addCart',  async (req, res) => {

    let userId = req.cookies.userId;
    let {productId, productNum = 1 } = req.body
    if (userId) {
        try {
            const userDoc = await User.findOne({userId})
            if (userDoc) {
                // 商品是否存在
                let have = false;

                //  购物车有内容
                if (userDoc.cartList.length) {
                    // 遍历用户名下的购物车列表
                    for (let value of userDoc.cartList) {
                        // 找到该商品
                        if (value.productId === productId) {
                            have = true;
                            value.productNum += productNum;
                            break;
                        }
                    }

                }

                // 购物车无内容 或者 未找到商品 则直接添加
                if (!userDoc.cartList.length || !have) {
                    const goodsDoc = await Good.findOne({productId})
                    let doc = {
                        "productId": goodsDoc.productId,
                        "productImg": goodsDoc.productImageBig,
                        "productName": goodsDoc.productName,
                        "checked": "1",
                        "productNum": productNum,
                        "productPrice": goodsDoc.salePrice
                    };
                    userDoc.cartList.push(doc)
                }

                userDoc.save( ()=> {
                    // 保存成功
                    res.json({
                        status: 0,
                        msg: '加入成功',
                        result: 'suc'
                    })
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
})

// 批量加入购物车
router.post('/addCartBatch',  async (req, res) => {
    let userId = req.cookies.userId,
        productMsg = req.body.productMsg;
    if (userId) {
        try {
            User.findOne({userId}, (err, userDoc) => {
                if (userDoc) {
                    // 未添加的商品
                    let sx = [];
                    let newSx = [];
                    //  购物车有内容
                    if (userDoc.cartList.length) {
                        // 遍历用户名下的购物车列表
                        userDoc.cartList.forEach((item, i) => {
                            // 找到该商品
                            productMsg.forEach((pro, j) => {
                                if (item.productId === pro.productId) {
                                    sx.push(j)
                                    item.productNum += pro.productNum
                                }
                            })
                        })
                        // 有不是重复的商品
                        if (sx.length !== productMsg.length) {
                            productMsg.forEach((item, i) => {
                                if (sx[i] !== i) {//  找到未添加的
                                    newSx.push(item)
                                }
                            })
                            let goodList1 = [], goodNum1 = []
                            newSx.forEach(item => {
                                goodList1.push(item.productId)
                                goodNum1.push(item.productNum)
                            })
                            Good.find({productId: {$in: goodList1}}, function (err3, goodDoc) {

                                var userCart = []
                                // 返回一个数组
                                goodDoc.forEach((item, i) => {
                                    // userCart.push()
                                    userDoc.cartList.push({
                                        "productId": item.productId,
                                        "productImg": item.productImageBig,
                                        "productName": item.productName,
                                        "checked": "1",
                                        "productNum": goodNum1[i],
                                        "productPrice": item.salePrice
                                    })
                                })
                                // if (userCart.length) {
                                userDoc.save(function (err2, doc2) {

                                    // 保存成功
                                    res.json({
                                        status: '0',
                                        msg: '加入成功',
                                        result: 'suc'
                                    })

                                })


                                // }
                            })
                        } else {
                            userDoc.save(function (err2, doc2) {

                                // 保存成功
                                res.json({
                                    status: '0',
                                    msg: '加入成功',
                                    result: 'suc'
                                })

                            })
                        }

                    } else {
                        var goodList = [], goodNum = []
                        productMsg.forEach(item => {
                            goodList.push(item.productId)
                            goodNum.push(item.productNum)
                        })
                        Good.find({productId: {$in: goodList}}, function (err3, doc) {

                            // 返回一个数组
                            doc.forEach((item, i) => {
                                userDoc.cartList.push({
                                    "productId": item.productId,
                                    "productImg": item.productImageBig,
                                    "productName": item.productName,
                                    "checked": "1",
                                    "productNum": goodNum[i],
                                    "productPrice": item.salePrice
                                })
                            })

                            userDoc.save(function (err2, doc2) {
                                // 保存成功
                                res.json({
                                    status: '0',
                                    msg: '加入成功',
                                    result: 'suc'
                                })
                            })

                        })
                    }
                }

            })
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
            msg: '未登录',
            result: ''
        })
    }

})

// 商品信息
router.get('/productDet', function (req, res) {
    let productId = req.query.productId
    Good.findOne({_id: productId}, (err, doc) => {
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            })
        } else {
          doc.limit_num = doc.limit_num || 99
            res.json({
                status: 0,
                msg: 'suc',
                result: doc
            })
        }
    })
})

module.exports = router



