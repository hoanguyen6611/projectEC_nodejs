const mongoose = require('mongoose')

const slug = require('mongoose-slug-generator')

mongoose.plugin(slug)

const Schema = mongoose.Schema

const passbookSchema = new Schema({
    customer : {type : mongoose.Schema.Types.ObjectId, ref : 'customer'}, 
    soTienGui : {type : Number, required : true}, 
    term : {type : mongoose.Schema.Types.ObjectId, ref : 'term'}, 
    interestRate : {type : mongoose.Schema.Types.ObjectId, ref : 'interestRate'}, 
    ngayGui : {type : Date, required : true}, 
    ngayDaoHan : {type : Date, required : true},
}, {
    collection : 'Passbook'
})

module.exports = mongoose.model('passbook', passbookSchema)