
let username: string; // aktuelle Bearbeiterperson
let statusCreate: number = 0; // Status des Eingabemodus: 0 = offen, 1 = eingeben, 2 = ändern

//333333333333333333333333333333333333333333333333333333333333333333333
function renderInfos() {
    /*
     * Ausgabe der aktuellen LoP und Abschluss ausstehender Nutzer-Interaktionen.
     * Alle Eingabefelder in der LoP-Tabelle werden gelöscht.
     */

    // XMLHttpRequest aufsetzen und absenden ----------------------------------
    const request = new XMLHttpRequest();

    let html:string="";

    // Request starten
    request.open('GET', 'read');
    request.send();

    request.onload=(event)=>{

        // Eventhandler für das Lesen der aktuellen Tabelle vom Server
        if (request.status === 200) { // Erfolgreiche Rückgabe
            html = request.response;


            document.getElementById("shopping-tbody").innerHTML=html

            statusCreate = 0;  // Der Status 0 gibt die Bearbeitung aller Events frei.
            // Die ausgegebene Tabelle im Browser entspricht jetzt dem aktuellen
            // Stand.
        }
        else {
            console.log("Fehler bei der Übertragung", request.status);
        }
    };

}









//2222222222222222222222222222222222222222222222222222222222

function init(event) {
    /* Aufbau der Tabelle nach der Eingabe des Bearbeiters
     */
    event.preventDefault();
    username = (document.getElementById("user-name") as HTMLInputElement).value;


    // Freigabe der LoP-Ausgabe im HTML-Dokument
    document.getElementById("ausgabe").classList.remove("unsichtbar");
    document.getElementById("create-save-user").classList.remove("unsichtbar");

    // Lesen der aktuellen Tabelle vom Server und Ausgabe in lop-tbody
    renderInfos();

}

//555555555555555555555555555555555555555555555555555555
function  neuOrSichern(event){


    event.preventDefault();

    const command = event.submitter.value;

    if (command === "neu") {
        if(statusCreate===0){
            statusCreate=1; // Der Status 1 sperrt die Bearbeitung anderer Events, die nicht zur
            // Eingabe des neuen Users gehören

            const html:string=
                "<tr class='b-dot-line' data-user-id="+ undefined+" > " +
                "<td data-purpose='user' data-user-id="+ undefined+">" +
                "<input name='user' readonly data-user-id="+ undefined+" type='text' value=" + username +">"+
                "</td>"+
                "<td data-purpose='ware' data-user-id="+ undefined+">" +
                "<form >" +
                "<input  name='ware' class= 'as-width' type='text' placeholder='Was?'>"+
                "<br>"+
                "<input class='as-button-0' data-purpose='speichern' data-user-id="+ undefined+" type='submit' value='speichern' >"+
                "<input class='as-button-0' data-purpose='zurück' data-user-id="+ undefined+" type='submit' value='zurück' >"+
                "</form>"+
                "</td>"+
                "<td data-purpose='ort' data-user-id="+ undefined+">" +
                "<input name='ort' type='text' placeholder='Wo?'>"+
                "</td>"+
                "<td data-purpose='datum' data-user-id="+ undefined+">" +
                "<input name='datum' readonly type='text' value=" + (new Date().toISOString()).slice(0,10) + ">"+
                "</td>"+
                "</tr>";

            const tbody= (document.getElementById("shopping-tbody") as HTMLElement).innerHTML;
            document.getElementById("shopping-tbody").innerHTML=html +tbody

        }
    }
    if(command === "sichern"){

        // XMLHttpRequest aufsetzen und absenden
        const request = new XMLHttpRequest();

        // Request starten
        request.open('GET', 'sichern');
        request.send()

        request.onload = (event) => {
            // Eventhandler für das Lesen der aktuellen Tabellenzeile zum Ändern oder Löschen
            // vom Server
            if (request.status === 200) { // Erfolgreiche Rückgabe

                renderInfos();

            } else { // Fehlermeldung vom Server
                console.log("Fehler bei der Übertragung", request.status);

            }
        };

    } else {
        // Click ins Nirgendwo
        console.log("function aufgabe -> ?"); // Debug

    }

}


