var https = require('https');

exports.list = function (stravaToken) {
   return function(request, response) {

      // TODO - JJW
      for (pageNumber = 1; pageNumber < 2; pageNumber ++) {
         var options = {
            host: 'www.strava.com',
            path: '/api/v3/athlete/activities?per_page=200&page=' + pageNumber,
            headers: {
               'User-Agent:': 'strava-map',
               'Authorization': 'Bearer ' + stravaToken
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
};
