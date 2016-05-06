'use strict';

const express = require('express');
const handlebars = require('express-handlebars').create();
const runs = require('./routes/runs');
const http = require('http');
const path = require('path');
const config = require('./config');
const app = express();
const Mongo = require('connect-mongo')(express);
app.use(express.cookieParser());
app.use(express.session({
  store: new Mongo({
    url: `mongodb://${config.mongo_username}:${config.mongo_password}@${config.mongo_host}:${config.mongo_port}/${config.mongo_collection}`
  }),
  secret: config.session_key
}));
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
app.get('/oauth', (req, res) => res.redirect(`https://www.strava.com/oauth/authorize?client_id=${config.strava_client_id}&response_type=${config.strava_response_type}&redirect_uri=${config.strava_redirect_uri}&scope=${config.strava_scope}&state=${config.strava_state}&approval_prompt=${config.strava_approval_prompt}`));

// GET /oauth/callback
app.get('/oauth/callback', runs.exchangeOAuthCode(config.strava_client_id, config.strava_client_secret, config.strava_state));

// GET /maps
app.get('/maps', (req, res) => {
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
