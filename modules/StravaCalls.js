import * as DBase from "./DBase.js";

class Strava {
    /* API Calls */
    static async getLoggedInAthlete(access_token, athlete) {
        let url = `https://www.strava.com/api/v3/athlete`;
    
        const response = await Strava.readData(access_token, url).then(data => {
        return data;
        }).then(result => {
        return result;
        }).catch(error => {
        console.error(`Error: ${error}`);
        })
    
        return response;
    }
    
    static async getAthleteStats(access_token, athlete_id) {
        const url = `https://www.strava.com/api/v3/athletes/${athlete_id}/stats`;
    
        let result = await Strava.readData(access_token, url).then(data => {
        return data;
        }).catch(error => {
        console.error(`Error: ${error}`);
        });
    
        console.log(result);
    }
    
    static async getActivities(before, after, page = 1, per_page = 30) { // TODO: FIX FUNCTION PARAMETERS
        let results = [];
    
        console.log("test");
        DBase.checkStoredCredentials(15332212, "read", Strava.getLoggedInAthleteActivities, before, after, 1, 3);
    }
    
    static async getAllAthleteActivities(access_token, before = (Date.now()/1000).toFixed(0), after = 0, page = 1, max_pages = 1000) {
        let results = [];
    
        let activities = await Strava.getLoggedInAthleteActivities(access_token, before, after, page, 1000);
        
        while(activities.length > 0 && page < max_pages) {
        results = results.concat(activities);
        
        activities = await Strava.getLoggedInAthleteActivities(access_token, before, after, page, 100);
    
        page += 1;
        }
    
        return results;
    }
    
    static async getLoggedInAthleteActivities(access_token, before = (Date.now()/1000).toFixed(0), after = 0, page = 1, per_page = 30) {
        const url = `https://www.strava.com/api/v3/athlete/activities?before=${before}&after=${after}&page=${page}&per_page=${per_page}`;
        
        const result = await Strava.readData(access_token, url).then(data => {
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
    static async readData(access_token, url, read_all = true) {
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
}

export {Strava};