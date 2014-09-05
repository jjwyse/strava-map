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
      center : new google.maps.LatLng(39.7392, -104.9842),
      zoom : 8,
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


function loadRuns() {
   $.ajax({
      type:'GET',
      url:'/api/runs',
      success:function(json){
         console.log("Retrieved Strava runs:");
         $.each(json, function(key, run){
            console.log("Loading run: " + run.name);
            var decodedPath = google.maps.geometry.encoding.decodePath(run.map.summary_polyline);
            var decodedLevels = decodeLevels('BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB');

            var setRegion = new google.maps.Polyline({
                 path: decodedPath,
                 levels: decodedLevels,
                 strokeColor: "#ff8000",
                 strokeOpacity: 1.0,
                 strokeWeight: 1,
                 map: map
            });
            var infowindow = new google.maps.InfoWindow({
               content: '<b>Name:</b> ' + run.name + '</br>' +
                  '<b>Date:</b> ' + formatDate(run.start_date) + '</br>' +
                  '<b>Distance:</b> ' + metersToMiles(run.distance) + ' mi.</br>' +
                  '<b>Time:</b> ' + secondsToTime(run.moving_time) + '</br>' +
                  '<b>Elevation Gain:</b> ' + metersToFeet(run.total_elevation_gain) + ' ft.',
               maxWidth: 200
            });

            var marker = new google.maps.Marker({
               position: decodedPath[0],
               map: map,
               title: run.name
            });

            google.maps.event.addListener(marker, 'click', function() {
               infowindow.open(map,marker);
            });
         });
         console.log("Finished loading Strava runs");
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

$(document).ready(function(){
   initialize();
   loadRuns();
});
