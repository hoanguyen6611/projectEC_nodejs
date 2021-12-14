const mongoose = require('mongoose');

async function connect(){
    try{
        await mongoose.connect('mongodb+srv://hoanguyen2661:26062001@cluster0.csnk9.mongodb.net/EC_Project?retryWrites=true&w=majority', {
            useNewUrlParser : true, 
            useUnifiedTopology : true,
        })
        console.log('Connect successfuly !!!'); 
    }catch(error){
        console.log('Connect failed !!!');
    }
}

module.exports = { connect };