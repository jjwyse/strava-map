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
      zoom : 9,
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
         });
         console.log("Finished loading Strava runs");
      }
   });

}


$(document).ready(function(){
   initialize();
   loadRuns();
});
