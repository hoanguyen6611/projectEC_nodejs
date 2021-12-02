const path = require('path');
const express = require('express');
const handlebars = require('express-handlebars');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('./middleware/session.mdw');

const app = express();

app.use(cookieParser())

const port = 3000;
const route = require('./routers');

const db = require('./config/db');

//Connect to db : 
db.connect()

//create session : 
session(app)

app.use(
    bodyParser.urlencoded({
        extended: true 
    }),
)

app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, 'public')));

app.use(
    express.urlencoded({
        extended: true,
    }),
);

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

// Cập nhật kiểm tra liên tục kỳ hạn tất toán cho tất cả các sổ : 
const SystemController = require('./app/controllers/SystemController');
// const node_Cron = require('node-cron')
// node_Cron.schedule('0 0 0 * * *', () => {
//     SystemController.expire();
// })

// route init
route(app);

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
