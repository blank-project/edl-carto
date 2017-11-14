var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username: String,
    password: String,
    email: String,
    admin: Boolean,
    structureName: String,
    structureMail: String,
    structurePhone: Number,
    adressNb: Number,
    adressType: String,
    adressName: String,
    adressZip: Number,
    metro: String,
    website: String,
    type: Array,
    public: String,
    time: String,
    zone: String,
    meeting: Boolean,
    geocoding: Array

});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
