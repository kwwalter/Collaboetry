var express = require('express'),
    router  = express.Router(),
    User    = require('../models/user.js'),
    Poem    = require('../models/poem.js');

// routes for this router

router.get('/signup', function(req, res) {
  res.render('users/signup');
});

router.post('/signup', function(req, res) {
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
      res.send("Someone has already signed up with that username or email");
      // res.redirect(302, '/users/signup-fail');
    } else {
      newUser.save(function(err2, user) {
        if (err2) {
          console.log("There was an error saving this user to the database: \n", err2);
          res.send("There was an error saving this user to the database:");
          // res.redirect(302, '/users/signup-fail');
          // res.end();
        } else {
          console.log(user.userName, " successfully saved!");
          req.session.currentUser = user._id;
          req.session.username = user.username;
          req.session.email = user.email;
          res.redirect(302, '../new-user' + "/" + user._id);
        }
      });
    }
  })
});

router.get('/signup-fail', function(req, res) {
  res.render('users/signup-fail')
})

router.get('/login', function(req, res){
  res.render('users/login');
});

router.post('/login', function(req, res){
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

        res.redirect(302, '../home' + "/" + foundUser._id);

      } else {
        console.log("Error locating this user in the database OR password didn't match");
        res.redirect(302, '/users/login-fail');
      }
  });
});

router.get('/login-fail', function(req, res){
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
      res.redirect(302, '../new-user' + "/" + user._id);
    }
  });
});

module.exports = router;
