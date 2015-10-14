var express = require('express'),
    router  = express.Router(),
    Poem    = require('../models/poem.js'),
    User    = require('../models/user.js');

// routes for this router

// if user wants to post a new poem..

router.get('/new', function(req, res) {
  if (req.session.currentUser) {
    res.render('poems/new');
  } else {
    res.redirect(302, '../users/login');
  }
});


// function to find a username based on ID..

// var findUserName = function() {
//   var returnUsername = "";
//
//   User.find( {
//     _id: req.session.currentUser
//   }, function(err, user) {
//     if (err) {
//       console.log("There was an error finding this user in the database");
//     } else {
//       returnUsername = user.username;
//     }
//   });
//
//   return returnUsername;
// };

// user submits a new poem..

router.post('/new', function(req, res, next) {
  var poemOptions = req.body.poem,
      title = req.body.poem.title,
      content = req.body.poem.content,
      comments = req.body.poem.comments,
      username = req.session.username,
      userEmail = req.session.email;

  // var thisUsername = findUserName(req.session.currentUser);

  // to split up the tags input and put em in an array for easier access later..
  poemOptions.tags = poemOptions.tags[0].split(/, \s?/);

  var newPoem = Poem(poemOptions);
  newPoem.poetID = req.session.currentUser;
  newPoem.authorName = req.session.username;
  newPoem.authorEmail = req.session.email;

  // trying to keep a record of all titles, content, and comments
  newPoem.previousVersions.push( { username, userEmail, title, content  });
  newPoem.commentsHistory.push( { username, comments } );

  // User.find( {
  //   _id: req.session.currentUser
  // }, function(err, user) {
  //   if (err) {
  //     console.log("There was an error finding this user in the database");
  //   } else {
  //     newPoem._username = user.username;
  //   }
  // });

  newPoem.save(function(err, poem) {
    if (err) {
      console.log("There was an error saving this poem to the database: \n", err);
      res.redirect(302, '/poems/new-fail');
      res.end();
    } else {
      console.log(poem.title, " successfully saved!");
      res.redirect(302, '/poems/authors/' + poem.poetID);
    }
  });
});

// user gets an error posting poem..

router.get('/new-fail', function(req, res) {
  res.render('poems/new-fail');
});

// for a listing of all authors who have submitted poems

router.get('/authors', function(req, res){
  // grab all the poems
  Poem.find({}, function(err, allThePoems){
    if (err) {
      console.log("Error retrieving all poems from database..");
      res.end();
    } else {
      res.render('poems/authors', {
        poems: allThePoems
      });
    }
  }).sort( {
      authorName: 1 })
    .sort( {
      title: 1 })
    // .populate('_username')
    .exec(function(err2) {
      if (err2) {
        console.log("There was an error sorting the data by author name");
      }
    });
});

// this route will grab all poems by a specific author

router.get('/authors/:id', function(req, res) {
  Poem.find( {
    poetID: req.params.id
  }, function(err, foundPoems) {
    if (err) {
      console.log("Error finding poems by author with id: ", req.params.id);
      res.redirect('./home');
    } else {
      //redirect to poems by this author after finding their user object in database
      res.render('poems/specific-author', {
        poems: foundPoems,
        authorName: foundPoems[0].authorName
      });
    }
  }).sort( {
    title: 1 })
    // .populate('_username')
    .exec(function(err2) {
      if (err2) {
        console.log("There was an error sorting the data by author name");
      }
    });
});

// show one individual poem

router.get('/authors/:authorID/:poemID', function(req, res){
  Poem.findOne( {
    _id: req.params.poemID
  }, function(err, foundPoem) {
    if (err) {
      console.log("Error finding individual poem with id: ", req.params.poemID);
    } else {
      console.log("found poem is: ", foundPoem);
      res.render('poems/show', {
        poem: foundPoem
      });
    }
  });
});

// edit that one individual poem

router.get('/authors/:authorID/:poemID/edit', function(req, res){
  Poem.findOne( {
    _id: req.params.poemID
  }, function(err, foundPoem) {
    if (err) {
      console.log("Error finding individual poem with id: ", req.params.poemID);
    } else {
      console.log("found poem is: ", foundPoem);
      res.render('poems/edit', {
        poem: foundPoem,
        currentUsername: req.session.username,
        authorID: req.params.authorID,
        poemID: req.params.poemID
      });
    }
  });
});

// PATCH request for edit poem

router.patch('/authors/:authorID/:poemID/edit', function(req, res) {
  var poemOptions = req.body.poem,
      title = req.body.poem.title,
      content = req.body.poem.content,
      comments = req.body.poem.comments,
      username = req.session.username;
      userEmail = req.session.email;
      // console.log("username is :", username);

  Poem.findOneAndUpdate( {
    _id: req.params.poemID
  }, { $push: { previousVersions: { username, userEmail, title, content }, commentsHistory: { username, comments } }
     },
     function(err, model){
    if (err) {
      console.log("could not find the poem to update!", err);
    } else {
      console.log("updated!");
      res.redirect(302, '/poems/authors');
    }
  });
});

// Show all previous versions of a specific poem

