const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bookList = new Schema({
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
   libraryname:String
})

module.exports = mongoose.model('book',bookList,'books')