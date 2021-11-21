const session = require('express-session');

module.exports = function(app){
    
    app.use(function(res, req, next){
        if(req.session.isAuthenticated === null){
            req.session.isAuthenticated = false;
        }

        res.locals.lcIsAuthenticated = req.session.isAuthenticated; 
        res.locals.lcIsCustomer = req.session.isCustomer;
        next();
    })
}