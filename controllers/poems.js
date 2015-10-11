var express = require('express'),
    router  = express.Router(),
    Poem    = require('../models/poem.js'),
    User    = require('../models/user.js');

// routes for this router

// for a listing of all poems, grouped by author

router.get('/poems-by-author', function(req, res){
  res.render('poems-by-author', { /* TO-DO: Poem data so we can display all poems, grouped by tag */ }
});

// this route will grab all poems by a specific author

router.get('/poems-by-author/:id', function(req, res){
  User.find( {
    _id: req.params.id
  }, function(err, foundPoems) {
    if (err) {
      console.log("Error finding poems by author with id: ", req.params.id);
      res.redirect('/home');
    } else {
      //redirect to poems by this author
      var poetID = req.params.id;
      res.render('poems/poems-by-author', {
        poems: foundPoems,
        poetID: poetID
      });
    }
  });
});

router.get('/poems-by-tag', function(req, res, next){
  res.render('poems/poems-by-tag', { /* TO-DO: Poem data so we can display all poems, grouped by tag */ });
});

// this route will grab all poems with a specific tag

router.get('/poems-by-tag/:tag', function(req, res){
  User.find( {
    keywordTag: tag
  }, function(err, foundPoems) {
    if (err) {
      console.log("Error finding poems with tag: ", req.params.tag);
      res.redirect('/home');
    } else {
      //redirect to poems that have this tag
      res.render('poems/poems-by-tag', {
        poems: foundPoems,
      });
    }
  });
});

router.get('/poem/:id', function(req, res, next){
  res.render('poems/poem', { /* TO-DO: SPECIFIC POEM OBJECT */ });
});

router.get('/poem/:id/edit', function(req, res, next){
  res.render('poems/edit', { /* TO-DO: SPECIFIC POEM OBJECT */ })
});

router.post('/poem/:id/edit', function(req, res, next){
  // Poem.findById()
});

router.get('/vote', function(req, res, next){
  res.render('poems/vote', { /* TO-DO: Poem data so we can display all poems that have been edited within the last [x] hours */ });
});

module.exports = router;
