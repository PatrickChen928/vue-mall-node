//购物车
const mongoose = require('mongoose')
const carSchema = new mongoose.Schema({
  userId: String,
  productId: String,
  productPrice: Number,
  productName: String,
  productImg: String,
  productNum: Number,
  checked: String
});
module.exports = mongoose.model('Car', carSchema, 'carCollection');
