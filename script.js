const client_id = '53575'
const client_secret = '647c3ad896a07628c0337e0b92a5fd3b20adbfb7';
// const access_token = '4b454f427b408868d378c86214e159ef496071d0';
// const refresh_token = 'e3327102378d5d72c279112aa4262ac0807220f4';

const submitBtn = document.querySelector(".submit");

// window.addEventListener("load", authorize);
submitBtn.addEventListener("click", e => getCredentials(e))

const main = document.querySelector("main");

const para = document.createElement("p");
para.textContent = "Test";
main.appendChild(para);

run();

async function run() {

  const message = await authorize();
  // message.then((result) => console.log(result));
  console.log(message);

  let access_token = message.access_token;
  let refresh_token = message.refresh_token;
  const athlete = message.athlete;

  console.log([access_token, refresh_token]);
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

function getCredentials(e) {
  e.preventDefault();
  window.location.href = `http://www.strava.com/oauth/authorize?client_id=${client_id}&response_type=code&approval_propt=force&scope=read_all&redirect_uri=http://localhost:8000`;
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
        return data
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