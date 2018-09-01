'use strict';

const express = require('express');
const handlebars = require('express-handlebars').create();
const runs = require('./routes/runs');
const http = require('http');
const path = require('path');
const app = express();
const session = require('express-session')
app.use(session({
  secret: process.env.SESSION_KEY,
  resave: false,
  saveUninitialized: true
}))
app.use(express.cookieParser());
app.set('port', process.env.PORT || 2997);
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
app.use(express.favicon("./public/images/favicon.ico"));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// custom 404 page
app.use((req, res, next) => {
  res.type('text/html');
  res.status(404);
  res.render('404');
});

// --------------------------------------------------------
// --------------------------------------------------------

// GET /
app.get('/', (req, res) => {
  if (req.session.stravaAuth) res.redirect('/maps');
  res.render('index');
});

// GET /oauth
app.get('/oauth', (req, res) => res.redirect(`https://www.strava.com/oauth/authorize?client_id=${process.env.STRAVA_CLIENT_ID}&response_type=${process.env.STRAVA_RESPONSE_TYPE}&redirect_uri=${process.env.STRAVA_REDIRECT_URI}&scope=${process.env.STRAVA_SCOPE}&state=${process.env.STRAVA_STATE}&approval_prompt=${process.env.STRAVA_APPROVAL_PROMPT}`));

// GET /oauth/callback
app.get('/oauth/callback', runs.exchangeOAuthCode(process.env.STRAVA_CLIENT_ID, process.env.STRAVA_CLIENT_SECRET, process.env.STRAVA_STATE));

// GET /maps
app.get('/maps', (req, res) => {
  console.log(req.session);
  if (!req.session.stravaAuth) {
    console.log('Not logged in - redirecting to homepage');
    res.redirect('/');
  }
  return res.render('strava-map');
});

// GET /api/activities
app.get('/api/activities', runs.listActivities);

http.createServer(app).listen(app.get('port'), () => {
  console.log('Strava Map listening on port ' + app.get('port'));
});
