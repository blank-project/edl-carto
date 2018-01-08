var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var Files = require('../models/files');
var NodeGeocoder = require('node-geocoder');
var router = express.Router();
var fileUpload = require('express-fileupload');
var fs = require('fs');
var PDFDocument = require('pdfkit');






var options = {
  provider: 'google',

  // Optional depending on the providers
  httpAdapter: 'https',
  apiKey: 'AIzaSyBP3ilrS1K-woHV9s1_FnnsOqRxW6uDCfo', // Default
  formatter: null         // 'gpx', 'string', ...test
};

var geocoder = NodeGeocoder(options);

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Accueil', user: req.user });
});

router.post('/register',loggedIn, function(req, res, next) {
    Account.register(new Account({ username : req.body.username, email : req.body.email }), req.body.password, function(err, account) {
        if (err) {
          return res.render('register', {user : req.user, error : err.message });
        }
        res.redirect('/panel');
    });
});

router.get('/login', function(req, res) {
    res.render('login', {title: 'Login', user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/panel');
});

router.get('/panel',loggedIn, function(req, res) {
  if(req.user.username=='admin') {
    Account.find({}).exec(function(err, result) {
      if (!err) {
        res.render('panel-admin', { title: "Panel",user : req.user, accounts : result})
      } else {
        // error handling
      }
    })
  } else {
    var user = req.user.username
    Account.findOne({'username': user}).exec(function(err, result) {
      if (!err) {
        res.render('panel', { title: "Panel", user : req.user, accounts : result})
      } else {
        // error handling
      }
    })
  }
});

//for admin update
router.get('/panel-admin-update',loggedIn, function(req, res) {
  if(!req.query.q) {
    Account.find({}).exec(function(err, result) {
      if (!err) {
        res.render('panel-admin', { title: "Panel",user : req.user, accounts : result})
      } else {
        // error handling
      }
    })
  } else {
    Account.findOne({'username': req.query.q}).exec(function(err, result) {
      if (!err) {
        res.render('panel', { title: "Panel", user : req.user, accounts : result})
      } else {
        // error handling
      }
    })
  }

});


router.post('/panel',loggedIn, function(req, res) {

  var fullAdress = req.body.adressNb+' '+req.body.adressType+' '+req.body.adressName+' '+req.body.adressZip+' Paris';

  geocoder.geocode(fullAdress)
    .then(function(res1) {
      Account.update({username: req.body.username}, {
        username: req.body.username,
        email: req.body.email,
        geocoding: res1,
        structureName: req.body.structureName,
        structureMail: req.body.structureMail,
        structurePhone: req.body.structurePhone,
        zone: req.body.zone,
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
              res.redirect('panel');
            } else {
              console.log(err);
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

router.get('/remove',loggedIn, function(req, res) {
  if(req.query.id) {
    Account.remove({_id : req.query.id}, function (err) {
  if (err) return handleError(err);
    res.redirect('/panel');
  })}
});

router.get('/logout',loggedIn, function(req, res) {
    req.logout();
    res.redirect('/');
});


router.get('/img', function(req, res) {

});

router.get('/map', function(req, res) {
  //si params
  if(req.query.q || req.query.zone || req.query.service) {
    var user_input = new RegExp(".*" + req.query.q + ".*", "i");
      var queryArray = [];
      for (var property in Account.schema.paths) {
        if (Account.schema.paths.hasOwnProperty(property)  && Account.schema.paths[property]["instance"] === "String") {
          var obj = {};
          obj[property] =  user_input;
          queryArray.push(obj);
        }
      }

  if(req.query.zone=="all") {
    //si toutes zones
    var query = {
      $or: queryArray,
      $and: [{'type': req.query.service}]
    };
  }else if (req.query.service=="all") {
    //si toutes zones
    var query = {
      $or: queryArray,
      $and: [{'zone': req.query.zone}]
    };
  } else {
  //si zone unique
  var query = {
    $or: queryArray,
    $and: [{'zone': req.query.zone}],
    $and: [{'type': req.query.service}]
  };
  }
  Account.find(query, function(error, usersFound){
    if (!error) {
      res.render('map', {title: 'Carte', user : req.user, accounts : usersFound, locals: {
                data: usersFound
                }})

    } else {
      // error handling
    }

  });

} else {
  //si pas de params
  Account.find({}).exec(function(err, result) {
    if (!err) {
      res.render('map', {title: 'Carte', user : req.user, accounts : result, locals: {
                data: result
                }})

    } else {
      // error handling
    }
  })
}
});

router.post('/upload',loggedIn, function(req, res) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  var sampleFile = req.files.sampleFile;
  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv('./public/data/'+req.files.sampleFile.name, function(err) {
    Files.create({ username: req.session.passport.user, name: req.files.sampleFile.name, description: req.body.description }, function (err1, small) {
      if (err1) return handleError(err);
      // saved!
    })
    if (err)
      return res.status(500).send(err);

    res.redirect('/files');
  });
});

router.get('/files',loggedIn, function(req, res) {
  Files.find({}).exec(function(err, result) {
    if (!err) {
      res.render('files', { title: "Panel",user : req.user, files : result})
    } else {
      // error handling
    }
  })
});

router.get('/remove-file',loggedIn, function(req, res) {
  if(req.query.id) {
    Files.remove({_id : req.query.id}, function (err) {
  if (err) return handleError(err);
    res.redirect('/files');
  })}
});


router.get('/pdf', function(req, res) {

  doc = new PDFDocument({
  size: 'LEGAL', // See other page sizes here: https://github.com/devongovett/pdfkit/blob/d95b826475dd325fb29ef007a9c1bf7a527e9808/lib/page.coffee#L69
  info: {
    Title: 'Permanences d\'accès aux droits',
    Author: 'Some Author',
  }
});

doc.fontSize(25).text('Permanences d\'accès aux droits', 120, 80); //title

doc.moveTo(40, 160)   // lignes horizontales tableau première page
   .lineTo(572, 160)
   .moveTo(40,190)
   .lineTo(572, 190)
   .moveTo(40,449)
   .lineTo(572, 449)
   .moveTo(40,708)
   .lineTo(572, 708)
   .moveTo(40,967)
   .lineTo(572, 967)
   .moveTo(40,160)    //ligne verticale gauche
   .lineTo(40, 967)
   .moveTo(572,160)    //ligne verticale droite
   .lineTo(572, 967)
   .moveTo(173,160)    //ligne verticale 2
   .lineTo(173, 967)
   .moveTo(306,160)    //ligne verticale 3
   .lineTo(306, 967)
   .moveTo(439,160)    //ligne verticale 4
   .lineTo(439, 967)
   .stroke();
   doc.fontSize(14)
      .text("Lieu", 40, 168, {width:133, align: 'center'});
   doc.fontSize(14)
      .text("Contact", 173, 168, {width:133, align: 'center'});
   doc.fontSize(14)
      .text("Permanences", 306, 168, {width:133, align: 'center'});
   doc.fontSize(14)
      .text("Jours et horaires", 439, 168, {width:133, align: 'center'});










  if(req.query.q || req.query.zone || req.query.service) {
    var user_input = new RegExp(".*" + req.query.q + ".*", "i");
      var queryArray = [];
      for (var property in Account.schema.paths) {
        if (Account.schema.paths.hasOwnProperty(property)  && Account.schema.paths[property]["instance"] === "String") {
          var obj = {};
          obj[property] =  user_input;
          queryArray.push(obj);
        }
      }

  if(req.query.zone=="all") {
    //si toutes zones
    var query = {
      $or: queryArray,
      $and: [{'type': req.query.service}]
    };
  }else if (req.query.service=="all") {
    //si toutes zones
    var query = {
      $or: queryArray,
      $and: [{'zone': req.query.zone}]
    };
  } else {
  //si zone unique
  var query = {
    $or: queryArray,
    $and: [{'zone': req.query.zone}],
    $and: [{'type': req.query.service}]
  };
  }
  Account.find(query, function(error, result){
    if (!error) {

      var length = result.length;
      var pageNb = Math.ceil((result.length-3)/4);

      for(var i=0;i<3;i++) {
        if(!result[i].admin || result[i].geocoding[0]) {
        doc.fontSize(14)
           .text(result[i].structureName, 40, 200+259*i, {width:130, align: 'center'});
        doc.fontSize(12)
           .text(result[i].geocoding[0].formattedAddress, 40, 270+259*i, {width:130, align: 'center'});
        doc.fontSize(12)
           .text(result[i].metro, 40, 320+259*i, {width:130, align: 'center'});

       doc.fontSize(12)
          .text(result[i].structurePhone, 173, 200+259*i, {width:130, align: 'center'});
       doc.fontSize(12)
          .text(result[i].structureMail, 173, 270+259*i, {width:130, align: 'center'});
        doc.fontSize(12)
           .text(result[i].website, 173, 320+259*i, {width:130, align: 'center'});

       doc.fontSize(12)
          .text(result[i].type, 306, 200+259*i, {width:130, align: 'center'});

      doc.fontSize(12)
         .text(result[i].time, 439, 200+259*i, {width:130, align: 'center'});
      doc.fontSize(12)
         .text((result[i].meeting===false ? "Sans rendez-vous" : "Avec rendez-vous"), 439, 270+259*i, {width:130, align: 'center'});
      //result.shift();
      }
      result.shift();
    }
  doc.pipe(res);
  doc.end();








      /*res.render('map', {title: 'Carte', user : req.user, accounts : usersFound, locals: {
                data: usersFound
              }})*/

    } else {
      // error handling
    }

  });

} else {
  //si pas de params
  Account.find({}).exec(function(err, result) {
    if (!err) {

      var length = result.length;
      var pageNb = Math.ceil((result.length-3)/4);

      for(var i=0;i<3;i++) {
        if(!result[i].admin || result[i].geocoding[0]) {
        doc.fontSize(14)
           .text(result[i].structureName, 40, 200+259*i, {width:130, align: 'center'});
        doc.fontSize(12)
           .text(result[i].geocoding[0].formattedAddress, 40, 270+259*i, {width:130, align: 'center'});
        doc.fontSize(12)
           .text(result[i].metro, 40, 320+259*i, {width:130, align: 'center'});

       doc.fontSize(12)
          .text(result[i].structurePhone, 173, 200+259*i, {width:130, align: 'center'});
       doc.fontSize(12)
          .text(result[i].structureMail, 173, 270+259*i, {width:130, align: 'center'});
        doc.fontSize(12)
           .text(result[i].website, 173, 320+259*i, {width:130, align: 'center'});

       doc.fontSize(12)
          .text(result[i].type, 306, 200+259*i, {width:130, align: 'center'});

      doc.fontSize(12)
         .text(result[i].time, 439, 200+259*i, {width:130, align: 'center'});
      doc.fontSize(12)
         .text((result[i].meeting===false ? "Sans rendez-vous" : "Avec rendez-vous"), 439, 270+259*i, {width:130, align: 'center'});
      }
      result.shift();
      }
  doc.pipe(res);
  doc.end();


      /*res.render('map', {title: 'Carte', user : req.user, accounts : result, locals: {
                data: result
              }})*/




    } else {
      // error handling
    }
  })
}





































//  Account.find({}).exec(function(err, result) {
  //  if (!err) {



    /*  for(var j=1;j<pageNb+1;j++) {
        doc.addPage()
        .moveTo(40, 40)
        .lineTo(572, 40)
        .moveTo(40,70)
        .lineTo(572, 70)
        .moveTo(40,301)
        .lineTo(572, 301)
        .moveTo(40,532)
        .lineTo(572, 532)
        .moveTo(40,763)
        .lineTo(572, 763)
        .moveTo(40,994)
        .lineTo(572, 994)
        .moveTo(40,40)    //ligne verticale gauche
        .lineTo(40, 994)
        .moveTo(572,40)    //ligne verticale droite
        .lineTo(572, 994)
        .moveTo(173,40)    //ligne verticale 2
        .lineTo(173, 994)
        .moveTo(306,40)    //ligne verticale 3
        .lineTo(306, 994)
        .moveTo(439,40)    //ligne verticale 4
        .lineTo(439, 994)
        .stroke();
        doc.fontSize(14)
           .text("Lieu", 40, 48, {width:133, align: 'center'});
        doc.fontSize(14)
           .text("Contact", 173, 48, {width:133, align: 'center'});
        doc.fontSize(14)
           .text("Permanences", 306, 48, {width:133, align: 'center'});
        doc.fontSize(14)
           .text("Jours et horaires", 439, 48, {width:133, align: 'center'});

           //for(var i=2*j;i<3*j+4;i++) {
           for(var i = 0;i<3;i++) {
             if(result[i]) {
             console.log(result[i].structureName);
             doc.fontSize(14)
                .text(result[i].structureName, 40, 80+i*238, {width:130, align: 'center'});
             /*doc.fontSize(12)
                .text(result[i].geocoding[0].formattedAddress, 40, 270+259*i, {width:130, align: 'center'});
             doc.fontSize(12)
                .text(result[i].metro, 40, 320+259*i, {width:130, align: 'center'});

            doc.fontSize(12)
               .text(result[i].structurePhone, 173, 200+259*i, {width:130, align: 'center'});
            doc.fontSize(12)
               .text(result[i].structureMail, 173, 270+259*i, {width:130, align: 'center'});
             doc.fontSize(12)
                .text(result[i].website, 173, 320+259*i, {width:130, align: 'center'});

            doc.fontSize(12)
               .text(result[i].type, 306, 200+259*i, {width:130, align: 'center'});

           doc.fontSize(12)
              .text(result[i].time, 439, 200+259*i, {width:130, align: 'center'});
           doc.fontSize(12)
              .text((result[i].meeting===false ? "Sans rendez-vous" : "Avec rendez-vous"), 439, 270+259*i, {width:130, align: 'center'});
            }
            result.splice(0,1);
          }

      } */

                    //si plus de 3 items

  //  } else {
      // error handling
  //  }




//  }) //close query




});

module.exports = router;
