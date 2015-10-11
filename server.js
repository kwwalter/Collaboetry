// requiring all the things

var express           = require('express'),
    morgan            = require('morgan'),
    bodyParser        = require('body-parser'),
    ejs               = require('ejs'),
    expressEjsLayouts = require('express-ejs-layouts'),
    methodOverride    = require('method-override'),
    session           = require('express-session'),
    poemController    = require('./controllers/poems.js'),
    userController    = require('./controllers/users.js');

// server setup
var PORT    = process.env.PORT || 3788,
    server  = express();

// setting up mongoose stuff

var MONGOURI = process.env.MONGOLAB_URI || "mongodb://localhost:27017",
    dbname   = "collaboetry",
    mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

// SET

mongoose.set('debug', true);

server.set('views', './views');
server.set('view engine', 'ejs');

// USE

server.use(session({
  secret: "tanukidog",
  resave: true,
  saveUninitialized: false
}));

server.use(morgan('dev'));

server.use(express.static('./public'));

server.use(expressEjsLayouts);

server.use(bodyParser.urlencoded({
  extended: true
}));

server.use(methodOverride('_method'));

// SUPER LOGGER

server.use(function(req, res, next){
  console.log("*************** [ REQ START ] ***************");
  console.log("REQ DOT BODY: \n", req.body);
  console.log("REQ DOT PARAMS: \n", req.params);
  console.log("REQ DOT SESSION: \n", req.session);
  console.log("*************** [ REQ END ] ***************");
  next();
});

// specific routes--starting with a test one

server.get('/wicked-secret-test', function(req, res){
  res.write("welcome to my craptastic app!");
  res.end();
});

server.use('/users', userController);

server.use('/poems', poemController);

server.get('/home/:id', function(req, res){
  var currentUserID = req.params.id;

  res.render('home', { /* TO-DO: Poem data so we can display most popular and most current poems */ });
});

// failsafe in case someone gets to where they're not supposed to be..

server.use(function(req, res, next){
  res.write("You've reached the end of the road, pal.");
  res.end();
})

// server listen and mongoose connect

mongoose.connect(MONGOURI + "/" + dbname, function(){
  console.log("DATABASE IS UP!");
});
server.listen(PORT, function() {
  console.log("SERVER IS UP ON PORT: ", PORT);
});
