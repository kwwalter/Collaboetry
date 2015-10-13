var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var poemSchema = Schema({
  // authorName: { type: String, required: true }, // only had this in here in case someone wants to use a pen name separate from login name--but that's dumb!
  title: String,
  content: { type: String, required: true },
  tags: [ String ],
  comments: String, 
  poetID: { type: Schema.ObjectId, ref: 'User' },
  authorName: String,
  authorEmail: String,
  oldVersions: [ String ]
}, { strict: false } );

var Poem = mongoose.model("Poem", poemSchema);

module.exports = Poem;
