const client_id = '53575'
const client_secret = '0f3f0cb4cfe3232afdc5e5e5aba3d081c4beceb0';
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
  e.preventDefault();
  getAthleteStats(access_token, searchTerm.value);
})
// redirectBtn.addEventListener("click", e => redirect(e));  // TODO: FIGURE THIS PART OUT.  CALLS FUNCTION WHEN LINK PRESSED FROM AUTH ERROR PAGE

const main = document.querySelector("main");

const para = document.createElement("p");
para.textContent = "Test";
main.appendChild(para);

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

  // getLoggedInAthlete(access_token, athlete).then(response => console.log(response));

  getLoggedInAthleteActivities(access_token); // TODO: WHY IS DATA EMPTY?

}

/* Authorization functions (getTokens is unused) */

function redirect(e, callback=window.location.origin) {
  e.preventDefault();
  window.location.href = `http://www.strava.com/oauth/authorize?client_id=${client_id}&response_type=code&approval_prompt=force\
  &scope=read_all,activity:read_all&redirect_uri=${callback}`;
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
  
  let access = result.access_token;
  let refresh = result.refresh_token;
  
  return [access, refresh];
}

/* API Calls */
async function getLoggedInAthlete(access_token, athlete) {
  let url = `https://www.strava.com/api/v3/athlete`;

  // const response = await fetch(url, {
  //   headers: {
  //     "authorization": `Bearer ${access_token}`
  //   }
  // }).then((response) => {
  //   if(!response.ok)
  //     throw new Error(`HTTP Error: ${response.status}`)

  //     return response.json();
  // }).catch(error => {
  //   console.error(`Error: ${error}`);
  // });

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

// async function getAllAthleteActivities(access_token, before = Date.now()/1000, after = 0) {
//   let page = 1;
  
//   do {
//     let activities = getLoggedInAthleteActivities(access_token, before, after, page, 100);

//   }
// }

async function getLoggedInAthleteActivities(access_token, before = Date.now()/1000, after = 0, page = 1, per_page = 30) {
  const url = `https://www.strava.com/api/v3/athlete/activities?before=${before}&after=${after}&page=${page}&per_page=${per_page}`;
  
  const result = await readData(access_token, url).then(data => {
    console.log("data is: ");
    console.log(data);
    return data;
  }).catch(error => {
    console.error(`Error: ${error}`);
  })
}

/*
Uses fetch to obtain data in JSON format from the strava api
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

    console.log(response);  // TODO: DELETE AFTER DEBUGGING
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