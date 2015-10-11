var express = require('express'),
    router  = express.Router(),
    User    = require('../models/user.js');

// routes for this router

router.get('/signup', function(req, res) {
  res.render('users/signup');
});

router.post('/signup', function(req, res) {
  var newUser = User(req.body.user);

  newUser.save(function(err, user) {
    if (err) {
      console.log("There was an error saving this user to the database: \n", err);
      res.redirect(302, '/users/signup-fail');
      res.end();
    } else {
      console.log(user.userName, " successfully saved!");
      res.redirect(302, '../new-user' + "/" + user._id);
    }
  });
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
    username: attemptedLogin
  }, function(err, foundUser){
      if (foundUser && foundUser.password === attemptedLogin.password) {
        console.log(foundUser, "user found in database, and passwords match..");

        req.session.currentUser = foundUser.username;

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

module.exports = router;
