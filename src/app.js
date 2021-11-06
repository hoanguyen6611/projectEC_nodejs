const path =require('path');
const express = require('express');
const morgan = require('morgan');
const handlebars = require('express-handlebars');
const app = express();
const port = process.env.PORT || 3000;
const router = require('./routers');
//const db = require('./config/db');
//db.connect();
app.use(express.static(path.join(__dirname,'public')));
app.use (
    express.urlencoded({
        extended:true,
    })
);
app.use(express.json());
app.engine(
    'hbs',
    handlebars({
        extname: '.hbs'
    })
);
app.set('view engine', 'hbs');
app.set('view',path.join(__dirname,'resources','views'));
router(app);
app.listen(port,()=>{
    console.log(`App listening at http://localhost:${port}`);
});