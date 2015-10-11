var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var poemSchema = Schema({
  authorName: { type: String, required: true },
  poemContent: { type: String, required: true }
});

var Poem = mongoose.model("Poem", poemSchema);

module.exports = Poem;
