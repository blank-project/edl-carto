var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Files = new Schema({
  username: String,
  time: { type: Date, default: Date.now },
  name: String,
  description: String

});

module.exports = mongoose.model('Files', Files);
