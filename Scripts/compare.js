import * as dBase from "../Modules/DBase.js";
import {units} from "../Modules/Globals.js";

const searchBtn = document.querySelector(".searchBtn");
const sportSelect = document.querySelector("#sport");
const searchInput = document.querySelector("#keywords");

let checkedPolylines = L.featureGroup([]);  // stores all activity polylines that are checked on the page
let polylineMap = new Map();
let map = L.map('map');  // generate map to display user selected routes

dBase.openDB(listActivities);

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
        let activityList = [];
        const searchTerm = searchInput.value?.toLowerCase();
        
        // filter to match search term if present
        if(searchTerm.trim() !== "") {
            request.result.forEach(element => {
                if(element.name.toLowerCase().includes(searchTerm)) {
                    activityList.push(element);
                }
            });

            callback(activityList);
        }
        else
            callback(request.result);
    }
}

/**
 * Lists filtered athlete activities in a list at the bottom of the page and creates map for activity displays
 * @param activityList Array containing activities to be displayed
 */
function displayActivities(activityList) {
    
    /* Create map ******************************************************************************** */
    let polylines = createMultiline(activityList);
    map.fitBounds(polylines.getBounds()); // generate map with routes displayed
    document.querySelector(".map").style.visibility = "visible";

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    checkedPolylines.addTo(map);
    /******************************************************************************************** */

    // console.log(activityList); // TODO: For debugging.  Delete when done.
    document.querySelector(".activity_summary").style.visibility = "visible";
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
    const checkboxHeader = document.createElement("th");
    const sportHeader = document.createElement("th");
    const dateHeader = document.createElement("th");
    const titleHeader = document.createElement("th");
    const timeHeader = document.createElement("th");
    const distanceHeader = document.createElement("th");
    const elevationHeader = document.createElement("th");
    
    checkboxHeader.textContent = "Show";
    checkboxHeader.setAttribute("scope", "col");
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
    
    tableRowElement.appendChild(checkboxHeader);
    tableRowElement.appendChild(sportHeader);
    tableRowElement.appendChild(dateHeader);
    tableRowElement.appendChild(titleHeader);
    tableRowElement.appendChild(timeHeader);
    tableRowElement.appendChild(distanceHeader);
    tableRowElement.appendChild(elevationHeader);
    
    
    activityList.forEach(element => {
        const rowElement = document.createElement("tr");
        rowElement.setAttribute("id", element.id);

        const checkboxElement = document.createElement("td");
        const sportData = document.createElement("td");
        const dateData = document.createElement("td");
        const titleData = document.createElement("td");
        const timeData = document.createElement("td");
        const distanceData = document.createElement("td");
        const elevationData = document.createElement("td");

        const checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkboxElement.appendChild(checkbox);

        checkbox.addEventListener("change", event => {
            if(event.target.checked)
                showOnMap(map, element);
            else
                removeFromMap(map, element.id);
        });

        sportData.textContent = element.sport_type;
        dateData.textContent = formattedDate(new Date(element.start_date_local));
        titleData.textContent = element.name;

        const date = new Date(element.moving_time * 1000);

        // formate depending on if moving time > 24 hours
        if(element.moving_time <= 86400)
            timeData.textContent = new Date(element.moving_time * 1000).toISOString().slice(11, 19);
        else
            timeDate.textContent = `${Math.floor(element.moving_time / 86400)} days,
             ${date.toISOString().slice(11, 19)}`;
        
        distanceData.textContent = `${(parseFloat((units.distance === "mi") ?
         element.distance/.3048/5280 : element.distance / 1000, 4).toFixed(2))}
         ${units.distance}`;

        
        elevationData.textContent = `${parseFloat(units.elevation == "ft" ? element.total_elevation_gain / .3048 : element.total_elevation_gane)
            .toFixed(2)} ${units.elevation}`;

        rowElement.appendChild(checkboxElement);

        rowElement.appendChild(sportData);
        rowElement.appendChild(dateData);
        rowElement.appendChild(titleData);
        rowElement.appendChild(timeData);
        rowElement.appendChild(distanceData);
        rowElement.appendChild(elevationData);

        tableBodyElement.appendChild(rowElement);
    });
}

function formattedDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth()).padStart(1, "0") + 1}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
* Create leaflet.js MultiPolyline object from an array of Polyline objects
* @param activityArray List of Strava activities
*/
function createMultiline(activityArray) {
    let multiLine = [];
    activityArray.forEach(activity => {
        multiLine.push(L.Polyline.fromEncoded(activity.map.summary_polyline).getLatLngs());
    });

    return L.polyline(multiLine);
}

/**
* Show polyline from a Strava activity on a leaflet.js map
* @param map The map to display the activity on
* @param activity The activity to display
*/
function showOnMap(map, activity) {
    console.log(map.getPane("overlayPane"));
    let polyline = L.polyline(L.Polyline.fromEncoded(activity.map.summary_polyline).getLatLngs()).addTo(checkedPolylines);
    polylineMap.set(activity.id, polyline);

    map.fitBounds(checkedPolylines.getBounds());

    polyline.addEventListener("click", event => {
        const row = document.querySelector(`tr[id="${activity.id}"]`);

        highlightAndFade(row);
    });
}

/**
* Remove polyline representing Strava activity from a leaflet.js map
* @param map The map containing the polyline
* @param {String} id The Strava activity id to remove.
*/
function removeFromMap(map, id) {
    polylineMap.get(id).removeFrom(checkedPolylines);
    polylineMap.delete(id);

    // resize the map if at least one box is checked
    if(polylineMap.size > 0)
        map.fitBounds(checkedPolylines.getBounds());
}

/**
 * Highlights and fades the background color of a an html element
 *
 * @param {HTMLElement} element The element being highlighted.
 */
function highlightAndFade(element) {
    const tr = element;
    
    // Apply highlight style
    tr.style.backgroundColor = 'yellow';
  
    // Remove highlight over 2 seconds
    setTimeout(function() {
      tr.style.transition = 'background-color 2s';
      tr.style.backgroundColor = 'transparent';
    });
  }
  