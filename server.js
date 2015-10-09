var express = require('express'),
    PORT    = process.env.PORT || 3788,
    server  = express();

server.get('/wicked-secret-test', function(req, res){
  res.write("welcome to my craptastic app!");
  res.end();
});

server.listen(PORT, function() {
  console.log("SERVER IS UP ON PORT: ", PORT);
})
