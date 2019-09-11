const express = require("express");
const path = require("path")
const mongoose = require("mongoose")
const bodyParser = require('body-parser')
const { check, validationResult } = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport')
const config = require('./config/database.js')
const PORT = process.env.PORT || 3000

mongoose.connect(config.database, {useNewUrlParser: true});
let db = mongoose.connection;

db.once('open', function() {
    console.log('Connected to MongoDb')
})


db.on('error', function(err) {
    console.log(err)
})

const app = express();

let Article = require('./models/article.js')

app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'pug')


app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, 'public')))

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


require('./config/passport.js')(passport);


app.use(passport.initialize());
app.use(passport.session())

app.get('*', (req, res, next) => {
  res.locals.user = req.user || null;
  next()
})

// main
app.get("/", (req, res) => {

    Article.find({}, (err, articles) => {
        if (err) {
            console.log(err)
        }
        console.log(articles)

        res.render("index", {
            title: 'Articles',
            articles: articles
        })
    })


})


//Route Files
let articles = require('./routes/articles');
let users = require('./routes/users')
app.use('/articles', articles)
app.use('/users', users)


app.listen(PORT, () => console.log('Server Running'))





