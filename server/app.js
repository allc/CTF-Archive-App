var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let nunjucks = require('nunjucks')
let cors = require('cors');
require('dotenv').config()

var apiRouter = require('./routes/api');

var app = express();

let nunjucks_env = nunjucks.configure('views', {
    autoescape: true,
    express: app
});

nunjucks_env.addFilter("date", function(date) {
    return date.toLocaleDateString("en-GB", {year: 'numeric', month: 'long', day: 'numeric'})
});

app.set("view engine", "njk")

if (process.env['CORS_ORIGIN']) {
  let corsOptions = {
    origin: process.env['CORS_ORIGIN']
  };
  app.use(cors(corsOptions));
}

app.use(logger('dev'));
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());

app.use('/api', apiRouter);

module.exports = app;
