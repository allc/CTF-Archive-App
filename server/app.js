var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let nunjucks = require('nunjucks')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

let nunjucks_env = nunjucks.configure('views', {
    autoescape: true,
    express: app
});

nunjucks_env.addFilter("date", function(date) {
    return date.toLocaleDateString("en-GB", {year: 'numeric', month: 'long', day: 'numeric'})
});

app.set("view engine", "njk")

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/static', express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
