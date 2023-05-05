class Auth {
    /* Authorization functions (getTokens is unused) */
    
    static redirect(e, scope, callback=window.location.origin) {
        e.preventDefault();
        window.location.href = `http://www.strava.com/oauth/authorize?client_id=${client_id}&response_type=code&approval_prompt=force\
        &scope=${scope}&redirect_uri=${callback}`;
      }
      
      static async authorize() {
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
      
      static async refresh(token) {
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
      
      static async getTokens(response) {
        let result = await response.then((data) => {
          return data;
        });
        
        let access = result.access_token;
        let refresh = result.refresh_token;
        
        return [access, refresh];
      }
}

export {Auth};