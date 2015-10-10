// requiring all the things

var express = require('express'),
    PORT    = process.env.PORT || 3788,
    server  = express(),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    ejs = require('ejs'),
    expressEjsLayouts = require('express-ejs-layouts'),
    methodOverride = require('method-override');

// setting up mongoose stuff

var MONGOURI = process.env.MONGOLAB_URI || "mongodb://localhost:27017",
    dbname   = "change_this_later",
    mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

mongoose.set('debug', true);

// set up

server.set('views', './views');
server.set('view engine', 'ejs');

server.use(morgan('dev'));

server.use(express.static('./public'));

server.use(expressEjsLayouts);

server.use(bodyParser.urlencoded({
  extended: true
}));

server.use(methodOverride('_method'));

// specific routes--starting with a test one

server.get('/wicked-secret-test', function(req, res){
  res.write("welcome to my craptastic app!");
  res.end();
});

// server listen and mongoose connect

mongoose.connect(MONGOURI + "/" + dbname);
server.listen(PORT, function() {
  console.log("SERVER IS UP ON PORT: ", PORT);
});
