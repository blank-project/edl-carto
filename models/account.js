var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username: String,
    password: String,
    email: String,
    admin: { type: Boolean, default: 0 },
    structureName: String,
    structureMail: String,
    structurePhone: String,
    adressNb: Number,
    adressType: String,
    adressName: String,
    adressZip: Number,
    metro: String,
    website: String,
    type: String,
    public: String,
    time: String,
    zone: String,
    meeting: Boolean,
    geocoding: Array,
    perm2: Boolean,
    geocoding2: Array,
    zone2: String,
    adressNb2: Number,
    adressType2: String,
    adressName2: String,
    adressZip2: Number,
    metro2: String,
    website2: String,
    type2: String,
    public2: String,
    time2: String,
    meeting2: Boolean

});


Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
