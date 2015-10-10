var express = require('express'),
    PORT    = process.env.PORT || 3788,
    server  = express(),
    MONGOURI = process.env.MONGOLAB_URI || "mongodb://localhost:27017",
    dbname   = "change_this_later"
    mongoose = require('mongoose');


// specific routes--starting with a test one

server.get('/wicked-secret-test', function(req, res){
  res.write("welcome to my craptastic app!");
  res.end();
});

// server listen and mongoose connect

mongoose.connect(MONGOURI + "/" + dbname);
server.listen(PORT, function() {
  console.log("SERVER IS UP ON PORT: ", PORT);
});
