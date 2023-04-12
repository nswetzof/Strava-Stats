// var requirejs = require("requirejs");

// requirejs.config({
//   // Pass the top-level script.js require function to requirejs so that
//   // node modules are loaded relative to the top-level JS file.
//   nodeRequire: require
// });

// require("swagger");
import * as DBase from "./modules/DBase.js";


const client_id = '53575'
const client_secret = '0f3f0cb4cfe3232afdc5e5e5aba3d081c4beceb0';

let access_token = null;
let refresh_token = null;
let athlete = null;
let scope = "read";  // TODO: This is a test value for debugging, should be determined by the API function fetching data from the server

const loginBtn = document.querySelector(".main_button");
loginBtn.addEventListener("click", e => redirect(e, "read_all,activity:read_all"));

const activityBtn = document.querySelector(".activities");
activityBtn.addEventListener("click", e => {
  e.preventDefault();
  getActivities((Date.now()/1000).toFixed(0), (Date.now()/1000).toFixed(0) - 100000);
});

const searchTerm = document.querySelector(".search");
const searchForm = document.querySelector(".search_form");
const redirectBtn = document.querySelector(".redirect");  // TODO: maybe doesn't go in this file

// window.addEventListener("load", authorize);
searchForm.addEventListener("submit", e => {
  e.preventDefault();
});

// let db; // hold an instance of a db object to store the IndexedDB login data and athlete statistics
// DBase.openDB();

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
    await authorize().then((response) => {
      console.log(response);
      access_token = response.access_token;
      refresh_token = response.refresh_token;
      athlete = response.athlete.id;

      const expiration = response.expires_at;
      const name = `${response.athlete.firstname} ${response.athlete.lastname}`;
      
      localStorage.setItem("user", athlete);
      
      DBase.addCredentials(db, athlete, scope, access_token, expiration, refresh_token);
      // checkAuthentication(athlete, "activity:read_all");
    }).catch(error => {
      console.error(`Authorization Error: ${error}`);
      alert("Please log in to access data.");
    });
  }

  // await refresh(refresh_token).then(result => {
  //   access_token = result.access_token;
  //   refresh_token = result.refresh_token;

  //   const expiration = result.expires_at;
  //   console.log(`Refresh successful.  Refresh token: ${refresh_token}\nResponse:`);
  //   console.log(result);
  // })

  //checkAuthentication();

  // getLoggedInAthlete(access_token, athlete).then(response => console.log(response));

  // let test = await getLoggedInAthleteActivities(access_token); 
}

// function addListeners() {
//   const searchTerm = document.querySelector(".search");
//   const searchForm = document.querySelector(".search_form");
//   const redirectBtn = document.querySelector(".redirect");  // TODO: maybe doesn't go in this file

//   // window.addEventListener("load", authorize);
//   searchForm.addEventListener("submit", e => {
//     e.preventDefault();
//   });
// }

/* Authorization functions (getTokens is unused) */

function redirect(e, scope, callback=window.location.origin) {
  e.preventDefault();
  window.location.href = `http://www.strava.com/oauth/authorize?client_id=${client_id}&response_type=code&approval_prompt=force\
  &scope=${scope}&redirect_uri=${callback}`;
}

async function authorize() {
  let addr = new URL(window.location.href);

  if(addr.searchParams.has("code")) {

    let code = addr.searchParams.get("code");
    scope = addr.searchParams.get("scope");

    const messagePromise = await fetch("https://www.strava.com/api/v3/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      // credentials: "omit",
      body: JSON.stringify( {
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code,
        "grant_type": "authorization_code"
      } )
    }).then((response) => {
      if(!response.ok)
        throw new Error(`HTTP error: ${response.status}`);
      
      return response.json();
    }).then((data) => {
      return data;
    }).catch((error) => {
      console.error(`Authentication error: ${error}`);
    });

    return messagePromise;
  }

  else return null;
}

async function refresh(token) {
  let url = new URL(`https://www.strava.com/api/v3/oauth/token`);

  const messagePromise = await fetch(`https://www.strava.com/api/v3/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type" : "application/json"
    },

    body : JSON.stringify( {
      "client_id" : client_id,
      "client_secret" : client_secret,
      "grant_type" : "refresh_token",
      "refresh_token" : token
    } )
  }).then(result => {return result.json();})
  .then(data => {return data;})
  .catch(error => {
    console.error(`Refresh error: ${error}`);
  });

  return messagePromise;
}

async function getTokens(response) {
  let result = await response.then((data) => {
    return data;
  });
  
  let access = result.access_token;
  let refresh = result.refresh_token;
  
  return [access, refresh];
}

/* API Calls */
async function getLoggedInAthlete(access_token, athlete) {
  let url = `https://www.strava.com/api/v3/athlete`;

  const response = await readData(access_token, url).then(data => {
    return data;
  }).then(result => {
    return result;
  }).catch(error => {
    console.error(`Error: ${error}`);
  })

  return response;
}

async function getAthleteStats(access_token, athlete_id) {
  const url = `https://www.strava.com/api/v3/athletes/${athlete_id}/stats`;

  let result = await readData(access_token, url).then(data => {
    return data;
  }).catch(error => {
    console.error(`Error: ${error}`);
  });

  console.log(result);
}

async function getActivities(before, after, page = 1, per_page = 30) { // TODO: FIX FUNCTION PARAMETERS
  let results = [];

  DBase.checkStoredCredentials(15332212, "read", getLoggedInAthleteActivities, before, after, 1, 3);
}

async function getAllAthleteActivities(access_token, before = (Date.now()/1000).toFixed(0), after = 0, page = 1, max_pages = 1000) {
  let results = [];

  let activities = await getLoggedInAthleteActivities(access_token, before, after, page, 1000);
  
  while(activities.length > 0 && page < max_pages) {
    results = results.concat(activities);
    
    activities = await getLoggedInAthleteActivities(access_token, before, after, page, 100);

    page += 1;
  }

  return results;
}

async function getLoggedInAthleteActivities(access_token, before = (Date.now()/1000).toFixed(0), after = 0, page = 1, per_page = 30) {
  const url = `https://www.strava.com/api/v3/athlete/activities?before=${before}&after=${after}&page=${page}&per_page=${per_page}`;
  
  const result = await readData(access_token, url).then(data => {
    console.log("data is: ");
    console.log(data);
    DBase.addActivityData(data);

    return data;
  }).catch(error => {
    console.error(`Error: ${error}`);
  })

  return result;
}

/*
Uses fetch to obtain data in JSON format from the strava API
Inputs: 
  access_token - The unique access token given to a user in order to access the api
  url - URL to be accessed
Requires: access_token is a valid access token.  If not, will receive an error.
*/
async function readData(access_token, url, read_all = true) {
  const result = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "Authorization":  `Bearer ${access_token}`
    }
  }).then(response => {
    if(!response.ok)
      throw new Error(`HTTP Error: ${response.status}`);

    return response.json();
  }).catch(error => {
    console.error(`Error accessing data: ${error}`);
  });

  return result;
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