const path = require('path');
const express = require('express');
const handlebars = require('express-handlebars');
const methodOverride = require('method-override');
const session = require('./middleware/session.mdw');
const app = express();

const port = 3000;
const route = require('./routers');

const db = require('./config/db');

//Connect to db : 
db.connect()

//create session : 
session(app)

app.use(express.static(path.join(__dirname, 'public')));
app.use(
    express.urlencoded({
        extended: true,
    }),
);

// app.use(methodOverride('_method'));
app.use(express.json());

//override lại để có thể sài phương thức PUT 
app.use(methodOverride('_method'))

// Handlers template engine
app.engine(
    'hbs',
    handlebars({
        extname: '.hbs',
        helpers: {
            sum: (a, b) => a + b,
        }
    }),
);

// app.use(SortMiddleware);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

require('./middleware/local.mdw');

// route init
route(app);
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
