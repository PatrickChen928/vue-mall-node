const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: String,
  userName: String,         //收件人
  tel: Number,          //电话号码
  // province: String,         //省
  // city: String,            //市
  // area: String,            //区
  isDefault: Boolean,    //是否为默认地址
  streetName: String,   //详细地址
});

module.exports = mongoose.model('Address', addressSchema, 'addressCollection');