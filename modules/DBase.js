export * from "Dbase.js";
const DB_NAME = "AccessTokens";
const DB_VERSION = 1;

let db; // hold an instance of a db object to store the IndexedDB login data and athlete statistics
openDB();

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
  
  return scopes.includes(required_scope);
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