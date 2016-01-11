var express = require('express'),
    StatsD  = require('node-dogstatsd').StatsD,
    router  = express.Router(),
    Poem    = require('../models/poem.js'),
    User    = require('../models/user.js');

// node-dogstatsd setup
var dogstatsd = new StatsD();

// routes for this router

// if user wants to post a new poem..

router.get('/new', function(req, res) {
  if (res.locals.userLoggedIn) {
    dogstatsd.increment('collaboetry.page_views', ['support', 'page:new-poem']);

    res.render('poems/new');
  } else {
    res.redirect(302, '/');
  }
});

// user submits a new poem..

router.post('/new', function(req, res, next) {
  dogstatsd.increment('collaboetry.page_views', ['support', 'page:post-new']);
  var postNewStart = Date.now();

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

      postNewLatency = Date.now() - postNewStart;
      dogstatsd.histogram('collaboetry.latency', signupLatency, ['support', 'page:post-new']);

      res.redirect(302, '/poems/authors/' + poem.poetID);
    }
  });
});

// user gets an error posting poem..

router.get('/new-fail', function(req, res) {
  var newFailStart = Date.now();
  if (res.locals.userLoggedIn) {
    dogstatsd.increment('collaboetry.page_views', ['support', 'page:new-fail']);
    newFailLatency = Date.now() - newFailStart;
    dogstatsd.histogram('collaboetry.latency', newFailLatency, ['support', 'page:new-fail']);

    res.render('poems/new-fail');
  } else {
    res.redirect(302, '/');
  }
});

// for a listing of all authors who have submitted poems

router.get('/authors', function(req, res){
  var allAuthorsStart = Date.now();

  // Poem.find({}, function(err, allThePoems){
  //   if (err) {
  //     console.log("Error retrieving all poems from database..");
  //     res.end();
  //   } else {
  //     res.render('poems/authors', {
  //       poems: allThePoems
  //     });
  //   }
  // }).sort( {
  //     authorName: 1 })
  //   .sort( {
  //     title: 1 })
  //   // .populate('_username')
  //   .exec(function(err2) {
  //     if (err2) {
  //       console.log("There was an error sorting the data by author name");
  //     }
  //   });

  if (res.locals.userLoggedIn) {
    dogstatsd.increment('collaboetry.page_views', ['support', 'page:all-authors']);

    var allAuthors = [];

    Poem.find({})
    .sort( { authorName: 1 } )
    .sort( { title: 1 } )
    .exec(function(err, allThePoems) {
      if (err) {
        console.log("error locating all of the poems: ", err);
      } else {
        for (var i = 0; i < allThePoems.length; i++) {
          if (allAuthors.indexOf(allThePoems[i].authorName) < 0) {
            allAuthors.push(allThePoems[i].authorName);
          } else {
            continue;
          }
        }
      }

      allAuthors.sort();

      console.log("allThePoems", allThePoems);

      allAuthorsLatency = Date.now() - allAuthorsStart;
      dogstatsd.histogram('collaboetry.latency', allAuthorsLatency, ['support', 'page:all-authors']);

      res.render('poems/authors', {
        poems: allThePoems,
        authors: allAuthors
      });
    });
  } else {
    res.redirect(302, '/');
  }
});

// this route will grab all poems by a specific author

router.get('/authors/:id', function(req, res) {
  var allPoemsStart = Date.now();
  dogstatsd.increment('collaboetry.page_views', ['support', 'page:all-author-poems']);

  if (res.locals.userLoggedIn) {
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
      .exec(function(err2) {
        // after sort, check how long the request took
        allPoemsLatency = Date.now() - allPoemsStart;
        dogstatsd.histogram('collaboetry.latency', allPoemsLatency, ['support', 'page:all-author-poems']);

        if (err2) {
          console.log("There was an error sorting the data by author name");
        }
      });
  } else {
    res.redirect(302, '/');
  }
});

// show one individual poem

router.get('/authors/:authorID/:poemID', function(req, res) {
  var onePoemStart = Date.now();
  dogstatsd.increment('collaboetry.page_views', ['support', 'page:one-poem']);

  if (res.locals.userLoggedIn) {
    Poem.findOne( {
      _id: req.params.poemID
    }, function(err, foundPoem) {
      if (err) {
        console.log("Error finding individual poem with id: ", req.params.poemID);
      } else {
        console.log("found poem is: ", foundPoem);

        var onePoemLatency = Date.now() - onePoemStart;
        dogstatsd.histogram('collaboetry.latency', onePoemLatency, ['support', 'page:one-poem']);

        res.render('poems/show', {
          poem: foundPoem,
          currentUser: req.session.currentUser
        });
      }
    });
  } else {
    res.redirect(302, '/');
  }
});

