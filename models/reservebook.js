const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const reserveList = new Schema({
   name:String,
   description:String,
   author:String,
   publisher:String,
   department:String,
   price:Number,
   libraryname:String,
   userId:String,
   image:String,
   bookId:String,
   shelve:String
})

module.exports = mongoose.model('reserveitem',reserveList,'reserveBooks')