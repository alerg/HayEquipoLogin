var express = require('express');
var compression = require('compression');
var passport = require('passport');
var router = require('./scripts/router');

var app = express();
var port = process.env.PORT || 8082;

app.set('trust proxy', true);

app.use(compression());

app.use((req, res, next) => {
    req.env = {
    }
    next();
});

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

app.use(router);

app.listen(port,function () {
    console.log('\n');
    console.log('running on  http://localhost:' + port);
    console.log('\n');
});