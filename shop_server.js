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
