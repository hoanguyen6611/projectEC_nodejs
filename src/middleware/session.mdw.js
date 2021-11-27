const session = require('express-session');

module.exports = function(app){
    app.set('trust proxy', 1);

    app.use(session({
        secret: 'keyboard cat',
        resave: true,
        saveUninitialized: true,
        cookie: { secure: false , maxAge : 5000}
    }))
}