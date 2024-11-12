const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();
const session = require('express-session');
const db = require('./models');
const sequelize = require('sequelize');
//router_file
const UserRouter = require('./routers/user.router');
const ResultRouter = require('./routers/result.router');

db.sequelize
    .sync({ force: false })
    .then(() => {
        console.log('✅ DB Connected!');
    })
    .catch((err) => {
        console.error(err);
    });

app.use(cookieParser());
app.use(session({
    key: 'key',
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: true,
        expires: 60 * 60 * 24
    },
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

//user router
app.use('/api/mobile', UserRouter);
//result router
app.use('/api/mobile/result', ResultRouter);

const PORT = 3000;
app.set(PORT);
app.listen(PORT, () => {
    console.log(`app started on port ${PORT}`)
});
