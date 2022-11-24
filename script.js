const client_id = '53575'
const client_secret = '647c3ad896a07628c0337e0b92a5fd3b20adbfb7';
const access_token = '4b454f427b408868d378c86214e159ef496071d0';
const refresh_token = 'e3327102378d5d72c279112aa4262ac0807220f4';

const submitBtn = document.querySelector(".submit");

submitBtn.addEventListener("click", redirect)


// var StravaApiV3 = require('strava_api_v3');
// var defaultClient = StravaApiV3.ApiClient.instance;

// // Configure OAuth2 access token for authorization: strava_oauth
// var strava_oauth = defaultClient.authentications['strava_oauth'];
// strava_oauth.accessToken = access_token;

// var api = new StravaApiV3.AthletesApi()

// var callback = function(error, data, response) {
//   if (error) {
//     console.error(error);
//   } else {
//     console.log('API called successfully. Returned data: ' + data);
//   }
// };
// api.getLoggedInAthlete(callback);

function redirect(e) {
  // TODO: implement
  e.preventDefault();

  console.log("redirecting...");
  // window.location.href = `https://www.strava.com/oauth/authorize \
  //                         -d client_id=${client_id} \
  //                         -d client_secret=${client_secret} \
  //                         -d code=${};
  window.location.href = `http://www.strava.com/oauth/authorize?client_id=${client_id}&response_type=code&approval_propt=force&scope=read_all&redirect_uri=http://localhost:8000`;
}