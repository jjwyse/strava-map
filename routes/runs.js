var unirest = require('unirest');

exports.listActivities =  function(req, res) {
      var accessToken = "c34d4e7c0947b7db2d8c5e0d9d8bb07c5236069b";
      console.log("access: " + accessToken);

      // TODO - iterate through each page
      unirest.get('https://www.strava.com/api/v3/athlete/activities?per_page=200&page=1')
         .headers({'User-Agent': 'Strava-Map'})
         .headers({'Content-Type': 'application/json'})
         .headers({'Authorization': 'Bearer ' + accessToken})
         .end(function (stravaResponse) {
              console.log("Strava response code: " + res.statusCode);
              if(stravaResponse.code != 200) {
                console.log("Failed to retrieve activities from Strava");
                res.send(502);
                return;
              }
              res.send(stravaResponse.body);
         });
};

exports.exchangeOAuthCode = function (clientId, clientSecret, state) {
   return function(request, response) {
      console.log ("Attempting to exchange OAuth code for token");

      // validate it's the same state that we sent it
      if (request.query.state != state) {
         response.send(401, 'Invalid OAuth state');
         return;
      }

      var body = {
         client_id: clientId,
         client_secret: clientSecret,
         code: request.query.code
      }

      unirest.post('https://www.strava.com/oauth/token')
         .headers({'User-Agent': 'Strava-Map'})
         .headers({'Content-Type': 'application/json'})
         .send(JSON.stringify(body))
         .end(function (stravaResponse) {
              if(stravaResponse.code != 200) {
                console.log("Failed to exchange OAuth code: " + stravaResponse.body);
                res.send(502);
                return;
              }
              var accessToken = stravaResponse.body.access_token;
              response.redirect('maps');
         });

   };
};
