const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    fname:String,
    lname:String,
    phoneNumber:String,
    email:String,
    dob:String,
    password:String,
    usertype:String,
    library_name:String
})

module.exports = mongoose.model('user', userSchema, 'users')