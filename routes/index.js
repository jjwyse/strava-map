exports.index = function(responseType, redirectUri, scope, state, approvalPrompt, clientId, clientSecret){
   return function (req, res) {
      res.render('index', {
         title: 'Strava Heat Map',
         response_type: responseType,
         redirect_uri: redirectUri,
         scope: scope,
         state: state,
         approval_prompt: approvalPrompt,
         client_id: clientId,
         client_secret: clientSecret
      });
   };
};

exports.oauthCallback = function(req, res) {
   res.render('index', {title: 'TODO - OAuth Callback Hit'});
}
