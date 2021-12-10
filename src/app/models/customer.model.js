const mongoose = require('mongoose')

const slug = require('mongoose-slug-generator')

mongoose.plugin(slug)

const Schema = mongoose.Schema

const customerSchema = new Schema({
    tenKH : {type : String, maxlength : 255},
    tenTK : {type : String, maxlength : 255, required : true},
    email : {type : String, maxlength : 255}, 
    ngaySinh : {type : String, maxlength : 255}, 
    CCCD : {type : String, maxlength : 255}, 
    password : {type : String, maxlength : 255, required : true},
    soTK : {type : String, maxlength : 255},
    quyen : {type : String, maxlength : 255},
    account : {type : mongoose.Schema.Types.ObjectId, maxlength : 255, ref : 'account'},
}, {
    collection : 'Customer'
})

module.exports = mongoose.model('customer', customerSchema)