require('dotenv').config();
const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport'); //user managment
const MongoStore = require('connect-mongo');

const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');

const { profile } = require('console');
const app = express();
app.use(express.static('public'));
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));


/* -------------- SESSION SETUP ---------------- */
app.use(
    session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
        },
        store: MongoStore.create({
            mongoUrl: "mongodb+srv://rave:12345@cluster0.udfecce.mongodb.net/?retryWrites=true&w=majority",
            collectionName: 'sessions',
        }),
    })
);


/* -------------- PASSPORT AUTHENTICATION ---------------- */

require('./config/passport-config');
app.use(passport.initialize());
app.use(passport.session());

/* -------------- DATABASE ---------------- */

mongoose.connect("mongodb+srv://rave:12345@cluster0.udfecce.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});


/* -------------- ROUTES ---------------- */

app.get('/', (req, res) => {
    res.render('home', { user: req.user });
});

app.use(authRoutes);
app.use(shopRoutes);
app.use(adminRoutes);

app.get('*', (req, res) => {
    res.render('404', { user: req.user });
});

app.listen(3000, () => {
    console.log('Listening to port 3000..');
});