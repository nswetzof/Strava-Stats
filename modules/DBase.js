// export * from "Dbase.js";
import * as Index from "../index.js";

const DB_NAME = "AccessTokens";
const DB_VERSION = 1;

let db; // hold an instance of a db object to store the IndexedDB login data and athlete statistics
// openDB();

function useDatabase() {
  db.onversionchange = (event) => {
    db.close();
    alert("A new version of this page is ready.  Please reload or close this tab.");
  };
}

function openDB(callback) {
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

    callback(); // execute callback function
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
            
            Index.refresh(refresh_data.refresh_token)
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
  return user_scope.split(",").includes(required_scope);
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

export {db, useDatabase, openDB, addCredentials, checkStoredCredentials, addActivityData, removeActivityData};
// export * from "DBase.js";