const mongoose = require('mongoose'); 
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug)
const Schema = mongoose.Schema

const Account = new Schema({
    account : {type : String, maxlength : 255, required : true}, 
    password : {type : String, maxlength : 255, required : true},
}, {
    timestamps : true
})

module.exports = mongoose.model('Account', Account)