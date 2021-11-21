const mongoose = require('mongoose');

async function connect(){
    try{
        await mongoose.connect('mongodb://localhost/EC_Project', {
            useNewUrlParser : true, 
            useUnifiedTopology : true,
        })
        console.log('Connect successfuly !!!'); 
    }catch(error){
        console.log('Connect failed !!!');
    }
}

module.exports = { connect };