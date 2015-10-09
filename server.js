var express = require('express'),
    PORT    = process.env.PORT || 3788,
    server  = express(),
    MONGOURI = process.env.MONGOLAB_URI,
    dbname   = "change_this_later"
    mongoose = require('mongoose');

server.get('/wicked-secret-test', function(req, res){
  res.write("welcome to my craptastic app!");
  res.end();
});

mongoose.connect(MONGOURI + "/" + dbname);
server.listen(PORT, function() {
  console.log("SERVER IS UP ON PORT: ", PORT);
})
