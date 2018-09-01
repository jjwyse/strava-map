var geocoder;
var map;

function decodeLevels(encodedLevelsString) {
   var decodedLevels = [];

   for (var i = 0; i < encodedLevelsString.length; ++i) {
        var level = encodedLevelsString.charCodeAt(i) - 63;
        decodedLevels.push(level);
   }
   return decodedLevels;
}

function initialize() {
   var map_canvas = document.getElementById('map_canvas');
   geocoder = new google.maps.Geocoder();

   // Create an array of styles.
   var styles = [
      {
         stylers : [
            {
               hue : "#0080ff"
            },
            {
               saturation : 10
            }
         ]
      },
      {
         featureType : "road",
         elementType : "geometry",
         stylers : [
            {
               lightness : 100
            },
            {
               visibility : "simplified"
            }
         ]
      },
      {
         featureType : "road",
         elementType : "labels",
         stylers : [
            {
               lightness : 50
            },
            {
               visibility : "simplified"
            }
         ]
      },
      {
         featureType : "poi.business",
         elementType : "labels",
         stylers : [
            {
               visibility : "off"
            }
         ]
      }
   ];

   var stravaMap = new google.maps.StyledMapType(styles, { name : 'Strava' });
   var types = [ 'map_fg', google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID ];
   var map_options = {
      // TODO - use HTML 5 geo location
      center : new google.maps.LatLng(39.7392, -98.9842),
      zoom : 4,
      mapTypeId : google.maps.MapTypeId.ROADMAP,
      mapTypeControlOptions : {
         style : google.maps.MapTypeControlStyle.DROPDOWN_MENU,
         mapTypeIds : types
      }
   };

   map = new google.maps.Map(map_canvas, map_options);
   map.mapTypes.set('map_fg', stravaMap);
   map.setMapTypeId('map_fg');
}


function loadActivities() {
   $.ajax({
      type:'GET',
      url:'/api/activities',
      success:function(json){
         console.log("Retrieved Strava activities:");
         var lowlat = 90;
         var lowlng = 180;
         var hilat = -90;
         var hilng = -180;

         $.each(json, function(key, activity){
            console.log("Loading activity: " + activity.name);
            if (!activity.map.summary_polyline) {
               return;
            }
            var decodedPath = google.maps.geometry.encoding.decodePath(activity.map.summary_polyline);
            for (index = 0; index < decodedPath.length; ++index) {
                var lat = decodedPath[index].lat();
                var lng = decodedPath[index].lng();

                lowlat = (lat < lowlat) ? lat : lowlat;
                lowlng = (lng < lowlng) ? lng : lowlng;
                hilat = (lat > hilat) ? lat : hilat;
                hilng = (lng > hilng) ? lng : hilng;
            }

            var decodedLevels = decodeLevels('BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB');

            var setRegion = new google.maps.Polyline({
                 path: decodedPath,
                 levels: decodedLevels,
                 strokeColor: "#ff8000",
                 strokeOpacity: 1.0,
                 strokeWeight: 1,
                 map: map
            });
            var miles = metersToMiles(activity.distance);
            var infowindow = new google.maps.InfoWindow({
               content: '<b>Name:</b> ' + activity.name + '</br>' +
                  '<b>Date:</b> ' + formatDate(activity.start_date) + '</br>' +
                  '<b>Distance:</b> ' + miles + ' mi.</br>' +
                  '<b>Time:</b> ' + secondsToTime(activity.moving_time) + '</br>' +
                  '<b>Pace:</b> ' + secondsToPace(activity.moving_time, miles) + ' min./mi.</br>' +
                  '<b>Elevation Gain:</b> ' + metersToFeet(activity.total_elevation_gain) + ' ft.',
               maxWidth: 200
            });

            var marker = new google.maps.Marker({
               position: decodedPath[0],
               map: map,
               title: activity.name
            });

            google.maps.event.addListener(marker, 'click', function() {
               infowindow.open(map,marker);
            });
         });

         console.log("Finished loading Strava activities");
      }
   });

}

function metersToFeet(meters) {
   return Math.round((meters*3.2808) * 100) / 100
}

function metersToMiles(meters) {
   return Math.round((meters* 0.00062137) * 100) / 100
}

function formatDate(dateString) {
   var date = new Date(dateString);
   return date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear();
}

function secondsToTime(seconds) {
   var hours = parseInt( seconds / 3600 ) % 24;
   if (hours < 10) { hours = '0' + hours; }
   var minutes = parseInt( seconds / 60 ) % 60;
   if (minutes < 10) { mintes = '0' + minutes; }
   var seconds = seconds % 60;
   if (seconds < 10) { seconds = '0' + seconds; }
   return hours + ':' + minutes + ':' + seconds;
}

function secondsToPace(seconds, miles) {
   var secondsPerMile = Math.round((seconds / miles) * 1) / 1;
   var pace = Math.floor(secondsPerMile / 60);
   var secondsLeft = secondsPerMile % 60;
   var responseString = pace.toString() + ':' + secondsLeft.toString();
   if (secondsLeft < 10) {
      responseString = pace.toString() + ':0' + secondsLeft.toString();
   }
   return responseString;
}

$(document).ready(function(){
   initialize();
   loadActivities();
});