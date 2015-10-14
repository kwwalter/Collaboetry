var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var poemSchema = Schema({
  // authorName: { type: String, required: true }, // only had this in here in case someone wants to use a pen name separate from login name--but that's dumb!
  date: { type: Date, default: Date.now },
  title: String,
  content:{ type: String, required: true },
  tags: [ String ],
  comments: String,
  poetID: { type: Schema.ObjectId, ref: 'User' },
  authorName: String,
  authorEmail: String,
  previousVersions: [ { username: String, userEmail: String, title: String, content: String, date: { type: Date, default: Date.now } } ],
  commentsHistory: [ { username: String, comments: String } ]
}, { strict: false } );

var Poem = mongoose.model("Poem", poemSchema);

module.exports = Poem;
