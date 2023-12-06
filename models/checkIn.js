const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const transactions = new Schema({
   bookId:String,
   name:String,
   image:String,
   description:String,
   author:String,
   publisher:String,
   department:String,
   price:Number,
   // quantity:Number,
   availability:String,
   rent:Number,
   libraryname:String,
   userId:String,
   status:String,
   startDate:String,
   endDate:String,
   fine:Number,
   depositedIn:String,
   shelve:String
})

module.exports = mongoose.model('checkin',transactions,'transactions')