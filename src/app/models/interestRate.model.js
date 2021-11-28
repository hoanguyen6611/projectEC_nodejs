const mongoose = require('mongoose')

const slug = require('mongoose-slug-generator')

mongoose.plugin(slug)

const Schema = mongoose.Schema

const interestRateSchema = new Schema({
    term : {type : mongoose.Schema.Types.ObjectId, maxlength : 255, required : true, ref : 'term'}, 
    kyHan : {type : String, maxlength : 20, required : true}, 
    laiSuat : {type : Number, required : true},
}, {
    collection : 'InterestRate'
})

module.exports = mongoose.model('interestRate', interestRateSchema)