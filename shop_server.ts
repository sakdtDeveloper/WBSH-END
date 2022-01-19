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



//Klassen

class UserInfos{

    public name:string;
    public ware:string;
    public ort:string;
    public datum:Date;
    private status:number;
    private readonly id:number;
    private  static id_max:number=0;
    private static stack:UserInfos[]=[]

    constructor(name:string,ware:string,ort:string,datum:Date,status:number) {
        this.id=++UserInfos.id_max;
        this.name=name;
        this.ware=ware;
        this.ort=ort;
        this.datum=new Date(datum);
        this.status=status
        UserInfos.stack.push(this);
    }

    getID(): number {
        // Ermittlung der id des rufenden Eintrags
        return this.id;
    }

    getStatus(): number {
        // Ermittlung des Status des rufenden Eintrags
        return this.status;
    }

    setStatus(status:number): number {
        // Setzen des Status des rufenden Eintrags
        this.status = status;
        return this.status;
    }

    static getUsersStack(): UserInfos[] {
        // Rückgabe des vollständigen Stacks mit allen Einträgen
        return UserInfos.stack.sort((a,b)=>b.id-a.id);
    }

}

class Infos{

    /* Klasse zur Abbildung einer LoP (Liste offener Punkte).
       Die infos enthält eine Liste mit Einträgen von Objekten der Klasse UserInfo
     */
    public liste:UserInfos[];    // Liste der eingetragenen Elemente
    private static stack: Infos[]=[]; // Stack aller Infos (im vorliegenden Fall ist nur
                                      // ein Element in diesem Stack enthalten

    constructor() {
        this.liste = [];
        Infos.stack.push(this);
    }

    public getInfos(id: number): UserInfos {
        let userInfo: UserInfos = undefined;
        for (let i of this.liste) {
            if (id === i.getID()) {
                 userInfo= i;
            }
        }
        return userInfo;
    }
}

class LogInfos {
    public name:string;
    public ware:string;
    public ort:string;
    public datum: Date;
    public status: number;


    constructor(name:string,ware:string,ort:string,datum:Date,status:number) {

        this.name=name;
        this.ware=ware;
        this.ort=ort;
        this.datum=datum
        this.status=status

    }

}


const logInfosFile_work: string = "log/db.json";
let currentInfos: Infos = new Infos();

fs.readFile(logInfosFile_work, "utf-8", (err, InfosData) => {
    // Einlesen der letzten aktuellen LoP -----------------------------------------
    if (err) {
        // Wenn die Datei nicht existiert, wird eine neue Liste angelegt
        currentInfos.liste = [];
    } else {
        // Wenn die Datei existiert, werden die JSON-Daten eingelesen und es wird
        // die letzte aktuelle LoP rekonstruiert.
        const infosDataJSON = JSON.parse(InfosData); // JSON aus den eingelesenen Daten
        for (let i of infosDataJSON) {
            // Aus dem JSON die LoP aufbauen
            currentInfos.liste.push(
                new UserInfos(i.name, i.ware,i.ort, new Date(i.datum), i.status));
        }
    }

});


server.get("/read", (req: express.Request, res: express.Response) => {
    // READ - Rückgabe der vollständigen LoP als HTML-tbody


    const loP_aktuellLength = currentInfos.liste.length;


    if (currentInfos === undefined) {
        res.status(404)
        res.send("LoP does not exist");

    } else {
        // Rendern der aktuellen LoP
        const html_tbody = renderLoP(currentInfos)
        res.status(200);
        res.send(html_tbody);
    }
});

function renderLoP(infos: Infos): string {
    // Aufbereitung der aktuellen LoP als HTML-tbody

    let html: string = "";
    for (let i in infos.liste) {
        // Ein Element der LoP wird nur ausgegeben, wenn sein Status auf aktiv (1) steht.
        if (infos.liste[i].getStatus() === 1) {
            let id = infos.liste[i].getID();
            let name = infos.liste[i].name;
            let ware = infos.liste[i].ware;
            let ort = infos.liste[i].ort;
            let datum = infos.liste[i].datum.toISOString().slice(0, 10);

            html +="<tr class='b-dot-line' data-user-id=" +id + ">"
            html += "<td class='click-value' data-purpose='user' data-user-id=" +id + ">" + name + "</td>";
            html += "<td class='click-value' data-purpose='ware'data-user-id=" +id + " >" + ware + "</td>";
            html += "<td class='click-value' data-purpose='ort' data-user-id=" +id + ">" + ort + "</td>";
            html += "<td class='click-value' data-purpose='datum' data-user-id=" +id + ">" + datum + "</td>";
            html += "<td >" + "<button data-purpose='edit' data-user-id=" + id + ">E</button>" + "</td>";
            html += "<td >" + "<button data-purpose='delete' data-user-id=" + id + ">X</button>" + "</td>";

            html +="</tr>";
        }
    }
    return html;
}


