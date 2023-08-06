import * as Globals from "./Globals.js"
import * as dBase from "../Modules/DBase.js";
import {Auth} from "./Authenticate.js";
import {Strava} from "./Modules/StravaCalls.js";

window.Globals = Globals;
window.dBase = dBase;
window.Auth = Auth;
window.Strava = Strava;