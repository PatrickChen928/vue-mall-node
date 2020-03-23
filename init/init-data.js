// 初始化商品
const initData = require('./data');
//启动数据库
const db = require('../mongodb/db');
const Good = require('../models/goods');
initData.forEach(v => {
  v.isHot = true;
  v.isUp = true;
});
Good.create(...initData, (err) => {
  if (!err) {
    console.log('商品数据初始成功');
  } else {
    console.log('商品数据初始失败');
  }
  db.close();
});