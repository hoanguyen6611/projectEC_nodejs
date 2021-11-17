const mongoose = require('mongoose');

async function connect(){
    try{
        await mongoose.connect('mongodb://localhost:27017/EC_Project', {
            useNewUrlParser : true, 
            useUnifiedTopology : true,
        })
        console.log('Connect successfuly !!!'); 
    }catch(error){
        console.log('Connect failed !!!');
    }
}

module.exports = { connect };