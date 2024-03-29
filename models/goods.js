const mongoose = require('mongoose')
// 表模型
const produtSchema = new mongoose.Schema({
  'productId': String,
  'salePrice': Number,
  'productName': String,
  'productImageSmall': Array,
  'productImageBig': String,
  'stock': Number,
  'sub_title': String,
  'limit_num': String,
  'productMsg': Object,
  'detail': String,
  'goodsType': String,
  'isHot': Boolean,
  'isUp': {
    type: Boolean,
    detail: true
  },
  'createTime': {
    type: Date,
    default: new Date()
  }
});
module.exports = mongoose.model('Good', produtSchema, 'goodCollection');