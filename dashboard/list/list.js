// Markierungen im Graphen hinzufügen oder entfernen, wenn sich eine Checkbox verändert
$("body").on("change", "input:checkbox", function(){
    if($(this).prop('checked')){
        //ID des Listeneintrags bestimmen. Diese ist gleich der TweetID
        const child = $(this).parent().parent().parent().parent();
        const childID = child.attr("id");
        // Markierung des zugehörigen Knoten (Kreis und Text) entfernen
        const nodes = document.getElementsByClassName("nodes")[0].children;
        for (i = 0; i < nodes.length; i++){
            if(nodes[i].getAttribute('id') === childID){
                d3.select(nodes[i]).select('circle').attr("stroke", '#212529');
                d3.select(nodes[i]).append('text')
                    .text(function(d) {
                        return d.username;
                    })
                    .attr('x', 6)
                    .attr('y', 3);
            }
        }
    } else {
        //ID des Listeneintrags bestimmen. Diese ist gleich der TweetID
        const child = $(this).parent().parent().parent().parent();
        const childID = child.attr("id");
        // Markierung des zugehörigen Knoten (Kreis und Text) entfernen
        const nodes = document.getElementsByClassName("nodes")[0].children;
        for (i = 0; i < nodes.length; i++){
            if(nodes[i].getAttribute('id') === childID){
                d3.select(nodes[i]).select('circle').attr("stroke", '#fff');
                d3.select(nodes[i]).select('text').remove();
            }
        }
    }
});


function createList(){
    /*
    Graph muss gezeichnet sein, um Liste leeren zu können,
    da hierbei die Markierungen im Graph entfernt werden
    */
    if(document.getElementById('graph').children.length === 0)
        draw();

    // Liste muss nur geleert werden, wenn sie Einträge hat
    if(document.getElementById('listgroup1').children.length !== 0)
        clearList();

    // Daten aus dem Backend einlesen
    $.get("http://localhost:3000/tweets", function(data){
        const res = JSON.parse(data);
        const nodes = res.nodes;

        // nach Anzahl Verbindungen absteigend sortieren
        nodes.sort(function(a, b) {
            return b.degree - a.degree;
        });

        //die 50 Tweets mit den meisten Verbindungen werden in die Liste aufgenommen
        for(i = 0; (i < nodes.length - 1 && i < 50); i++){
            createListGroupItem(nodes[i], '#listgroup1');
        }
    });
}

// Listeneintrag erstellen
function createListGroupItem(node, listgroup){

    let newItem = true;
    /*
    Prüfen, ob es schon einen Listeneintrag mit der ID gibt.
    Nur für Listgroup2, da dort dynamisches Hinzufügen und Entfernen
     */
    if (listgroup === '#listgroup2'){
        const listItems = document.getElementById("listgroup2").children;
        for(i = 0; i < listItems.length; i++){
            if(listItems[i].getAttribute('id') === node.id){
                newItem = false;
            }
        }
    }

    if(newItem){
        let listGroupItem = "<div class='list-group-item flex-column align-items-start' id ='" + node.id + "'>" +
            "<div class='d-flex w-100 justify-content-between' style='padding-bottom: 10px'>" +
            "<h5 class='mb-1'>Username: " + node.username + "</h5> " +
            "<small class='text-muted'>" + node.created_at + "</small> ";

        /*
        Möglichkeit den Eintrag zu entfernen nur für die ausgewählten Tweets.
        Möglichkeit den Knoten zu markieren nur für die relevanten Tweets.
         */
        if (listgroup === '#listgroup2'){
            listGroupItem = listGroupItem + "<button type='button' class='close' aria-label='Close' onclick='deleteListItem()'><span aria-hidden='true'>&times;</span></button>";
        } else {
            listGroupItem = listGroupItem + "<div class='checkbox'><label><input type='checkbox' > Markiert</label></div>";
        }

        listGroupItem = listGroupItem +"</div><div class='row'>" +
            "<div class='col-11'>" +
            "<p >" + node.text + "</p> " +
            "</div></div>" +
            "<div class='row'>" +
            "<div class='col-6'><p>Allgemeine Informationen: </p></div>" +
            "<div class='col-2'><p>Sentiment: <span style='font-weight: bold;'>" + node.sentiment + "</span></p></div> " +
            "<div class='col-2'><p>Retweets: <span style='font-weight: bold;'>" + node.retweets + "</span></p></div> " +
            "<div class='col-2'><p>Favoriten: <span style='font-weight: bold;'>" + node.favorites + "</span></p></div> " +
            "</div>" +
            "<div class='row'>" +
            "<div class='col-6'><p>Informationen aus dem Graph: </p></div> " +
            "<div class='col-2'><p>Verbindungen: <span style='font-weight: bold;'>" + node.degree + "</span></p></div>" +
            "<div class='col-2'><p>In-Degree: <span style='font-weight: bold;'>" + node.indegree + "</span></p></div>" +
            "<div class='col-2'><p>Out-Degree: <span style='font-weight: bold;'>" + node.outdegree + "</span></p></div>" +
            "</div>" +
            "<small><a href='" + node.url + "' target='_blank'>" + node.url + "</a></small>" +
            "</div>";

        $(listgroup).append(listGroupItem);

        // Listeneintrag erfolgreich erstellt
        return true;
    } else
        // Listeneintrag bereits vorhanden
        return false;
}

// ausgewählten Listeneintrag löschen
function deleteListItem(){
    const parent = document.activeElement.parentElement.parentElement.parentElement;
    const child = document.activeElement.parentElement.parentElement;
    parent.removeChild(child);
}

// listgroup1 leeren und MArkierungen entfernen
function clearList() {
    const listItems = document.getElementById('listgroup1').children;
    const nodes = document.getElementsByClassName("nodes")[0].children;

    // Knotenmarkierungen entfernen.
    for(j = 0; j < listItems.length; j++){
        for (i = 0; i < nodes.length; i++){
            if(listItems[j].getAttribute('id') === nodes[i].getAttribute('id')){
                d3.select(nodes[i]).select('circle').attr("stroke", '#fff');
                d3.select(nodes[i]).select('text').remove();
            }
        }
    }

    $('#listgroup1').empty();
}

// listgroup2 leeren
function clearlistgroup2() {
    $('#listgroup2').empty();
}
