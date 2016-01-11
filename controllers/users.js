var express = require('express'),
    StatsD  = require('node-dogstatsd').StatsD,
    router  = express.Router(),
    User    = require('../models/user.js'),
    Poem    = require('../models/poem.js');

// node-dogstatsd setup
var dogstatsd = new StatsD();

// routes for this router

router.get('/signup', function(req, res) {
  res.render('users/signup');
});

router.post('/signup', function(req, res) {
  var signupStart = Date.now();
  dogstatsd.increment('collaboetry.page_views', ['support', 'page:signup']);

  var attemptedSignup = req.body.user;
  var newUser = User(req.body.user);

  User.findOne( {
    username: attemptedSignup.username,
    email: attemptedSignup.email
  }, function(err, foundUser) {
    if (err) {
      console.log("there was an error finding this user: \n", err);
    } else if (foundUser) {
      console.log("Someone has already signed up with that username or email");
      // res.send("Someone has already signed up with that username or email");
      res.redirect(302, '/users/signup-fail');
    } else {
      newUser.save(function(err2, user) {
        if (err2) {
          console.log("There was an error saving this user to the database: \n", err2);
          // res.send("There was an error saving this user to the database:");
          res.redirect(302, '/users/signup-fail');
          // res.end();
        } else {
          console.log(user.userName, " successfully saved!");
          req.session.currentUser = user._id;
          req.session.username = user.username;
          req.session.email = user.email;

          signupLatency = Date.now() - signupStart;
          dogstatsd.histogram('collaboetry.latency', signupLatency, ['support', 'page:signup']);

          res.redirect(302, '../new-user' + "/" + user._id);
        }
      });
    }
  })
});

router.get('/signup-fail', function(req, res) {
  var signupFailStart = Date.now();
  dogstatsd.increment('collaboetry.page_views', ['support', 'page:signup-fail']);
  signupFailLatency = Date.now() - signupFailStart;
  dogstatsd.histogram('collaboetry.latency', signupFailLatency, ['support', 'page:signup-fail']);

  res.render('users/signup-fail')
})

router.get('/login', function(req, res){
  var renderLoginStart = Date.now();
  dogstatsd.increment('collaboetry.page_views', ['support', 'page:login']);
  renderLoginLatency = Date.now() - renderLoginStart;
  dogstatsd.histogram('collaboetry.latency', renderLoginLatency, ['support', 'page:login']);

  res.render('users/login');
});

router.post('/login', function(req, res){
  var loginStart = Date.now();
  dogstatsd.increment('collaboetry.page_views', ['support', 'page:post-login']);

  var attemptedLogin = req.body.user;
  console.log("user trying to log in as: \n", attemptedLogin);

  User.findOne( {
    username: attemptedLogin.username
  }, function(err, foundUser){
      if (foundUser && foundUser.password === attemptedLogin.password) {
        console.log(foundUser, "user found in database, and passwords match..");

        req.session.currentUser = foundUser._id;
        req.session.username = foundUser.username;
        req.session.email = foundUser.email;

        var loginLatency = Date.now() - loginStart;
        dogstatsd.histogram('collaboetry.latency', loginLatency, ['support', 'page:post-login']);

        res.redirect(302, '../home' + "/" + foundUser._id);
      } else {
        console.log("Error locating this user in the database OR password didn't match");
        res.redirect(302, '/users/login-fail');
      }
  });
});

router.get('/login-fail', function(req, res){
  var loginFailStart = Date.now();
  dogstatsd.increment('collaboetry.page_views', ['support', 'page:login-fail']);
  loginFailLatency = Date.now() - loginFailStart;
  dogstatsd.histogram('collaboetry.latency', loginFailLatency, ['support', 'page:login-fail']);

  res.render('users/login-fail');
});

router.get('/signout', function(req, res) {
  req.session.currentUser = null;
  req.session.username = null;
  req.session.email = null;

  userLoggedIn = null;

  // res.render('users/signout');

  res.redirect(302, '/users/login');
});

router.post('/signout', function(req, res) {
  var signoutStart = Date.now();
  dogstatsd.increment('collaboetry.page_views', ['support', 'page:signout']);

  var newUser = User(req.body.user);

  newUser.save(function(err, user) {
    if (err) {
      console.log("There was an error saving this user to the database: \n", err);
      res.redirect(302, '/users/signup-fail');
      res.end();
    } else {
      console.log(user.userName, " successfully saved!");
      req.session.currentUser = foundUser._id;
      req.session.username = foundUser.username;
      req.session.email = foundUser.email;

      signoutLatency = Date.now() - signoutStart;
      dogstatsd.histogram('collaboetry.latency', signoutLatency, ['support', 'page:signout']);

      res.redirect(302, '../new-user' + "/" + user._id);
    }
  });
});

module.exports = router;
