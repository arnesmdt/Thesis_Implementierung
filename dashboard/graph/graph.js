// Graph leeren und neu erstellen
function draw(){
    // bei allen checkbocken markierung entfernen
    $("input:checkbox", "#listgroup1").attr('checked',false);

    //Graph leeren
    $("#graph").empty();

    $.get("http://localhost:3000/tweets", function(data){
        const res = JSON.parse(data);

        const nodes = res.nodes;

        let checkRetweet, checkReply, checkQoute, checkAuthor = '';

        if(document.getElementById("checkboxRetweet").checked){
            checkRetweet = 'retweet'
        }
        if(document.getElementById("checkboxReply").checked){
            checkReply = 'reply'
        }
        if(document.getElementById("checkboxQoute").checked){
            checkQoute = 'quote'
        }
        if(document.getElementById("checkboxAuthor").checked){
            checkAuthor = 'author'
        }

        const links_filter = res.links.filter(function (links) {
            return links.type === checkRetweet || links.type === checkReply || links.type === checkQoute || links.type === checkAuthor;
        });


        let checkPositiv, checkNegativ, checkNeutral = false;

        if(document.getElementById("checkboxPositiv").checked){
            checkPositiv = true;
        }
        if(document.getElementById("checkboxNegativ").checked){
            checkNegativ = true;
        }
        if(document.getElementById("checkboxNeutral").checked){
            checkNeutral = true;
        }

        const nodes_filter= [];
        const linksAsString = JSON.stringify(links_filter);

        nodes.forEach(function (node) {
            if (node.sentiment > 0 && !checkPositiv) {
                node['sentiment'] = 1000;
            } else if (node.sentiment < 0 && !checkNegativ) {
                node['sentiment'] = 1000;
            } else if (node.sentiment === 0 && !checkNeutral) {
                node['sentiment'] = 1000;
            }

            //Einzelne Knoten miteinbeziehen bzw. ignorieren
            if (document.getElementById("seperateNodes").value === "0"){
                if (linksAsString.includes(node.id.toString())){
                    nodes_filter.push(node);
                }
            } else{
                nodes_filter.push(node);
            }
        });

        startSimulation(nodes_filter, links_filter);
    });
}