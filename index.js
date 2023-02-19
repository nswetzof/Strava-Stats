// var requirejs = require("requirejs");

// requirejs.config({
//   // Pass the top-level script.js require function to requirejs so that
//   // node modules are loaded relative to the top-level JS file.
//   nodeRequire: require
// });

// require("swagger");

const client_id = '53575'
const client_secret = '0f3f0cb4cfe3232afdc5e5e5aba3d081c4beceb0';

let access_token = null;
let refresh_token = null;
let athlete = null;
let scope = "read";

let db; // hold an instance of a db object to store the IndexedDB login data and athlete statistics
openDB();


const submitBtn = document.querySelector(".main_button");
const searchTerm = document.querySelector(".search");
const searchForm = document.querySelector(".search_form");
const redirectBtn = document.querySelector(".redirect");  // TODO: maybe doesn't go in this file

// window.addEventListener("load", authorize);
submitBtn.addEventListener("click", e => redirect(e));
searchForm.addEventListener("submit", e => {
  e.preventDefault();
})
// redirectBtn.addEventListener("click", e => redirect(e));  // TODO: FIGURE THIS PART OUT.  CALLS FUNCTION WHEN LINK PRESSED FROM AUTH ERROR PAGE

const main = document.querySelector("main");

const para = document.createElement("p");
para.textContent = "Test";
main.appendChild(para);

console.log("finished");

async function run() {

  await authorize().then((response) => {
    access_token = response.access_token;
    refresh_token = response.refresh_token;
    athlete = response.athlete.id;

    const expiration = response.athlete.expires_at;
    const name = `${response.athlete.firstname} ${response.athlete.lastname}`;
    
    localStorage.setItem("user", athlete);
    
    addCredentials(db, athlete, scope, access_token, expiration, refresh_token);
    
  }).catch(error => {
    console.error(`Authorization Error: ${error}`);
  });

  // addCredentials(db, athlete, "read_all", access_token, refresh_token);

  //checkAuthentication();

  // getLoggedInAthlete(access_token, athlete).then(response => console.log(response));

  // let test = await getLoggedInAthleteActivities(access_token); 
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
    return data;
  }).catch(error => {
    console.error(`Error: ${error}`);
  })

  return result;
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

    return response.json();
  }).catch(error => {
    console.error(`Error accessing data: ${error}`);
  });

  return result;
}

// Database functions

const DB_NAME = "AccessTokens";
const DB_VERSION = 1;

function openDB() {
  const request = window.indexedDB.open("AthleteInformation", 1);

  request.onblocked = (event) => {
    alert("Please close all other tabs with this site open.");
  };

  request.onerror = (event) => {
    console.error(`Error: ${event.target.errorCode}`);
  };

  request.onsuccess = (event) => {
    console.log("Successfully opened the database.");

    db = event.target.result;

    run(); // run main loop of the program
  };
  
  request.onupgradeneeded = (event) => {
    // Save the IDBDatabase interface
    db = event.target.result;
    
    db.onerror = (event) => {
      console.error(`Database error: ${event.target.errorCode}`);
    }

    // Create an access token object store
    const accessStore = db.createObjectStore("access", {keyPath: "id"});
    accessStore.createIndex("access_token", "access_token", {unique: false});
    accessStore.createIndex("expiration", "expiration", {unique: false});

    // Create a refresh token object store
    const refreshStore = db.createObjectStore("refresh", {keyPath: "id"});
    refreshStore.createIndex("refresh_token", "refresh_token", {unique: false});

    console.log( `Success! Created the following object stores:`);
    for(let i = 0; i < db.objectStoreNames.length; i++) {
      console.log(db.objectStoreNames[i]);
    }
  };
}
  
function useDatabase() {
  db.onversionchange = (event) => {
    db.close();
    alert("A new version of this page is ready.  Please reload or close this tab.");
  };
}

/***********************************************************************************
* Add access and refresh token information for the logged in user to the database.
  Parameters:
    db: database to be modified
    id: athlete_id for the logged in user.  This is the keyPath so must be unique
    scope: scope granted (eg. read, read_all, etc.)
    access_token: the retrieved access token
    expiration: the time value when the access token expires
    refresh_token: the retrieved refresh token

***********************************************************************************/
function addCredentials(db, id, scope, access_token, expiration, refresh_token) {
  const transaction = db.transaction(["access", "refresh"], "readwrite");
  const accessStore = transaction.objectStore("access");
  const refreshStore = transaction.objectStore("refresh");
  
  // add access token information to database
  const access_request = accessStore.put({"id" : id, "scope" : scope, "access_token" : access_token, "expiration" : expiration});
  
  access_request.onsuccess = (event) => {
    console.log("Access credentials added.");
  }
  access_request.onerror = (event) => {
    console.error(`Error in transaction: ${event.target.result.errorCode}`);
  }
  
  // add refresh token information to the database
  const refresh_request = refreshStore.put({"id" : id, "refresh_token" : refresh_token, "scope" : scope});
  
  refresh_request.onsuccess = (event) => {
    console.log("Refresh credentials added.");
  };
  refresh_request.onerror = (event) => {
    console.error(`Error adding refresh credentials: ${event.target.result.errorCode}`);
  };
}

function checkAuthentication(id) {
  const transaction = db.transaction(["access", "refresh"], "readwrite");

  transaction.oncomplete = (event) => {
    console.log("Transaction completed");  // TODO: update message
  }
  transaction.onerror = (event) => {
    console.error(`Error in transaction: ${event.target.result.errorCode}`);
  }

  const accessStore = transaction.objectStore("access");

  const request = accessStore.get(id);

  request.onsuccess = (event) => {
    let access =  event.target.result;
    console.log(access);
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