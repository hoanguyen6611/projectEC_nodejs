const mongoose = require('mongoose')

const slug = require('mongoose-slug-generator')

mongoose.plugin(slug)

const Schema = mongoose.Schema

const termSchema = new Schema({
    tenGoiTietKiem : {type : String, maxlength : 255, required : true}
    
}, {
    collection : 'Term'
})

module.exports = mongoose.model('term', termSchema)