const mongoose = require('mongoose')

const slug = require('mongoose-slug-generator')

mongoose.plugin(slug)

const Schema = mongoose.Schema 

const accountSchema = new Schema({
    soDu :   {type : String, maxlength : 255, required : true}, 
    soTK :   {type : String, maxlength : 255, required : true}
}, {
    collection : 'Account'
})

module.exports = mongoose.model('account', accountSchema)