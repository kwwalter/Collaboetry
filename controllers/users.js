var express = require('express'),
    router  = express.Router(),
    User    = require('../models/user.js');

// routes for this router

router.get('/signup', function(req, res) {
  res.render('users/signup');
});

router.post('/signup', function(req, res) {
  var newUser = User(req.body.user);

  newUser.save(function(err, user){
    if (err) {
      console.log("There was an error saving this user to the database");
      res.redirect(302, '/signup');
      res.end();
    } else {

    }
  });
});

module.exports = router;
