var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var poemSchema = Schema({
  authorName: { type: String, required: true },
  title: String,
  content: { type: String, required: true },
  tags: [ String ],
}, { strict: false } );

var Poem = mongoose.model("Poem", poemSchema);

module.exports = Poem;
