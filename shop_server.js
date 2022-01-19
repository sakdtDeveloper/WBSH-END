"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express"); // express bereitstellen
var fs = require('fs'); // Zugriff auf Dateisystem
// Aktivierung des Servers
var server = express();
var serverPort = 3000;
server.listen(serverPort);
console.log("Server ", serverPort, "::::::::::::::::::::::::::::::::::::::::::");
server.use(express.urlencoded({ extended: false })); // URLencoded Auswertung ermöglichen
server.use(express.json()); // JSON Auswertung ermöglichen
// Basisverzeichnis des Webservers im Dateisystem
var rootDirectory = __dirname;
server.use("/style", express.static(rootDirectory + "/style"));
server.use("/script", express.static(rootDirectory + "/script"));
console.log("root directory: ", rootDirectory);
// ----------------------------------------------------------------------------
// Start der Website auf dem Client durch Übergabe der index.html -------------
server.get("/", function (req, res) {
    res.status(200);
    res.sendFile(rootDirectory + "/html/index.html");
});
//Klassen
var UserInfos = /** @class */ (function () {
    function UserInfos(name, ware, ort, datum, status) {
        this.id = ++UserInfos.id_max;
        this.name = name;
        this.ware = ware;
        this.ort = ort;
        this.datum = new Date(datum);
        this.status = status;
        UserInfos.stack.push(this);
    }
    UserInfos.prototype.getID = function () {
        // Ermittlung der id des rufenden Eintrags
        return this.id;
    };
    UserInfos.prototype.getStatus = function () {
        // Ermittlung des Status des rufenden Eintrags
        return this.status;
    };
    UserInfos.prototype.setStatus = function (status) {
        // Setzen des Status des rufenden Eintrags
        this.status = status;
        return this.status;
    };
    UserInfos.getUsersStack = function () {
        // Rückgabe des vollständigen Stacks mit allen Einträgen
        return UserInfos.stack.sort(function (a, b) { return b.id - a.id; });
    };
    UserInfos.id_max = 0;
    UserInfos.stack = [];
    return UserInfos;
}());
var Infos = /** @class */ (function () {
    // ein Element in diesem Stack enthalten
    function Infos() {
        this.liste = [];
        Infos.stack.push(this);
    }
    Infos.prototype.getInfos = function (id) {
        var userInfo = undefined;
        for (var _i = 0, _a = this.liste; _i < _a.length; _i++) {
            var i = _a[_i];
            if (id === i.getID()) {
                userInfo = i;
            }
        }
        return userInfo;
    };
    Infos.stack = []; // Stack aller Infos (im vorliegenden Fall ist nur
    return Infos;
}());
var LogInfos = /** @class */ (function () {
    function LogInfos(name, ware, ort, datum, status) {
        this.name = name;
        this.ware = ware;
        this.ort = ort;
        this.datum = datum;
        this.status = status;
    }
    return LogInfos;
}());
var logInfosFile_work = "log/db.json";
var currentInfos = new Infos();
fs.readFile(logInfosFile_work, "utf-8", function (err, InfosData) {
    // Einlesen der letzten aktuellen LoP -----------------------------------------
    if (err) {
        // Wenn die Datei nicht existiert, wird eine neue Liste angelegt
        currentInfos.liste = [];
    }
    else {
        // Wenn die Datei existiert, werden die JSON-Daten eingelesen und es wird
        // die letzte aktuelle LoP rekonstruiert.
        var infosDataJSON = JSON.parse(InfosData); // JSON aus den eingelesenen Daten
        for (var _i = 0, infosDataJSON_1 = infosDataJSON; _i < infosDataJSON_1.length; _i++) {
            var i = infosDataJSON_1[_i];
            // Aus dem JSON die LoP aufbauen
            currentInfos.liste.push(new UserInfos(i.name, i.ware, i.ort, new Date(i.datum), i.status));
        }
    }
});
server.get("/read", function (req, res) {
    // READ - Rückgabe der vollständigen LoP als HTML-tbody
    var loP_aktuellLength = currentInfos.liste.length;
    if (currentInfos === undefined) {
        res.status(404);
        res.send("LoP does not exist");
    }
    else {
        // Rendern der aktuellen LoP
        var html_tbody = renderLoP(currentInfos);
        res.status(200);
        res.send(html_tbody);
    }
});
function renderLoP(infos) {
    // Aufbereitung der aktuellen LoP als HTML-tbody
    var html = "";
    for (var i in infos.liste) {
        // Ein Element der LoP wird nur ausgegeben, wenn sein Status auf aktiv (1) steht.
        if (infos.liste[i].getStatus() === 1) {
            var id = infos.liste[i].getID();
            var name_1 = infos.liste[i].name;
            var ware = infos.liste[i].ware;
            var ort = infos.liste[i].ort;
            var datum = infos.liste[i].datum.toISOString().slice(0, 10);
            html += "<tr class='b-dot-line' data-user-id=" + id + ">";
            html += "<td class='click-value' data-purpose='user' data-user-id=" + id + ">" + name_1 + "</td>";
            html += "<td class='click-value' data-purpose='ware'data-user-id=" + id + " >" + ware + "</td>";
            html += "<td class='click-value' data-purpose='ort' data-user-id=" + id + ">" + ort + "</td>";
            html += "<td class='click-value' data-purpose='datum' data-user-id=" + id + ">" + datum + "</td>";
            html += "<td >" + "<button data-purpose='edit' data-user-id=" + id + ">E</button>" + "</td>";
            html += "<td >" + "<button data-purpose='delete' data-user-id=" + id + ">X</button>" + "</td>";
            html += "</tr>";
        }
    }
    return html;
}
function sichern(infos, file) {
    // Aufbau des JSONs mit der infos als Objekt der Klasse LogInfos
    var logInfos = [];
    for (var _i = 0, _a = currentInfos.liste; _i < _a.length; _i++) {
        var i = _a[_i];
        logInfos.push(new LogInfos(i.name, i.ware, i.ort, i.datum, i.getStatus()));
    }
    // Umwandeln des Objekts in einen JSON-String
    var logInfosJSON = JSON.stringify(logInfos);
    // Schreiben des JSON-Strings der LoP in die Datei mit dem Pfadnamen "file"
    fs.writeFileSync(file, logInfosJSON, function (err) {
        if (err)
            throw err;
    });
    return logInfosJSON;
}
server.get("/sichern", function (req, res) {
    // Sichern der aktuellen infos in die Datei db.json
    sichern(currentInfos, logInfosFile_work);
    res.status(200);
    res.send("Infos gesichert");
});
var username; // currentUser
// CREATE
server.post("/create", function (req, res) {
    // Wert vom Client aus dem JSON entnehmen
    var name = String(req.body.name);
    var ware = String(req.body.ware);
    var ort = String(req.body.ort);
    var datum = new Date(req.body.datum);
    username = name;
    currentInfos.liste.push(new UserInfos(name, ware, ort, datum, 1));
    sichern(currentInfos, logInfosFile_work);
    // Rendern der aktuellen LoP und Rückgabe des gerenderten Tabellenteils (tbody)
    var html_tbody = renderLoP(currentInfos);
    res.status(200);
    res.send(html_tbody);
});
function renderLoPChange(currentUser) {
    // Aufbereitung des aktuellen Eintrags für die Änderungs-/Löschausgabe in
    // der zugehörigen Tabellenzeile
    var currentId = currentUser.getID();
    var html = "<td data-purpose='user' data-user-id=" + currentId + ">" +
        "<input name='user' data-user-id=" + currentId + " type='text' value=" + currentUser.name + ">" +
        "</td>" +
        "<td data-purpose='ware' data-user-id=" + currentId + ">" +
        "<form >" +
        "<input  name='ware' class= 'as-width' type='text' value=" + currentUser.ware + ">" +
        "<br>" +
        "<input class='as-button-0' data-purpose='ändern' data-user-id=" + currentId + " type='submit' value='ändern' >" +
        "<input class='as-button-0' data-purpose='zurück' data-user-id=" + currentId + " type='submit' value='zurück' >" +
        "<input class='as-button-0' data-purpose='löschen' data-user-id=" + currentId + " type='submit' value='löschen' >" +
        "</form>" +
        "</td>" +
        "<td data-purpose='ort' data-user-id=" + currentId + ">" +
        "<input name='ort' type='text' value=" + currentUser.ort + ">" +
        "</td>" +
        "<td data-purpose='datum' data-user-id=" + currentId + ">" +
        "<input name='datum' type='text' value=" + (new Date().toISOString()).slice(0, 10) + ">" +
        "</td>";
    return html;
}
server.post("/read", function (req, res) {
    // READ -Rückgabe der Tabellenzeile für ändern und löschen
    // Wert vom Client aus dem JSON entnehmen
    var id = Number(req.body.id);
    var currentUser = currentInfos.getInfos(id);
    if (currentInfos === undefined || currentUser.getStatus() !== 1) {
        res.status(404);
        res.send("Item " + id + " does not exist");
    }
    else {
        // Rendern der aktuellen LoP
        var html_change = renderLoPChange(currentUser);
        res.status(200);
        res.send(html_change);
    }
});
// DELETE - LoP-Eintrag aus der Liste löschen
server.post("/delete", function (req, res) {
    // Wert vom Client aus dem JSON entnehmen
    var id = Number(req.body.id);
    var user = currentInfos.getInfos(id);
    if (user === undefined || user.getStatus() !== 1) {
        res.status(404);
        res.send("Item " + id + " does not exist");
    }
    else {
        user.setStatus(2);
        // Sichern der aktuellen LoP in die Datei logLoPFile_work
        sichern(currentInfos, logInfosFile_work);
        // Rendern der aktuellen LoP und Rückgabe des gerenderten Tabellenteils (tbody)
        var html_tbody = renderLoP(currentInfos);
        res.status(200);
        res.send("Item " + id + " deleted");
    }
});
// UPDATE - LoP-Eintrag ändern
server.post("/update", function (req, res) {
    // Werte vom Client aus dem JSON entnehmen
    var id = Number(req.body.id);
    var name = String(req.body.name);
    var ware = String(req.body.ware);
    var ort = String(req.body.ort);
    var datum = new Date(req.body.datum);
    var user = currentInfos.getInfos(id);
    if (user === undefined || user.getStatus() !== 1) {
        res.status(404);
        res.send("Item " + id + " does not exist");
    }
    else {
        user.name = name;
        user.ware = ware;
        user.ort = ort;
        user.datum = datum;
        // Sichern der aktuellen LoP in die Datei logLoPFile_work
        sichern(currentInfos, logInfosFile_work);
        // Rendern der aktuellen LoP
        renderLoP(currentInfos);
        res.status(200);
        res.send("Item " + id + " changed");
    }
    // Rückgabe der Werte an den Client
});
