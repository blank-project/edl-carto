var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', user: req.user });
});

router.post('/register', function(req, res, next) {
    Account.register(new Account({ username : req.body.username, email : req.body.email }), req.body.password, function(err, account) {
        if (err) {
          return res.render('register', { error : err.message });
        }
        res.render('panel-admin');
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
        res.render('panel-admin', { user : req.user, accounts :  result})
        console.log(result[0].username);
      } else {
        // error handling
      }
    })
  } else {
    res.render('panel', { user : req.user });
  }
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

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});


module.exports = router;
