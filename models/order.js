const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: String,
  orderId: String,
  orderTotal: Number,
  addressInfo: Object,
  goodsList: Array,
  orderStatus: String,
  createDate: String
});

module.exports = mongoose.model('Order', orderSchema, 'orderCollection');