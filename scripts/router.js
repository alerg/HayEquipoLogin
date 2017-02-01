var express = require('express');
var router = express.Router();
var request = require('request');
var path = require('path');
var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy;
var parseString = require('xml2js').parseString;
var querystring = require('querystring');

var urlAuthLocal = "http://localhost:8082";
var urlAuthHeroku = "https://hay-equipo-login.herokuapp.com";
var urlAuth = urlAuthHeroku;

console.log("URL Auth: " + urlAuth);

var urlFrontendLocal = "http://localhost:8081";
var urlFrontendHeroku = "http://hayequipo.herokuapp.com/";
var urlFrontend = urlFrontendHeroku;

console.log("URL frontend: " + urlFrontend);

var urlBackendSomee = "http://hayequipo.somee.com/hayequipo.asmx";
var urlBackendLocal = "http://localhost:56563/hayequipo.asmx";
var urlBackend = urlBackendSomee;

console.log("URL backend: " + urlBackend);

passport.use(new FacebookStrategy({
        clientID: 1257983147557811,
        clientSecret: '40e2e4c9554482197aabcfcd6d7e9d80',
        callbackURL: urlAuth + "/auth/facebook/callback",
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

        var options = {
            "url": urlBackend + '/signInWithProvider',
            "headers": {
                'Content-Type': "application/json; charset=utf-8",
            },
            "form": form
        }
        request.post(options,
            function optionalCallback(err, httpResponse, body) {
                if (err) {
                    console.error('upload failed:', err);
                    return done(err);
                } else {
                    return done(null, body);
                }
            });
    }
));

router.get('/auth/facebook',
    passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
        parseString(req.user, function(err, result) {
            if (err) {
                console.error("Error callback", err);
                console.error("Transformed object", req.user);
            } else {
                res.redirect(urlFrontend + '/callback?id=' + encodeURIComponent(result.UserDTO.Id[0]) + '&Image=' + encodeURIComponent(result.UserDTO.Image[0]) + '&Centro=' + encodeURIComponent(result.UserDTO.Centro[0]) + '&Hash=' + encodeURIComponent(result.UserDTO.Hash[0]) + '&Email=' + encodeURIComponent(result.UserDTO.Email[0]));
            }
        });
    });

module.exports = router;
