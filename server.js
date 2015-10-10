// requiring all the things

var express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    ejs = require('ejs'),
    expressEjsLayouts = require('express-ejs-layouts'),
    methodOverride = require('method-override');

// server setup
var PORT    = process.env.PORT || 3788,
    server  = express();

// setting up mongoose stuff

var MONGOURI = process.env.MONGOLAB_URI || "mongodb://localhost:27017",
    dbname   = "collaboetry",
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

// specific GET routes--starting with a test one

server.get('/wicked-secret-test', function(req, res){
  res.write("welcome to my craptastic app!");
  res.end();
});

server.get('/', function(req, res, next){
  res.render('home', { /* TO-DO: Poem data so we can display most popular and most current poems */ });
});

server.get('/poems-by-author', function(req, res, next){
  res.render('home', { /* TO-DO: Poem data so we can display most popular and most current poems */ });
});

server.get('/poem/:id', function(req, res, next){
  res.render('poem', { /* TO-DO: SPECIFIC POEM OBJECT */ });
});

server.get('/poem/:id/edit', function(req, res, next){
  res.render('edit', { /* TO-DO: SPECIFIC POEM OBJECT })
});

// server listen and mongoose connect

mongoose.connect(MONGOURI + "/" + dbname);
server.listen(PORT, function() {
  console.log("SERVER IS UP ON PORT: ", PORT);
});