//77777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
function createUpdateDelete(event) {

    event.preventDefault();

    const command = event.target.getAttribute("data-purpose");
    const idSelect = event.target.getAttribute("data-user-id");

    if (command === "zurück") {
        renderInfos()
    }
    else if (command === "speichern") {

        // Der Status 1 sperrt die Bearbeitung anderer Events, die nicht zur
        // Eingabe des neuen Users gehören
        if (statusCreate === 1) {

            const currentWare = event.target.parentElement[0].value;
            const currentOrt = event.target.parentElement.parentElement.nextSibling.childNodes[0].value;

            if (currentWare === "" || currentOrt === "") {
                // Wenn keine Ware oder keinen Ort angegeben wurde, wird die Erzeugung des Eintrags abgebrochen.
                renderInfos();
            } else {
                const currentName = event.target.parentElement.parentElement.previousSibling.childNodes[0].value;
                const currentDatum = event.target.parentElement.parentElement.nextSibling.nextSibling.childNodes[0].value;

                // XMLHttpRequest aufsetzen und absenden
                const request = new XMLHttpRequest();

                // Request starten
                request.open('POST', 'create');
                request.setRequestHeader('Content-Type', 'application/json');
                request.send(JSON.stringify(
                    {
                        "name": currentName,
                        "ware": currentWare,
                        "ort": currentOrt,
                        "datum": new Date(currentDatum),
                        "status": 1
                    })
                );

                request.onload = (event) => {
                    // Eventhandler das Lesen der aktuellen Tabelle vom Server
                    if (request.status === 200) { // Erfolgreiche Rückgabe
                        renderInfos();

                    } else { // Fehlermeldung vom Server
                        console.log("Fehler bei der Übertragung", request.status);

                    }
                };

                renderInfos();
            }
        }
    }else if (command === "user" || command === "ware" || command === "ort" || command === "datum" || command === "edit") {

            if (statusCreate === 0) {
                // Der Status 2 sperrt die Bearbeitung anderer Events, die nicht zur
                // Bearbeitung der Änderung des Users gehören
                statusCreate = 2;


                const parent = event.target.parentElement;
                const gparent = event.target.parentElement.parentElement;
                const currentId = Number(event.target.getAttribute('data-user-id'));

                // XMLHttpRequest aufsetzen und absenden
                const request = new XMLHttpRequest();

                request.open('POST', 'read');
                request.setRequestHeader('Content-Type', 'application/json');
                request.send(JSON.stringify(
                    {
                        "id": currentId
                    })
                );

                request.onload = (event) => {
                    // Eventhandler für das Lesen der aktuellen Tabellenzeile zum Ändern oder Löschen
                    // vom Server
                    if (request.status === 200) { // Erfolgreiche Rückgabe

                        const html = request.response;


                        if (command === "edit") {
                            gparent.innerHTML = html;



                        } else {
                            parent.innerHTML = html;
                        }

                    } else { // Fehlermeldung vom Server
                        console.log("Fehler bei der Übertragung", request.status);

                    }
                };

            }

        } else if ( command === "löschen" || command === "delete" ) {



        if (statusCreate === 2) {



         const currentId=Number(event.target.getAttribute('data-user-id'))

            // XMLHttpRequest aufsetzen und absenden
            const request = new XMLHttpRequest();


            request.open('POST', 'delete');
            request.setRequestHeader('Content-Type', 'application/json');
            request.send(JSON.stringify(
                {
                    "id": currentId
                })
            );


            request.onload = (event) => {
                // Eventhandler für das Lesen der aktuellen Tabellenzeile zum Ändern oder Löschen
                // vom Server
                if (request.status === 200) { // Erfolgreiche Rückgabe


                    renderInfos()

                } else { // Fehlermeldung vom Server
                    console.log("Fehler bei der Übertragung", request.status);

                }
            };

        }

        }

    else if(command=== "ändern" ){

        if(statusCreate===2) {

            const currentWare = event.target.parentElement[0].value;
            const currentOrt = event.target.parentElement.parentElement.nextSibling.childNodes[0].value;
            const currentName = event.target.parentElement.parentElement.previousSibling.childNodes[0].value;
            const currentDatum = event.target.parentElement.parentElement.nextSibling.nextSibling.childNodes[0].value;


            if(currentWare===''||currentName===''||currentOrt===''||currentDatum===''){
              renderInfos();
            }
            else{
                const currentId=Number(event.target.getAttribute('data-user-id'))

                // XMLHttpRequest aufsetzen und absenden
                const request = new XMLHttpRequest();

                // Request starten
                request.open('POST', 'update');
                request.setRequestHeader('Content-Type', 'application/json');
                request.send(JSON.stringify(
                    {
                        "id": currentId,
                        "name": currentName,
                        "ware": currentWare,
                        "ort": currentOrt,
                        "datum": new Date(currentDatum)
                    })
                );

                request.onload = (event) => {
                    // Eventhandler das Lesen der aktuellen Tabelle vom Server
                    if (request.status === 200) { // Erfolgreiche Rückgabe
                        renderInfos();

                    } else { // Fehlermeldung vom Server
                        console.log("Fehler bei der Übertragung", request.status);

                    }
                };
            }
        }
    }
    else {
        // Clicks ins Nirgendwo -------------------------------------------------------------------
         console.log("function  createUpdateDelete -> ?"); // Debug
    }



}










document.addEventListener("DOMContentLoaded", () => {
    /* Warten bis der DOM des HTML-Dokuments aufgebaut ist. Danach wird die
       Funktionalität der Website gestartet und  die "Callbacks" initialisiert.
    */

//111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
    document.getElementById("eingabe-user").addEventListener("submit", (event) => {
        /* Nach der Eingabe des Bearbeiternamens wird die Tabelle aufgebaut
         */

        init(event);
    });

    //444444444444444444444444444444444444444444444444444444444444444444444
    document.getElementById("create-save-user").addEventListener("submit", event => {

        neuOrSichern(event);
    });


    //6666666666666666666666666666666666666666666666666666666666666666666666666666666
    document.getElementById("shopping-tbody").addEventListener("click", (event) => {


        createUpdateDelete(event);
    })
});