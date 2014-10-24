var express = require('express');
var util = require('util');
var handlebars = require('express-handlebars').create();
var runs = require('./routes/runs');
var http = require('http');
var path = require('path');
var config = require('./config');
var app = express();

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
app.use(function(req, res, next){
   res.type('text/html');
   res.status(404);
   res.render('404');
});


// --------------------------------------------------------
// --------------------------------------------------------

// GET /
app.get('/', function (req, res) {
   res.render('index');
});

// GET /oauth
app.get('/oauth', function(req, res) {
   return res.redirect(util.format('https://www.strava.com/oauth/authorize?client_id=%s&response_type=%s&redirect_uri=%s&scope=%s&state=%s&approval_prompt=%s',
      config.strava_client_id,config.strava_response_type, config.strava_redirect_uri, config.strava_scope, config.strava_state, config.strava_approval_prompt));
});

// GET /oauth/callback
app.get('/oauth/callback', runs.exchangeOAuthCode(config.strava_client_id, config.strava_client_secret, config.strava_state));

// GET /maps
app.get('/maps', function(request, response) {
   return response.render('strava-map');
});

// GET /api/activities
app.get('/api/activities', runs.listActivities);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Strava Map listening on port ' + app.get('port'));
});
