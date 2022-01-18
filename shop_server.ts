import * as express from "express";  // express bereitstellen
const fs = require('fs'); // Zugriff auf Dateisystem


// Aktivierung des Servers
const server = express();
const serverPort: number = 3000;

server.listen(serverPort);
console.log("Server ", serverPort,"::::::::::::::::::::::::::::::::::::::::::");

server.use(express.urlencoded({extended: false})); // URLencoded Auswertung ermöglichen
server.use(express.json()); // JSON Auswertung ermöglichen



// Basisverzeichnis des Webservers im Dateisystem
let rootDirectory = __dirname;
server.use("/style", express.static(rootDirectory + "/style"));
server.use("/script", express.static(rootDirectory + "/script"));
console.log("root directory: ", rootDirectory);

// ----------------------------------------------------------------------------
// Start der Website auf dem Client durch Übergabe der index.html -------------
server.get("/", (req: express.Request, res: express.Response) => {

    res.status(200);
    res.sendFile(rootDirectory + "/html/index.html");
});
