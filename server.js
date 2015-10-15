// requiring all the things

var express           = require('express'),
    morgan            = require('morgan'),
    bodyParser        = require('body-parser'),
    ejs               = require('ejs'),
    expressEjsLayouts = require('express-ejs-layouts'),
    methodOverride    = require('method-override'),
    session           = require('express-session'),
    marked            = require('marked'),
    poemController    = require('./controllers/poems.js'),
    Poem              = require('./models/poem.js'),
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
  res.locals.marked = marked;
  res.locals.userLoggedIn = req.session.username;

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

// server.get('/home/:id', function(req, res){
//   res.render('home', { /* TO-DO: Poem data so we can display most popular and most current poems */ });
// });

server.get('/', function(req, res){
  console.log("have to log in. redirecting..");
  res.redirect(302, '/users/login');
});

server.get('/home', function(req, res){
  if (req.session.currentUser) {
    // someone is logged in, so should be able to go to home page..
    res.redirect(302, '/home/' + req.session.currentUser);
  } else {
    console.log("have to log in. redirecting..");
    res.redirect(302, '/users/login');
  }
});

// user logs in and is directed to home page.. should display all of their poems

server.get('/home/:userID', function(req, res) {
  Poem.find( {
    poetID: req.params.userID
  }, function(err, foundPoems) {
    if (err) {
      console.log("Error finding poems by author with id: ", req.params.userID);
      res.redirect('./home');
    } else {
      console.log("found poems: ", foundPoems);
      //redirect to poems by this author after finding their user object in database
      if (foundPoems[0]) {
        res.render('home', {
          poems: foundPoems,
          authorName: foundPoems[0].authorName
        });
      } else {
        res.redirect(302, '/new-user/' + req.params.userID);
      }
    }
  }).sort( {
    title: 1 })
    .exec(function(err2) {
      if (err2) {
        console.log("There was an error sorting the data by author name");
      }
    });
});

server.get('/new-user/:id', function(req, res) {
  res.render('new-user');
});

// server.get('/new-user/:id', function(req, res){
//   res.render('new-user', { /* TO-DO: Poem data so we can display most popular and most current poems */ });
// });

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
