var express = require('express'),
    router  = express.Router(),
    Poem    = require('../models/poem.js');

// routes for this router

router.get('/poems-by-author', function(req, res, next){
  res.render('poems-by-author', { /* TO-DO: Poem data so we can display all poems, grouped by author */ });
});

router.get('/poems-by-tag', function(req, res, next){
  res.render('poems-by-tag', { /* TO-DO: Poem data so we can display all poems, grouped by tag */ });
});

router.get('/poem/:id', function(req, res, next){
  res.render('poem', { /* TO-DO: SPECIFIC POEM OBJECT */ });
});

router.get('/poem/:id/edit', function(req, res, next){
  res.render('edit', { /* TO-DO: SPECIFIC POEM OBJECT */ })
});

//old

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

// this route will grab all poems by a specific author

router.get('/poems-by-author/:id', function(req, res){
  User.find( {
    _id: req.params.id
  }, function(err, foundPoems) {
    if (err) {
      console.log("Error finding poems by author with id: ", req.params.id);
      res.redirect('./home');
    } else {
      //redirect to poems by this author
      var poetID = req.params.id;
      res.render('./poems-by-author', {
        poems: foundPoems,
        poetID: poetID
      });
    }
  });
});

module.exports = router;
