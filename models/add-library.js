const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const libraryList = new Schema({
   name:String,
   street:String,
   city:String,
   state:String,
   zip4:Number,
   image:String
})

module.exports = mongoose.model('library',libraryList,'libraryList')