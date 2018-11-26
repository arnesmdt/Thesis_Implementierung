function createList(){

    $("#listgroup").empty();

    $.get("http://localhost:3000/tweets", function(data){
        const res = JSON.parse(data);
        const nodes = res.nodes;
        const links = res.links;

        // nach Anzahl Retweets sortieren
        nodes.sort(function(a, b) {
            return b.degree - a.degree;
        });


        for(i = 0; (i < nodes.length - 1 && i < 50); i++){
            createListGroupItem(nodes[i]);
        }

        /*
        nodes.forEach(function (node) {
            createListGroupItem(node);
        });
        */
    });
}

function createListGroupItem(node){
    $('#listgroup').append("<div class='list-group-item flex-column align-items-start'>" +
        "<div class='d-flex w-100 justify-content-between'>" +
        "<h5 class='mb-1'>Username: " + node.username + "</h5> " +
        "<small class='text-muted'>" + node.created_at + "</small></div> " +
        "<p >" + node.text + "</p> " +
        "<p></p>" +
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
        "<small><a href='" + node.url + "'>" + node.url + "</a></small>" +
        "</div>");
}