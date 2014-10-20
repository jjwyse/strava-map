var express = require('express');

var handlebars = require('express-handlebars').create();
var routes = require('./routes');
var runs = require('./routes/runs');

var http = require('http');
var path = require('path');

var config = require('./config');

var app = express();

// all environments
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

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// custom 404 page
app.use(function(req, res, next){
   res.type('text/html');
   res.status(404);
   res.render('404');
});

// GET /
app.get('/', routes.index(config.strava_response_type, config.strava_redirect_uri, config.strava_scope,
   config.strava_state, config.strava_approval_prompt, config.strava_client_id, config.strava_client_secret));

// GET /oauth/callback
app.get('/oauth/callback', runs.exchangeOAuthCode(config.strava_client_id, config.strava_client_secret, config.strava_state));

// GET /maps
app.get('/maps', runs.map);

// APIs
// GET /api/activities
var accessToken = "c34d4e7c0947b7db2d8c5e0d9d8bb07c5236069b"; // TODO
app.get('/api/activities', runs.listActivities(accessToken));

http.createServer(app).listen(app.get('port'), function () {
  console.log('Strava Map listening on port ' + app.get('port'));
});
