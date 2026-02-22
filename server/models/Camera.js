// server/models/Camera.js
const bcrypt = require('bcrypt'); 
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  location: {type: {lat: Number, lng: Number}, required: false},
  registTime: { type: Date, default: Date.now },    //1시간에 1개씩만 유저당 등록하게하면 장난 등록 예방에 도움될듯
//   imageBase64: { type: String, required: false },
});

module.exports = mongoose.model('Camera', userSchema);