const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const reserveList = new Schema({
   name:String,
   image:String,
   desctiption:String,
   author:String,
   publisher:String,
   department:String,
   price:Number,
   availability:String,
   rent:Number,
   fromlibraryname:String,
   tolibraryname:String,
   userId:String
})

module.exports = mongoose.model('reserveitem',reserveList,'reserveBooks')