// edit that one individual poem

router.get('/authors/:authorID/:poemID/edit', function(req, res) {
  var editStart = Date.now();
  dogstatsd.increment('collaboetry.page_views', ['support', 'page:edit-poem']);

  if (res.locals.userLoggedIn) {
    Poem.findOne( {
      _id: req.params.poemID
    }, function(err, foundPoem) {
      if (err) {
        console.log("Error finding individual poem with id: ", req.params.poemID);
      } else {
        console.log("found poem is: ", foundPoem);

        editLatency = Date.now() - editStart;
        dogstatsd.histogram('collaboetry.latency', editLatency, ['support', 'page:edit-poem']);

        res.render('poems/edit', {
          poem: foundPoem,
          currentUsername: req.session.username,
          authorID: req.params.authorID,
          poemID: req.params.poemID
        });
      }
    });
  } else {
    res.redirect(302, '/');
  }
});

// PATCH request for edit poem

router.patch('/authors/:authorID/:poemID/edit', function(req, res) {
  var patchStart = Date.now();
  dogstatsd.increment('collaboetry.page_views', ['support', 'page:patch-poem']);

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

      patchLatency = Date.now() - patchStart;
      dogstatsd.histogram('collaboetry.latency', patchLatency, ['support', 'page:patch-poem']);

      res.redirect(302, '/poems/authors');
    }
  });
});

// Show all previous versions of a specific poem

router.get('/authors/:authorID/:poemID/previous', function(req, res){
  var allVersionsStart = Date.now();
  dogstatsd.increment('collaboetry.page_views', ['support', 'page:all-versions']);

  if (res.locals.userLoggedIn) {
    Poem.findOne( {
      _id: req.params.poemID
    }, function(err, foundPoem) {
      if (err) {
        console.log("Error finding individual poem with id: ", req.params.poemID);
      } else {
        console.log("found poem is: ", foundPoem);

        allVersionsLatency = Date.now() - allVersionsStart;
        dogstatsd.histogram('collaboetry.latency', allVersionsLatency, ['support', 'page:all-versions']);

        res.render('poems/previous-versions', {
          poem: foundPoem,
          currentUsername: req.session.username,
          authorID: req.params.authorID,
          poemID: req.params.poemID
        });
      }
    });
  } else {
    res.redirect(302, '/');
  }
});

// show a particular version of a single poem

