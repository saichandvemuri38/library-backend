const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const fineList = new Schema({
   userId:String,
   libraryname:String,
   amount:Number,
   status:String,
   bookId:String,
   bookname:String,
   userName:String
})

module.exports = mongoose.model('fine',fineList,'fines')