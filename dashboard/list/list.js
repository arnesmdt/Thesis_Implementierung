function createList(){
    $.get("http://localhost:3000/tweets", function(data){
        const res = JSON.parse(data);
        const nodes = res.nodes;
        const links = res.links;

        // nach Anzahl Retweets sortieren
        nodes.sort(function(a, b) {
            return a.retweets - b.retweets;
        });

        for(i = nodes.length - 1; (i > (nodes.length - 11) && (nodes.length - 11) > 0); i--){

            const indegree = res.links.filter(function (links) {
                return links.target === nodes[i].id;
            }).length;

            const outdegree = res.links.filter(function (links) {
                return links.source === nodes[i].id;
            }).length;


            createListGroupItem(nodes[i].username, nodes[i].text, nodes[i].sentiment, nodes[i].retweets, nodes[i].favorites, indegree, outdegree, nodes[i].url);
        }




    });
}

function createListGroupItem(username, text, sentiment, retweets, favorites, indegree, outdegree, url){
    $('#listgroup').append("<div class='list-group-item flex-column align-items-start'>" +
        "<div class='d-flex w-100 justify-content-between'>" +
        "<h5 class='mb-1'>Username: " + username + "</h5> " +
        "<small class='text-muted'>25.11.2018</small></div> " +
        "<p >" + text + "</p> " +
        "<p></p>" +
        "<div class='row'>" +
        "<div class='col-6'><p>Allgemeine Informationen: </p></div>" +
        "<div class='col-2'><p>Sentiment: <span style='font-weight: bold;'>" + sentiment + "</span></p></div> " +
        "<div class='col-2'><p>Retweets: <span style='font-weight: bold;'>" + retweets + "</span></p></div> " +
        "<div class='col-2'><p>Favoriten: <span style='font-weight: bold;'>" + favorites + "</span></p></div> " +
        "</div>" +
        "<div class='row'>" +
        "<div class='col-6'><p>Informationen aus dem Graph: </p></div> " +
        "<div class='col-2'><p>Verbindungen: <span style='font-weight: bold;'>" + (indegree + outdegree) + "</span></p></div>" +
        "<div class='col-2'><p>In-Degree: <span style='font-weight: bold;'>" + indegree + "</span></p></div>" +
        "<div class='col-2'><p>Out-Degree: <span style='font-weight: bold;'>" + outdegree + "</span></p></div>" +
        "</div>" +
        "<small><a href='" + url + "'>" + url + "</a></small>" +
        "</div>");
}