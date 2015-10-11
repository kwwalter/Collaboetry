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
      console.log("There was an error saving this user to the database");
      res.redirect(302, '/signup');
      res.end();
    } else {
      console.log(user.userName, " successfully saved!");
      res.redirect(302, './home');
    }
  });
});

router.get('/login', function(req, res){
  res.render('users/login')
});

router.post('/login', function(req, res){
  var attemptedLogin = req.body.user;

  User.findOne( {
    username: attemptedLogin
  }, function(err, foundUser){
      if (err) {
        console.log("There was an error locating this user in the database");
        res.end();
      } else {
        console.log(foundUser, " found!");
      }
  });
});

module.exports = router;
