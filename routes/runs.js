var https = require('https');
var unirest = require('unirest');

exports.map = function(request, response) {
      return response.render('strava-map');
};

exports.listActivities =  function(request, response) {
      var accessToken = "c34d4e7c0947b7db2d8c5e0d9d8bb07c5236069b";
      console.log("access: " + accessToken);
      for (pageNumber = 1; pageNumber < 2; pageNumber ++) {
         var options = {
            host: 'www.strava.com',
            path: '/api/v3/athlete/activities?per_page=200&page=' + pageNumber,
            headers: {
               'User-Agent:': 'Strava-Map',
               'Authorization': 'Bearer ' + accessToken
            }
         };

         https.get(options, function(res) {
            console.log("Strava response code: " + res.statusCode);

            var responseString = "";

            res.on('data', function(data){
               responseString += data;
            });

            res.on('end', function(){
               var json = JSON.parse(responseString);
               response.send(json);
            });
         }).on('error', function(error){
            response.send(error)
         });
      }
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
