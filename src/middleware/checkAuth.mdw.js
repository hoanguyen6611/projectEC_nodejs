const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = function (req, res, next) {
    try {
        var token = req.cookies.token; 
        var check = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); 
        if (check){
            next();
        }
    }catch(error){
        return res.json('Vui long dang nhap !')
    }
}