router.get('/authors/:authorID/:poemID/:versionID', function(req, res){
  var oneVersionStart = Date.now();
  dogstatsd.increment('collaboetry.page_views', ['support', 'page:one-version']);

  if (res.locals.userLoggedIn) {
    Poem.findOne( { _id: req.params.poemID }, function(err, foundPoem) {
    if (err) {
      console.log("error locating poem, ", err);
    } else {
        for (var i = 0; i < foundPoem.previousVersions.length; i++) {
          if (req.params.versionID == foundPoem.previousVersions[i]._id) {
            var foundVersion = foundPoem.previousVersions[i];
            console.log("!!!!!!!!!!!!SUCCCESSS!!!!!!!!!: ", foundVersion);
            // to determine whether or not this is the last version in the array, and thus the most recent
            var last;
            var lastVersionID = foundPoem.previousVersions[foundPoem.previousVersions.length - 1]._id;

            if (i + 1 == foundPoem.previousVersions.length) {
              last = true;

              oneVersionLatency = Date.now() - oneVersionStart;
              dogstatsd.histogram('collaboetry.latency', oneVersionLatency, ['support', 'page:one-version']);

              res.render('poems/show-previous', {
                 version: foundVersion,
                 versionComments: foundPoem.commentsHistory[i],
                 poetID: foundPoem.poetID,
                 authorName: foundPoem.authorName,
                 poemID: foundPoem._id,
                 index: i,
                 currentUserEmail: req.session.email,
                 currentUsername: req.session.username,
                 authorEmail: foundPoem.authorEmail,
                 last: last,
                 lastVersionID: lastVersionID
               });
             } else {
               last = false;

               oneVersionLatency = Date.now() - oneVersionStart;
               dogstatsd.histogram('collaboetry.latency', oneVersionLatency, ['support', 'page:one-version']);

               res.render('poems/show-previous', {
                  version: foundVersion,
                  versionComments: foundPoem.commentsHistory[i],
                  poetID: foundPoem.poetID,
                  authorName: foundPoem.authorName,
                  poemID: foundPoem._id,
                  index: i,
                  currentUserEmail: req.session.email,
                  currentUsername: req.session.username,
                  authorEmail: foundPoem.authorEmail,
                  last: last,
                  lastVersionID: lastVersionID
                });
             }
          }
        }
      }
    });
  } else {
    res.redirect(302, '/');
  }

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

// Delete entire Poem (if currentUser == author)

router.delete('/authors/:authorID/:poemID', function(req, res) {
  var deletePoemStart = Date.now();
  dogstatsd.increment('collaboetry.page_views', ['support', 'page:delete-poem']);

  var poemToDelete = req.params.poemID;

  if (req.session.currentUser == req.params.authorID) {
    Poem.remove({
      _id: poemToDelete
    }, function(err) {
      if (err) {
        console.log("there was an error deleting this poem: ", poemToDelete);
      } else {
        deletePoemLatency = Date.now() - deletePoemStart;
        dogstatsd.histogram('collaboetry.latency', deletePoemLatency, ['support', 'page:delete-poem']);

        res.redirect(302, '/poems/authors');
      }
    });
  };
});

// Delete just one version of the poem (if currentUser == author or version editor -- that's the only way the button can appear)

router.delete('/authors/:authorID/:poemID/:versionID', function(req, res){
  var deleteVersionStart = Date.now();
  dogstatsd.increment('collaboetry.page_views', ['support', 'page:delete-version']);

  var poemID = req.params.poemID,
      versionToDelete = req.params.versionID;

  Poem.update(
    {'_id': poemID },
    { $pull: { "previousVersions" : { _id: versionToDelete } } },
    function(err, model) {
      if (err) {
        console.log(err);
      } else {
        deleteVersionLatency = Date.now() - deleteVersionStart;
        dogstatsd.histogram('collaboetry.latency', deleteVersionLatency, ['support', 'page:delete-version']);

        res.redirect(302, '/poems/authors/' + req.params.authorID + '/' + poemID + '/previous');
      }
    }
  );
});

// will show all tags that have been inputted by users during poem submission

router.get('/tags', function(req, res, next) {
  var allTagsStart = Date.now();
  dogstatsd.increment('collaboetry.page_views', ['support', 'page:all-tags']);

  if (res.locals.userLoggedIn) {
    var allTheTags = [];

    Poem.find({})
    .sort( { title: 1 } )
    .exec(function(err, allPoems) {
        if (err) {
          console.log("error finding all the poems: ", err);
        } else {
          // console.log("allPoems: ", allPoems);
          for (var i = 0; i < allPoems.length; i++) {
            for (var j = 0; j < allPoems[i].tags.length; j++) {
              if (allTheTags.indexOf(allPoems[i].tags[j]) < 0) {
                allTheTags.push(allPoems[i].tags[j]);
              } else {
                continue;
              }
            }
          }
        }
        // console.log("allTheTags: ", allTheTags);

        // alphabetize the array..
        allTheTags.sort();

        allTagsLatency = Date.now() - allTagsStart;
        dogstatsd.histogram('collaboetry.latency', allTagsLatency, ['support', 'page:all-tags']);

        res.render('poems/tags', {
          poems: allPoems,
          tags: allTheTags
        });
    });
  } else {
    res.redirect(302, '/');
  }
});

// this route will grab all poems with a specific tag
// PROBABLY NOT GOING TO USE THIS AFTER ALL
//
// router.get('/tags/:tag', function(req, res){
//   Poem.find( {
//     keywordTag: tag
//   }, function(err, foundPoems) {
//     if (err) {
//       console.log("Error finding poems with tag: ", req.params.tag);
//       res.redirect('./home');
//     } else {
//       //redirect to poems that have this tag
//       res.render('poems/tags', {
//         poems: foundPoems,
//       });
//     }
//   });
// });

// Probably won't have time for this..
router.get('/vote', function(req, res, next) {
  if (res.locals.userLoggedIn) {
    res.render('poems/vote', { /* TO-DO: Poem data so we can display all poems that have been edited within the last [x] hours */ });
  } else {
    res.redirect(302, '/');
  }
});

module.exports = router;
