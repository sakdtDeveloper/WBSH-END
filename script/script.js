var username; // aktuelle Bearbeiterperson
var statusCreate = 0; // Status des Eingabemodus: 0 = offen, 1 = eingeben, 2 = ändern
//333333333333333333333333333333333333333333333333333333333333333333333
function renderInfos() {
    /*
     * Ausgabe der aktuellen LoP und Abschluss ausstehender Nutzer-Interaktionen.
     * Alle Eingabefelder in der LoP-Tabelle werden gelöscht.
     */
    // XMLHttpRequest aufsetzen und absenden ----------------------------------
    var request = new XMLHttpRequest();
    var html = "";
    // Request starten
    request.open('GET', 'read');
    request.send();
    request.onload = function (event) {
        // Eventhandler für das Lesen der aktuellen Tabelle vom Server
        if (request.status === 200) { // Erfolgreiche Rückgabe
            html = request.response;
            document.getElementById("shopping-tbody").innerHTML = html;
            statusCreate = 0; // Der Status 0 gibt die Bearbeitung aller Events frei.
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
    username = document.getElementById("user-name").value;
    // Freigabe der LoP-Ausgabe im HTML-Dokument
    document.getElementById("ausgabe").classList.remove("unsichtbar");
    document.getElementById("create-save-user").classList.remove("unsichtbar");
    // Lesen der aktuellen Tabelle vom Server und Ausgabe in lop-tbody
    renderInfos();
}
//555555555555555555555555555555555555555555555555555555
function neuOrSichern(event) {
    event.preventDefault();
    var command = event.submitter.value;
    if (command === "neu") {
        if (statusCreate === 0) {
            statusCreate = 1; // Der Status 1 sperrt die Bearbeitung anderer Events, die nicht zur
            // Eingabe des neuen Users gehören
            var html = "<tr class='b-dot-line' data-user-id=" + undefined + " > " +
                "<td data-purpose='user' data-user-id=" + undefined + ">" +
                "<input name='user' readonly data-user-id=" + undefined + " type='text' value=" + username + ">" +
                "</td>" +
                "<td data-purpose='ware' data-user-id=" + undefined + ">" +
                "<form >" +
                "<input  name='ware' class= 'as-width' type='text' placeholder='Was?'>" +
                "<br>" +
                "<input class='as-button-0' data-purpose='speichern' data-user-id=" + undefined + " type='submit' value='speichern' >" +
                "<input class='as-button-0' data-purpose='zurück' data-user-id=" + undefined + " type='submit' value='zurück' >" +
                "</form>" +
                "</td>" +
                "<td data-purpose='ort' data-user-id=" + undefined + ">" +
                "<input name='ort' type='text' placeholder='Wo?'>" +
                "</td>" +
                "<td data-purpose='datum' data-user-id=" + undefined + ">" +
                "<input name='datum' readonly type='text' value=" + (new Date().toISOString()).slice(0, 10) + ">" +
                "</td>" +
                "</tr>";
            var tbody = document.getElementById("shopping-tbody").innerHTML;
            document.getElementById("shopping-tbody").innerHTML = html + tbody;
        }
    }
    if (command === "sichern") {
        // XMLHttpRequest aufsetzen und absenden
        var request_1 = new XMLHttpRequest();
        // Request starten
        request_1.open('GET', 'sichern');
        request_1.send();
        request_1.onload = function (event) {
            // Eventhandler für das Lesen der aktuellen Tabellenzeile zum Ändern oder Löschen
            // vom Server
            if (request_1.status === 200) { // Erfolgreiche Rückgabe
                renderInfos();
            }
            else { // Fehlermeldung vom Server
                console.log("Fehler bei der Übertragung", request_1.status);
            }
        };
    }
    else {
        // Click ins Nirgendwo
        console.log("function aufgabe -> ?"); // Debug
    }
}
//77777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
function createUpdateDelete(event) {
    event.preventDefault();
    var command = event.target.getAttribute("data-purpose");
    var idSelect = event.target.getAttribute("data-user-id");
    if (command === "zurück") {
        renderInfos();
    }
    else if (command === "speichern") {
        // Der Status 1 sperrt die Bearbeitung anderer Events, die nicht zur
        // Eingabe des neuen Users gehören
        if (statusCreate === 1) {
            var currentWare = event.target.parentElement[0].value;
            var currentOrt = event.target.parentElement.parentElement.nextSibling.childNodes[0].value;
            if (currentWare === "" || currentOrt === "") {
                // Wenn keine Ware oder keinen Ort angegeben wurde, wird die Erzeugung des Eintrags abgebrochen.
                renderInfos();
            }
            else {
                var currentName = event.target.parentElement.parentElement.previousSibling.childNodes[0].value;
                var currentDatum = event.target.parentElement.parentElement.nextSibling.nextSibling.childNodes[0].value;
                // XMLHttpRequest aufsetzen und absenden
                var request_2 = new XMLHttpRequest();
                // Request starten
                request_2.open('POST', 'create');
                request_2.setRequestHeader('Content-Type', 'application/json');
                request_2.send(JSON.stringify({
                    "name": currentName,
                    "ware": currentWare,
                    "ort": currentOrt,
                    "datum": new Date(currentDatum),
                    "status": 1
                }));
                request_2.onload = function (event) {
                    // Eventhandler das Lesen der aktuellen Tabelle vom Server
                    if (request_2.status === 200) { // Erfolgreiche Rückgabe
                        renderInfos();
                    }
                    else { // Fehlermeldung vom Server
                        console.log("Fehler bei der Übertragung", request_2.status);
                    }
                };
                renderInfos();
            }
        }
    }
    else if (command === "user" || command === "ware" || command === "ort" || command === "datum" || command === "edit") {
        if (statusCreate === 0) {
            // Der Status 2 sperrt die Bearbeitung anderer Events, die nicht zur
            // Bearbeitung der Änderung des Users gehören
            statusCreate = 2;
            var parent_1 = event.target.parentElement;
            var gparent_1 = event.target.parentElement.parentElement;
            var currentId = Number(event.target.getAttribute('data-user-id'));
            // XMLHttpRequest aufsetzen und absenden
            var request_3 = new XMLHttpRequest();
            request_3.open('POST', 'read');
            request_3.setRequestHeader('Content-Type', 'application/json');
            request_3.send(JSON.stringify({
                "id": currentId
            }));
            request_3.onload = function (event) {
                // Eventhandler für das Lesen der aktuellen Tabellenzeile zum Ändern oder Löschen
                // vom Server
                if (request_3.status === 200) { // Erfolgreiche Rückgabe
                    var html = request_3.response;
                    if (command === "edit") {
                        gparent_1.innerHTML = html;
                    }
                    else {
                        parent_1.innerHTML = html;
                    }
                }
                else { // Fehlermeldung vom Server
                    console.log("Fehler bei der Übertragung", request_3.status);
                }
            };
        }
    }
    else if (command === "löschen" || command === "delete") {
        if (statusCreate === 2) {
            var currentId = Number(event.target.getAttribute('data-user-id'));
            // XMLHttpRequest aufsetzen und absenden
            var request_4 = new XMLHttpRequest();
            request_4.open('POST', 'delete');
            request_4.setRequestHeader('Content-Type', 'application/json');
            request_4.send(JSON.stringify({
                "id": currentId
            }));
            request_4.onload = function (event) {
                // Eventhandler für das Lesen der aktuellen Tabellenzeile zum Ändern oder Löschen
                // vom Server
                if (request_4.status === 200) { // Erfolgreiche Rückgabe
                    renderInfos();
                }
                else { // Fehlermeldung vom Server
                    console.log("Fehler bei der Übertragung", request_4.status);
                }
            };
        }
    }
    else if (command === "ändern") {
        if (statusCreate === 2) {
            var currentWare = event.target.parentElement[0].value;
            var currentOrt = event.target.parentElement.parentElement.nextSibling.childNodes[0].value;
            var currentName = event.target.parentElement.parentElement.previousSibling.childNodes[0].value;
            var currentDatum = event.target.parentElement.parentElement.nextSibling.nextSibling.childNodes[0].value;
            if (currentWare === '' || currentName === '' || currentOrt === '' || currentDatum === '') {
                renderInfos();
            }
            else {
                var currentId = Number(event.target.getAttribute('data-user-id'));
                // XMLHttpRequest aufsetzen und absenden
                var request_5 = new XMLHttpRequest();
                // Request starten
                request_5.open('POST', 'update');
                request_5.setRequestHeader('Content-Type', 'application/json');
                request_5.send(JSON.stringify({
                    "id": currentId,
                    "name": currentName,
                    "ware": currentWare,
                    "ort": currentOrt,
                    "datum": new Date(currentDatum)
                }));
                request_5.onload = function (event) {
                    // Eventhandler das Lesen der aktuellen Tabelle vom Server
                    if (request_5.status === 200) { // Erfolgreiche Rückgabe
                        renderInfos();
                    }
                    else { // Fehlermeldung vom Server
                        console.log("Fehler bei der Übertragung", request_5.status);
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
document.addEventListener("DOMContentLoaded", function () {
    /* Warten bis der DOM des HTML-Dokuments aufgebaut ist. Danach wird die
       Funktionalität der Website gestartet und  die "Callbacks" initialisiert.
    */
    //111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
    document.getElementById("eingabe-user").addEventListener("submit", function (event) {
        /* Nach der Eingabe des Bearbeiternamens wird die Tabelle aufgebaut
         */
        init(event);
    });
    //444444444444444444444444444444444444444444444444444444444444444444444
    document.getElementById("create-save-user").addEventListener("submit", function (event) {
        neuOrSichern(event);
    });
    //6666666666666666666666666666666666666666666666666666666666666666666666666666666
    document.getElementById("shopping-tbody").addEventListener("click", function (event) {
        createUpdateDelete(event);
    });
});
