var express = require('express');
var router = express.Router();
var request = require('request');
var path = require('path');

/*
var rootDir = path.dirname(require.main.filename);
var mainLayout = require(path.resolve(rootDir + '/apps/main'));
*/
var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
        clientID: 1257983147557811,
        clientSecret: '40e2e4c9554482197aabcfcd6d7e9d80',
        callbackURL: "http://localhost:8082/auth/facebook/callback",
        profileFields: ['id', 'name', 'email', 'picture'],
        scope: ['email', 'public_profile'],
        enableProof: false
    },
    function(accessToken, refreshToken, profile, done) {
        var form = {
            "provider": "facebook",
            "uid": profile.id,
            "email": profile.emails[0].value,
            "firstname": profile.name.givenName,
            "lastname": profile.name.familyName,
            "photoURL": profile.photos[0].value,
            "token": accessToken
        }
        request.post('http://localhost:56563/HayEquipo.asmx/signInWithProvider', { form: form },
            function optionalCallback(err, httpResponse, body) {
                if (err) {
                    return console.error('upload failed:', err);
                }
                console.log('Upload successful!  Server responded with:', body);
                return done(null, body);
            });
    }
));
/*
router.get('/login', function(req, res, next) {
    mainLayout.loadApp(req, res, 'login').then(function(render) {
        res.send(render.html);
    }).catch(function(err) {
        next(err);
    });
});
*/
router.get('/auth/facebook',
    passport.authenticate('facebook'));


var parseString = require('xml2js').parseString;
var xml = "<root>Hello xml2js!</root>"


router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
        parseString(req.user, function(err, result) {
            console.log("Json: ", result);
            res.redirect('http://localhost:8081/callback?id=' + encodeURIComponent(result.UserDTO.Id[0]) + '&Image=' + encodeURIComponent(result.UserDTO.Image[0]) + '&Centro=' + encodeURIComponent(result.UserDTO.Centro[0]) + '&Hash=' + encodeURIComponent(result.UserDTO.Hash[0]) + '&Email=' + encodeURIComponent(result.UserDTO.Email[0]));
        });
    });

module.exports = router;
