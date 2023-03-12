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

let db; // hold an instance of a db object to store the IndexedDB login data and athlete statistics
openDB();

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
      
      addCredentials(db, athlete, scope, access_token, expiration, refresh_token);
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

  checkStoredCredentials(15332212, "read", getLoggedInAthleteActivities, before, after, 1, 3);
  // const request = db.transaction(["access", "refresh"]).objectStore("access").get(15332212);

  // request.onsuccess = (event) => {
  //   console.log(request.result);
  // }
  // request.onerror = (error) => {
  //   console.error(`Error accessing database: ${error}`);
  // }
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
    addActivityData(data);

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
    refreshStore.createIndex("scope", "scope", {unique : false});

    // Create athlete activities object store
    const activityStore = db.createObjectStore("activities", {keyPath : "id"})
    activityStore.createIndex("external_id", "external_id", {unique : false});
    activityStore.createIndex("upload_id", "upload_id", {unique : false});
    activityStore.createIndex("athlete", "athlete", {unique : true});
    activityStore.createIndex("name", "name", {unique : false});
    activityStore.createIndex("distance", "distance", {unique : false});
    activityStore.createIndex("moving_time", "moving_time", {unique : false});
    activityStore.createIndex("elapsed_time", "elapsed_time", {unique : false});
    activityStore.createIndex("total_elevation_gain", "total_elevation_gain", {unique : false});
    activityStore.createIndex("elev_high", "elev_high", {unique : false});
    activityStore.createIndex("elev_low", "elev_low", {unique : false});
    activityStore.createIndex("sport_type", "sport_type", {unique : false});
    activityStore.createIndex("start_date", "start_date", {unique : false});
    activityStore.createIndex("start_date_local", "start_date_local", {unique : false});
    activityStore.createIndex("timezone", "timezone", {unique : false});
    activityStore.createIndex("start_latlng", "start_latlng", {unique : false});
    activityStore.createIndex("end_latlng", "end_latlng", {unique : false});
    activityStore.createIndex("achievement_count", "achievement_count", {unique : false});
    activityStore.createIndex("kudos_count", "kudos_count", {unique : false});
    activityStore.createIndex("comment_count", "comment_count", {unique : false});
    activityStore.createIndex("athlete_count_count", "athlete_count", {unique : false});
    activityStore.createIndex("photo_count", "photo_count", {unique : false});
    activityStore.createIndex("total_photo_count", "total_photo_count", {unique : false});
    activityStore.createIndex("map", "map", {unique : false});
    activityStore.createIndex("trainer", "trainer", {unique : false});
    activityStore.createIndex("commute", "commute", {unique : false});
    activityStore.createIndex("manual", "manual", {unique : false});
    activityStore.createIndex("private", "private", {unique : false});
    activityStore.createIndex("flagged", "flagged", {unique : false});
    activityStore.createIndex("workout_type", "workout_type", {unique : false});
    activityStore.createIndex("upload_id_str", "upload_id_str", {unique : false});
    activityStore.createIndex("average_speed", "average_speed", {unique : false});
    activityStore.createIndex("max_speed", "max_speed", {unique : false});
    activityStore.createIndex("has_kudoed", "has_kudoed", {unique : false});
    activityStore.createIndex("hide_from_home", "hide_from_home", {unique : false});
    activityStore.createIndex("gear_id", "gear_id", {unique : false});
    activityStore.createIndex("kilojoules", "kilojoules", {unique : false});
    activityStore.createIndex("average_watts", "average_watts", {unique : false});
    activityStore.createIndex("device_watts", "device_watts", {unique : false});
    activityStore.createIndex("max_watts", "max_watts", {unique : false});
    activityStore.createIndex("weighted_average_watts", "weighted_average_watts", {unique : false});


    console.log( `Success! Created the following object stores:`);
    for(let i = 0; i < db.objectStoreNames.length; i++) {
      console.log(db.objectStoreNames[i]);
    }
  };
}

function deleteDB() {
  useDatabase();
  const request = indexedDB.deleteDatabase("AthleteInformation");

  request.onsuccess = event => {
    console.log("Database deleted successfully.");
    localStorage.clear();
  };
  request.onerror = event => {
    console.log(`Error when trying to delete database: ${error}`);
  };
  request.onblocked = event => {
    alert("Operation blocked.  Could not delete database.")
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

function checkStoredCredentials(id, scope, callback, ...args) {
  const transaction = db.transaction(["access", "refresh"], "readonly");
  const accessStore = transaction.objectStore("access");
  const accessRequest = accessStore.get(id);

  useDatabase();

  accessRequest.onsuccess = (acc_event) => {
    const access_data = accessRequest.result;
    console.log(access_data);

    if(!access_data) {
        console.log("Please log in to access the database.");
    }
    else if(!valid_scope(access_data.scope, scope)) {  // if scope not sufficient, reauthorize to obtain the desired scope
      alert(`Insufficient authorization.  Provide authorization for ${scope} scope`);
      redirect(acc_event, scope);
    }
    else if(!access_data.access_token || access_data.expiration < (Date.now()/1000).toFixed(0)) {
    // else if(!access_data.access_token || access_data.expiration > (0.0)) {  // TODO: FOR DEBUGGING.  USE LINE ABOVE WHEN FINISHED
      const refreshStore = transaction.objectStore("refresh");
      const refreshRequest = refreshStore.get(id);

      refreshRequest.onsuccess = (refresh_event) => {
          const refresh_data = refreshRequest.result;
          if(refresh_data.refresh_token) {
            console.log("Refresh data: ");
            console.log(refresh_data);
            
            refresh(refresh_data.refresh_token)
            .then(result => {
              addCredentials(db, id, scope, result.access_token, result.expires_at, result.refresh_token);
              });

              callback(refresh_data.access_token, args);
          }
          else {
            alert(`Login to retrieve login credentials`);
            redirect(refresh_event, scope);
          }
      };
      refreshRequest.onerror = (refresh_event) => {
        console.error(`Error retrieving refresh credentials: ${refresh_event.target.result.errorCode}`);
      };
    }
    else
      callback(access_data.access_token, args);
  };

  accessRequest.onerror = (acc_event) => {
    console.error(`Error retrieving access credentials: ${acc_event.target.result.errorCode}`);
  };

  
}

/* Tests whether the scope currently granted is sufficient for the required scope parameter
    Parameters:
      user_scope: The currently approved scope for the logged in user
      required_scope: The required scope necessary for a call to the Strava API to be approved
*/
function valid_scope(user_scope, required_scope) {
  scopes = user_scope.split(",");
  
  if(scopes.includes(required_scope))
    return true;

  return false;
}

function addActivityData(data) {
  useDatabase();
  const transaction = db.transaction(["activities"], "readwrite");

  transaction.oncomplete = (event) => {
    console.log("Activity data successfully added to database.");
  };
  transaction.onerror = (event) => {
    console.log(`Transaction error: ${event.target.errorCode}`);
  }

  const activityStore = transaction.objectStore("activities");
  data.forEach(activity => {
    // console.log(activity);
    const activity_request = activityStore.put(activity);

    activity_request.onsuccess = (event) => {
      console.log(`Added ${activity.name} to database.`);
    };
    activity_request.onerror = (event) => {
      
      console.error(`Error adding activity: ${event.target.error}`);
    }
  });
}

function removeActivityData(id) {
  throw new Error("Function has not been implemented");
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