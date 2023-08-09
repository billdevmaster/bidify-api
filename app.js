var express = require('express')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
// var itemRouter = require('./routers/item');
var auctionRouter = require('./routers/auction')
require('dotenv').config();

var app = express();

var PORT = 8080;
var HOST_NAME = process.env.DB_URL;
// var DATABASE_NAME = 'Bidify';

mongoose.connect(HOST_NAME).catch(error => console.error("error", error.message));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next();
});
app.use('/api', auctionRouter);

app.listen(PORT, function () {
  console.log('Listening on port ' + PORT);
});