function sichern(infos:Infos, file: string):string{

    // Aufbau des JSONs mit der infos als Objekt der Klasse LogInfos
    const  logInfos:LogInfos[]=[];
    for(let i of currentInfos.liste){
        logInfos.push(new LogInfos(i.name,i.ware,i.ort,i.datum,i.getStatus()));
    }
    // Umwandeln des Objekts in einen JSON-String
    const logInfosJSON = JSON.stringify(logInfos);

    // Schreiben des JSON-Strings der LoP in die Datei mit dem Pfadnamen "file"
    fs.writeFileSync(file, logInfosJSON, (err) => {
        if (err) throw err;

    });
    return logInfosJSON;
}

server.get("/sichern", (req: express.Request, res: express.Response) => {

    // Sichern der aktuellen infos in die Datei db.json
    sichern(currentInfos, logInfosFile_work);

    res.status(200);
    res.send("Infos gesichert");

});

let username: string;   // currentUser

// CREATE
server.post("/create", (req: express.Request, res: express.Response) => {

    // Wert vom Client aus dem JSON entnehmen
    const name: string = String(req.body.name);
    const ware: string = String(req.body.ware);
    const ort: string = String(req.body.ort);
    const datum: Date = new Date(req.body.datum);
    username = name;



    currentInfos.liste.push(new UserInfos(name, ware,ort, datum, 1));


    sichern(currentInfos, logInfosFile_work);

    // Rendern der aktuellen LoP und Rückgabe des gerenderten Tabellenteils (tbody)
    const html_tbody = renderLoP(currentInfos)
    res.status(200);
    res.send(html_tbody);

});

function renderLoPChange(currentUser: UserInfos): string {
    // Aufbereitung des aktuellen Eintrags für die Änderungs-/Löschausgabe in
    // der zugehörigen Tabellenzeile

    let currentId = currentUser.getID();


    const html : string=

        "<td data-purpose='user' data-user-id="+ currentId+">" +
        "<input name='user' data-user-id="+ currentId+" type='text' value=" + currentUser.name +">"+
        "</td>"+
        "<td data-purpose='ware' data-user-id="+ currentId+">" +
        "<form >" +
        "<input  name='ware' class= 'as-width' type='text' value=" + currentUser.ware +">"+
        "<br>"+
        "<input class='as-button-0' data-purpose='ändern' data-user-id="+ currentId+" type='submit' value='ändern' >"+
        "<input class='as-button-0' data-purpose='zurück' data-user-id="+ currentId+" type='submit' value='zurück' >"+
        "<input class='as-button-0' data-purpose='löschen' data-user-id="+ currentId+" type='submit' value='löschen' >"+
        "</form>"+
        "</td>"+
        "<td data-purpose='ort' data-user-id="+ currentId+">" +
        "<input name='ort' type='text' value=" + currentUser.ort +">"+
        "</td>"+
        "<td data-purpose='datum' data-user-id="+ currentId+">" +
        "<input name='datum' type='text' value=" + (new Date().toISOString()).slice(0,10) + ">"+
        "</td>";

    return html;
}

server.post("/read", (req: express.Request, res: express.Response) => {
    // READ -Rückgabe der Tabellenzeile für ändern und löschen


    // Wert vom Client aus dem JSON entnehmen
    const id: number = Number(req.body.id);

    const currentUser = currentInfos.getInfos(id);


    if (currentInfos === undefined || currentUser.getStatus() !== 1) {
        res.status(404)
        res.send("Item " + id + " does not exist");

    } else {
        // Rendern der aktuellen LoP
        const html_change = renderLoPChange(currentUser);
        res.status(200);
        res.send(html_change);
    }
});


// DELETE - LoP-Eintrag aus der Liste löschen
server.post("/delete", (req: express.Request, res: express.Response) => {
    // Wert vom Client aus dem JSON entnehmen

    const id: number = Number(req.body.id);

    const user = currentInfos.getInfos(id);



    if (user === undefined || user.getStatus() !== 1) {
        res.status(404)
        res.send("Item " + id + " does not exist");
    } else {
        user.setStatus(2);

        // Sichern der aktuellen LoP in die Datei logLoPFile_work
        sichern(currentInfos, logInfosFile_work);

        // Rendern der aktuellen LoP und Rückgabe des gerenderten Tabellenteils (tbody)
        const html_tbody = renderLoP(currentInfos)
        res.status(200);
        res.send("Item " + id + " deleted");
    }
});


// UPDATE - LoP-Eintrag ändern
server.post("/update", (req: express.Request, res: express.Response) => {
    // Werte vom Client aus dem JSON entnehmen


    const id: number = Number(req.body.id);
    const name: string = String(req.body.name);
    const ware: string = String(req.body.ware);
    const  ort: string = String(req.body.ort);
    const datum: Date = new Date(req.body.datum);



    const user = currentInfos.getInfos(id);

    if (user === undefined || user.getStatus() !== 1) {
        res.status(404)
        res.send("Item " + id + " does not exist");
    } else {
        user.name = name;
        user.ware = ware;
        user.ort = ort;
        user.datum = datum;

        // Sichern der aktuellen LoP in die Datei logLoPFile_work
        sichern(currentInfos, logInfosFile_work);

        // Rendern der aktuellen LoP
        renderLoP(currentInfos)
        res.status(200);
        res.send("Item " + id + " changed");

    }
    // Rückgabe der Werte an den Client
});