const mongoose = require('mongoose')

const slug = require('mongoose-slug-generator')

mongoose.plugin(slug)

const Schema = mongoose.Schema 

const historySchema = new Schema({
    trangThai : {type : String, maxlength : 255, required : true},
    soTien : {type : Number, required : true},
    thoiGian : {type : Date, require : true},
    customer : {type : mongoose.Schema.Types.ObjectId, required : true, ref : 'customer'},
}, {
    collection : 'History'
})

module.exports = mongoose.model('history', historySchema)