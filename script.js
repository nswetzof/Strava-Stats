const client_id = '53575'
const client_secret = '647c3ad896a07628c0337e0b92a5fd3b20adbfb7';
// const access_token = '4b454f427b408868d378c86214e159ef496071d0';
// const refresh_token = 'e3327102378d5d72c279112aa4262ac0807220f4';

let access_token = null;
let refresh_token = null;
let athlete = null;

const submitBtn = document.querySelector(".main_button");
const searchTerm = document.querySelector(".search");
const searchForm = document.querySelector(".search_form");
const redirectBtn = document.querySelector(".redirect");  // TODO: maybe doesn't go in this file

// window.addEventListener("load", authorize);
submitBtn.addEventListener("click", e => redirect(e));
searchForm.addEventListener("submit", e => {
  console.log(access_token);
  e.preventDefault();
  getAthleteStats(access_token, searchTerm.value);
})
// redirectBtn.addEventListener("click", e => redirect(e));  // TODO: FIGURE THIS PART OUT.  CALLS FUNCTION WHEN LINK PRESSED FROM AUTH ERROR PAGE

const main = document.querySelector("main");

const para = document.createElement("p");
para.textContent = "Test";
main.appendChild(para);

console.log(searchForm);

run();

console.log("finished");

async function run() {

  await authorize().then((response) => {

    access_token = response.access_token;
    refresh_token = response.refresh_token;
    athlete = response.athlete_id;
  }).catch(error => {
    console.error(`Error: ${error}`);
  });

  getLoggedInAthlete(access_token, athlete).then(response => console.log(response));
}

/* Authorization functions (getTokens is unused) */

function redirect(e, callback=window.location.origin) {
  e.preventDefault();
  window.location.href = `http://www.strava.com/oauth/authorize?client_id=${client_id}&response_type=code&approval_propt=force&scope=read_all&redirect_uri=${callback}`;
}

async function authorize() {
  let addr = new URL(window.location.href);

  if(addr.searchParams.has("code")) {

    let code = addr.searchParams.get("code");

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
}

async function getTokens(response) {
  let result = await response.then((data) => {
    return data;
  });
  console.log("here is the result:");
  console.log(result);
  
  let access = result.access_token;
  let refresh = result.refresh_token;
  
  return [access, refresh];
}

/* API Calls */
async function getLoggedInAthlete(access_token, athlete) {
  let url = `https://www.strava.com/api/v3/athlete`;

  const response = await fetch(url, {
    headers: {
      "authorization": `Bearer ${access_token}`
    }
  }).then((response) => {
    if(!response.ok)
      throw new Error(`HTTP Error: ${response.status}`)

      return response.json();
  }).catch(error => {
    console.error(`Error: ${error}`);
  });

  return response;
}

async function getAthleteStats(access_token, athlete_id) {
  let url = `https://www.strava.com/api/v3/athletes/${athlete_id}/stats`

  fetch(url, {
    headers: {
      "authorization": `Bearer ${access_token}`
    }
  }).then(response => {
    if(!response.ok)
      throw new Error(`HTTP Error: ${response.status}`);
    
    return response.json();
  }).then(data => {
    console.log(data);
  }).catch(error => {
    console.error(`Error: ${error}`);
  });
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