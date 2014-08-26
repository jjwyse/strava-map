var https = require('https');

exports.list = function (stravaToken) {
   return function(request, response) {

      var options = {
         host: 'www.strava.com',
         path: '/api/v3/athlete/activities',
         headers: {
            'User-Agent:': 'strava-map',
            'Authorization': 'Bearer ' + stravaToken
         }
      };

      https.get(options, function(res) {
         console.log("Strava response code: " + res.statusCode);

         var responseString = ""

         res.on('data', function(data){
            responseString += data;
         });

         res.on('end', function(){
            var json = JSON.parse(responseString);
//            response.send(json);
            response.render('index', {stravaRuns:json});
         });
      }).on('error', function(error){
         console.error(error);
         response.render('index', {strava:json});
      });
   };
};
