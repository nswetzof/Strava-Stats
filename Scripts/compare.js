import * as dBase from "../Modules/DBase.js";
import {units} from "../Modules/Globals.js";
import {Strava} from "../Modules/StravaCalls.js";

const keyWordElement = document.querySelector("keywords");
const searchBtn = document.querySelector(".searchBtn");

const activityList = document.querySelector(".activity_list");
const sportSelect = document.querySelector("#sport");

// let db;
// dBase.openDB(db, getFilteredActivities("Hike"));

searchBtn.addEventListener("click", event => {
    event.preventDefault();
    dBase.openDB(listActivities);
})

function listActivities() {
    let sport = sportSelect.value; // used to filter activity type
    console.log(dBase.db.reference);
    getFilteredActivities(sport, displayActivities);
}

function getFilteredActivities(sportType, callback=null) {
    const objectStore = dBase.db.reference.transaction(["activities"], "readonly").objectStore("activities");
    let request;
    if(sportType == "All Sport Types") {
        request = objectStore.getAll();
    }
    else {
        const index = objectStore.index("sport_type");
        request = index.getAll(sportType);
    }

    request.onerror = (event) => {
        console.error(`Database error: ${event.target.errorCode}`);
    }

    request.onsuccess = (event) => {
        callback(request.result);
    }
}

/*
 * Lists filtered athlete activities in a list at the bottom of the page
 * activityList: Array containing activities to be displayed
 */
function displayActivities(activityList) {
    
    /* Create map ******************************************************************************** */
    let polylines = createMultiline(activityList);
    let map = L.map('map').fitBounds(polylines.getBounds()); // generate map with routes displayed

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    /******************************************************************************************** */

    console.log(activityList);
    const tableElement = document.querySelector("#activity_table");

    // remove any previously displayed data from the list
    while(tableElement.firstChild)
        tableElement.removeChild(tableElement.firstChild);

    const tableHeadElement = document.createElement("thead");
    const tableBodyElement = document.createElement("tbody");
    const tableRowElement = document.createElement("tr");

    tableElement.appendChild(tableHeadElement);
    tableElement.appendChild(tableBodyElement);
    tableHeadElement.appendChild(tableRowElement);
    
    // make headers
    const sportHeader = document.createElement("th");
    const dateHeader = document.createElement("th");
    const titleHeader = document.createElement("th");
    const timeHeader = document.createElement("th");
    const distanceHeader = document.createElement("th");
    const elevationHeader = document.createElement("th");
    
    sportHeader.textContent = "Sport";
    sportHeader.setAttribute("scope", "col");
    dateHeader.textContent = "Date";
    dateHeader.setAttribute("scope", "col");
    titleHeader.textContent = "Title";
    titleHeader.setAttribute("scope", "col");
    timeHeader.textContent = "Time";
    timeHeader.setAttribute("scope", "col");
    distanceHeader.textContent = "Distance";
    distanceHeader.setAttribute("scope", "col");
    elevationHeader.textContent = "Elevation";
    elevationHeader.setAttribute("scope", "col");
    
    tableRowElement.appendChild(sportHeader);
    tableRowElement.appendChild(dateHeader);
    tableRowElement.appendChild(titleHeader);
    tableRowElement.appendChild(timeHeader);
    tableRowElement.appendChild(distanceHeader);
    tableRowElement.appendChild(elevationHeader);
    
    
    activityList.forEach(element => {
        const rowElement = document.createElement("tr");

        const sportData = document.createElement("td");
        const dateData = document.createElement("td");
        const titleData = document.createElement("td");
        const timeData = document.createElement("td");
        const distanceData = document.createElement("td");
        const elevationData = document.createElement("td");

        sportData.textContent = element.sport_type;
        dateData.textContent = element.start_date_local;
        titleData.textContent = element.name;
        timeData.textContent = element.moving_time;
        distanceData.textContent = `${element.distance} ${units.distance}`;
        elevationData.textContent = `${element.total_elevation_gain} ${units.elevation}`;

        rowElement.appendChild(sportData);
        rowElement.appendChild(dateData);
        rowElement.appendChild(titleData);
        rowElement.appendChild(timeData);
        rowElement.appendChild(distanceData);
        rowElement.appendChild(elevationData);

        tableBodyElement.appendChild(rowElement);
    });
}

/*
* Create leaflet.js MultiPolyline object from an array of Polyline objects
*/
function createMultiline(activityArray) {
    let multiLine = [];
    activityArray.forEach(activity => {
        multiLine.push(L.Polyline.fromEncoded(activity.map.summary_polyline).getLatLngs());
    });

    return L.polyline(multiLine);
}

/*
* Show polylines from an array of Strava activities on a leaflet.js map
* map: The leaflet.js map object to be modified
* activityArray: The array of activities
*/
function showOnMap(map, activityArray) {
    
}