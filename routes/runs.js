'use strict';

const unirest = require('unirest');

exports.listActivities =  (req, res) => {
   if (!req.session.stravaAuth) {
      console.log('Not logged in - redirecting to homepage');
      res.redirect('/');
   }

   const activities = [];
   /* Retrieves all of your activities by paginating through everything from Strava. */
   retrieve(req, res, 1, 200, activities);
};

const retrieve = (req, res, page, per_page, activities) => {
   unirest.get(`https://www.strava.com/api/v3/athlete/activities?per_page=${per_page}&page=${page}`)
      .headers({'User-Agent': 'Strava-Map'})
      .headers({'Content-Type': 'application/json'})
      .headers({'Authorization': 'Bearer ' + req.session.stravaAuth})
      .end(function (stravaResponse) {
           console.log("Strava response code: " + res.statusCode);
           if(stravaResponse.code != 200) {
             console.log("Failed to retrieve activities from Strava");
             res.send(502);
             return;
           }

           for (var i = 0; i < stravaResponse.body.length; i ++) {
             activities.push(stravaResponse.body[i]);
           }
           if (per_page == stravaResponse.body.length) {
                retrieve(req, res, page + 1, per_page, activities);
           } else {
                res.send(activities);
           }
      });
};

exports.exchangeOAuthCode = (clientId, clientSecret, state) => {
   return (req, res) => {
      console.log ("Attempting to exchange OAuth code for token");

      // validate it's the same state that we sent it
      if (req.query.state != state) {
         res.send(401, 'Invalid OAuth state');
         return;
      }

      unirest.post('https://www.strava.com/oauth/token')
         .headers({'User-Agent': 'Strava-Map'})
         .headers({'Content-Type': 'application/json'})
         .send(JSON.stringify({ client_id: clientId, client_secret: clientSecret, code: req.query.code }))
         .end(function (stravaResponse) {
              if(stravaResponse.code != 200) {
                console.log("Failed to exchange OAuth code: " + stravaResponse.body);
                res.send(502);
                return;
              }
              req.session.stravaAuth = stravaResponse.body.access_token;
              res.redirect('maps');
         });

   };
};
