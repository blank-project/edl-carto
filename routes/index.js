var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var NodeGeocoder = require('node-geocoder');
var router = express.Router();

var options = {
  provider: 'google',

  // Optional depending on the providers
  httpAdapter: 'https', // Default
  formatter: null         // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(options);


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', user: req.user });
});

router.post('/register', function(req, res, next) {
    Account.register(new Account({ username : req.body.username, email : req.body.email }), req.body.password, function(err, account) {
        if (err) {
          return res.render('register', { error : err.message });
        }
        res.redirect('/panel');
    });
});

router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/panel');
});

router.get('/panel', function(req, res) {
  if(req.user.username=='admin') {
    Account.find({}).exec(function(err, result) {
      if (!err) {
        res.render('panel-admin', { user : req.user, accounts : result})
      } else {
        // error handling
      }
    })
  } else {
    var user = req.user.username
    Account.findOne({'username': user}).exec(function(err, result) {
      if (!err) {
        res.render('panel', { user : req.user, accounts : result})
      } else {
        // error handling
      }
    })
  }
});

router.post('/panel', function(req, res) {

  var fullAdress = req.body.adressNb+' '+req.body.adressType+' '+req.body.adressName+' '+req.body.adressZip+' Paris';

  geocoder.geocode(fullAdress)
    .then(function(res1) {



      Account.update({username: req.session.passport.user}, {
        username: req.body.username,
        email: req.body.email,
        geocoding: res1,
        structureName: req.body.structureName,
        structureMail: req.body.structureMail,
        structurePhone: req.body.structurePhone,
        adressNb: req.body.adressNb,
        adressType: req.body.adressType,
        adressName: req.body.adressName,
        adressZip: req.body.adressZip,
        metro: req.body.metro,
        website: req.body.website,
        type: req.body.type,
        public: req.body.public,
        time: req.body.time,
        meeting: req.body.meeting
      }).exec(function(err) {
        if (!err) {
          var user = req.user.username
          Account.findOne({'username': user}).exec(function(err, result) {
            if (!err) {
              res.render('panel', { user : req.user, accounts : result});
            } else {
              // error handling
            }
          });
        } else {
          console.log(err);
        }
      })






    })
    .catch(function(err) {
      console.log(err);
    });









});

router.get('/remove', function(req, res) {
  if(req.query.id) {
    Account.remove({_id : req.query.id}, function (err) {
  if (err) return handleError(err);
    res.redirect('/panel');
  })}
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/map', function(req, res) {

  res.render('map', { title: 'Express', user: req.user });
});


module.exports = router;