router.get('/authors/:authorID/:poemID/previous', function(req, res){
  Poem.findOne( {
    _id: req.params.poemID
  }, function(err, foundPoem) {
    if (err) {
      console.log("Error finding individual poem with id: ", req.params.poemID);
    } else {
      console.log("found poem is: ", foundPoem);
      res.render('poems/previous-versions', {
        poem: foundPoem,
        currentUsername: req.session.username,
        authorID: req.params.authorID,
        poemID: req.params.poemID
      });
    }
  });
});

// show a particular version of a single poem

router.get('/authors/:authorID/:poemID/:versionID', function(req, res){
  Poem.findOne( { _id: req.params.poemID }, function(err, foundPoem) {
  if (err) {
    console.log("error locating poem, ", err);
  } else {
      for (var i = 0; i < foundPoem.previousVersions.length; i++) {
        if (req.params.versionID == foundPoem.previousVersions[i]._id) {
          var foundVersion = foundPoem.previousVersions[i];
          console.log("!!!!!!!!!!!!SUCCCESSS!!!!!!!!!: ", foundVersion);
          res.render('poems/show-previous', {
             poem: foundVersion,
             versionComments: foundPoem.commentsHistory[i],
             poetID: foundPoem.poetID,
             poemID: foundPoem._id
           });
        }
      }
    }
  });

// latest aggregate -- no errors, but foundVersion = [];

  // Poem.findOne( { _id: poemID }, function(err, foundPoem) {
  //   if (err) {
  //     console.log("error locating poem, ", err);
  //   } else {
  //       console.log("foundPoem.previousVersions: ", foundPoem.previousVersions);
  //       Poem.aggregate([
  //       { $unwind: "$previousVersions" },
  //       { $match: {
  //           _id: versionID,
  //       }}
  //       ], function (err, foundVersion) {
  //       if (err) {
  //           console.log("error finding version with id ", versionID, err);
  //       } else {
  //         console.log("!!!!!!!!!!!!SUCCCESSS!!!!!!!!!:", foundVersion);
  //         res.render('poems/show', {
  //            poem: foundVersion
  //          });
  //         }
  //       });
  //     }
  //   });

  // Poem.findOne( { _id: poemID } )
  //     .aggregate([
  //     { $unwind: "$previousVersions" },
  //     { $match: {
  //         _id: versionID,
  //     }}
  //     ], function (err, foundVersion) {
  //     if (err) {
  //         console.log("error finding version with id ", versionID, err);
  //     } else {
  //       console.log("!!!!!!!!!!!!SUCCCESSS!!!!!!!!!:", foundVersion);
  //       res.render('poems/show', {
  //          poem: foundVersion
  //       });
  //     }
  // });

//Aggregation function -- no errors, but foundVersion = [];
  //  Poem.aggregate([
  //      { $match: {
  //          _id: poemID
  //      }},
  //      { $unwind: "$previousVersions" },
  //      { $match: {
  //          _id: versionID,
  //      }}
  //  ], function (err, foundVersion) {
  //      if (err) {
  //          console.log("error finding version with id ", versionID, err);
  //      } else {
  //        console.log("!!!!!!!!!!!!SUCCCESSS!!!!!!!!!:", foundVersion);
  //        res.render('poems/show', {
  //           poem: foundVersion
  //        });
  //      }
  //  });

  // Poem.aggregate( {$match: { _id: poemID}})
  //     .unwind('previousVersions')
  //     .findOne( { _id: versionID} )
  //     .exec(function(err, foundVersion) {
  //       if (err) {
  //         console.log("error finding version with id: ", versionID);
  //       } else {
  //         console.log("success!");
  //         res.render('poems/show', {
  //           poem: foundVersion
  //         });
  //       }
  //     });

  // Poem.findOne( {
  //   _id: req.params.poemID
  // }).unwind('previousVersions')
  //   .findone( {
  //     _id: req.params.versionID
  //   }).exec(function(err, foundVersion){
  //     if (err) {
  //       console.log("error finding a version with id: ", req.params.versionID);
  //     } else {
  //       console.log("success!");
  //       res.render('poems/show', {
  //         poem: foundVersion
  //       });
  //     }
  //   });

  //
  // Poem.findOne( {
  //   previousVersions._id: req.params.versionID
  // }, function(err, foundPoem) {
  //   if (err) {
  //     console.log("Error finding individual poem with id: ", req.params.poemID);
  //   } else {
  //     console.log("found poem is: ", foundPoem);
  //     res.render('poems/show', {
  //       poem: foundPoem
  //     });
  //   }
  // });
});

// will show all tags that have been inputted by users during poem submission

router.get('/tags', function(req, res, next){
  res.render('poems/tags', { /* TO-DO: Poem data so we can display all poems, grouped by tag */ });
});

// this route will grab all poems with a specific tag

router.get('/tags/:tag', function(req, res){
  Poem.find( {
    keywordTag: tag
  }, function(err, foundPoems) {
    if (err) {
      console.log("Error finding poems with tag: ", req.params.tag);
      res.redirect('./home');
    } else {
      //redirect to poems that have this tag
      res.render('poems/tags', {
        poems: foundPoems,
      });
    }
  });
});

router.get('/vote', function(req, res, next){
  res.render('poems/vote', { /* TO-DO: Poem data so we can display all poems that have been edited within the last [x] hours */ });
});

module.exports = router;
