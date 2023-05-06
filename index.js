// var requirejs = require("requirejs");

// requirejs.config({
//   // Pass the top-level script.js require function to requirejs so that
//   // node modules are loaded relative to the top-level JS file.
//   nodeRequire: require
// });

// require("swagger");
import * as DBase from "./Modules/DBase.js";
import {Strava} from "./Modules/StravaCalls.js";
import {Auth} from "./Modules/Authenticate.js";


const client_id = '53575'
const client_secret = '0f3f0cb4cfe3232afdc5e5e5aba3d081c4beceb0';

let access_token = null;
let refresh_token = null;
let athlete = null;
let scope = "read";  // TODO: This is a test value for debugging, should be determined by the API function fetching data from the server

const loginBtn = document.querySelector(".main_button");
loginBtn.addEventListener("click", e => Auth.redirect(e, "read_all,activity:read_all"));

const activityBtn = document.querySelector(".activities");
activityBtn.addEventListener("click", e => {
  e.preventDefault();
  Strava.getActivities((Date.now()/1000).toFixed(0), (Date.now()/1000).toFixed(0) - 100000);
});

const searchTerm = document.querySelector(".search");
const searchForm = document.querySelector(".search_form");
const redirectBtn = document.querySelector(".redirect");  // TODO: maybe doesn't go in this file

// window.addEventListener("load", authorize);
searchForm.addEventListener("submit", e => {
  e.preventDefault();
});

// let db; // hold an instance of a db object to store the IndexedDB login data and athlete statistics
DBase.openDB(run);

// redirectBtn.addEventListener("click", e => redirect(e));  // TODO: FIGURE THIS PART OUT.  CALLS FUNCTION WHEN LINK PRESSED FROM AUTH ERROR PAGE

const main = document.querySelector("main");

const para = document.createElement("p");
para.textContent = "Test";
main.appendChild(para);

// async function run(callback) {

// }

async function run() {
  console.log("running main loop...");
  // const athlete = localStorage.getItem("user");
  // checkStoredCredentials(athlete, scope);

  if(localStorage.getItem("user")) {
    const athlete = parseInt(localStorage.getItem("user"));
    // checkStoredCredentials(athlete, scope);
  }
  else {
    await Auth.authorize().then((response) => {
      console.log(response);
      access_token = response.access_token;
      refresh_token = response.refresh_token;
      athlete = response.athlete.id;

      const expiration = response.expires_at;
      const name = `${response.athlete.firstname} ${response.athlete.lastname}`;
      
      localStorage.setItem("user", athlete);
      
      DBase.addCredentials(DBase.db.reference, athlete, scope, access_token, expiration, refresh_token);
      // checkAuthentication(athlete, "activity:read_all");
    }).catch(error => {
      console.error(`Authorization Error: ${error}`);
      alert("Please log in to access data.");
    });
  } 
}

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