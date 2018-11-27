function createList(){

    $("#listgroup1").empty();

    $.get("http://localhost:3000/tweets", function(data){
        const res = JSON.parse(data);
        const nodes = res.nodes;
        const links = res.links;

        // nach Anzahl Verbindungen sortieren
        nodes.sort(function(a, b) {
            return b.degree - a.degree;
        });


        for(i = 0; (i < nodes.length - 1 && i < 50); i++){
            createListGroupItem(nodes[i], '#listgroup1');
        }
    });
}


function createListGroupItem(node, listgroup){

    let listGroupItem = "<div class='list-group-item flex-column align-items-start' id ='" + node.id + "'>" +
        "<div class='d-flex w-100 justify-content-between' style='padding-bottom: 10px'>" +
        "<h5 class='mb-1'>Username: " + node.username + "</h5> " +
        "<small class='text-muted'>" + node.created_at + "</small> ";

    if (listgroup === '#listgroup2'){
        listGroupItem = listGroupItem + "<button type='button' class='close' aria-label='Close' onclick='deleteListItem()'><span aria-hidden='true'>&times;</span></button>";
    }

    listGroupItem = listGroupItem + "</div><div class='row'>" +
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
        "<small><a href='" + node.url + "'>" + node.url + "</a></small>" +
        "</div>";

    $(listgroup).append(listGroupItem);

}

/*
function labelNode(tweetid){
    const nodes = document.getElementsByClassName("nodes")[0].children;
    console.log(nodes);
    console.log(nodes[0].getAttribute('id'));

    for (i = 0; i < nodes.length; i++){
        if(nodes[i].getAttribute('id') === tweetid){
            nodes[i].children[0].style.stroke =  "#fff"
        }
    }
}
*/


function deleteListItem(){
    const parent = document.activeElement.parentElement.parentElement.parentElement;
    const child = document.activeElement.parentElement.parentElement;
    const childID = child.getAttribute('id');
    parent.removeChild(child);

    const nodes = document.getElementsByClassName("nodes")[0].children;

    for (i = 0; i < nodes.length; i++){
        if(nodes[i].getAttribute('id') === childID){
            nodes[i].children[0].style.stroke =  "#fff";
            const text = nodes[i].children[1];
            nodes[i].removeChild(text);
        }
    }

}


function clearList() {
    $("#listgroup2").empty();

    const nodes = document.getElementsByClassName("nodes")[0].children;

    for (i = 0; i < nodes.length; i++){
        nodes[i].children[0].style.stroke = "#fff";

        if(nodes[i].children[1] !== undefined){
            const text = nodes[i].children[1];
            nodes[i].removeChild(text);
        }
    }
}