function draw(){
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
            checkPositiv = true; //2
        }
        if(document.getElementById("checkboxNegativ").checked){
            checkNegativ = true; //1
        }
        if(document.getElementById("checkboxNeutral").checked){
            checkNeutral = true; //3
        }

        nodes.forEach(function (node) {
            if (node.group === 2 && !checkPositiv) {
                node['group'] = 0;
            } else if (node.group === 1 && !checkNegativ) {
                node['group'] = 0;
            } else if (node.group === 3 && !checkNeutral) {
                node['group'] = 0;
            }
        });

        startSimulation(nodes, links_filter);

    });
}

function startSimulation(nodes, links){
    const svg = d3.select("body").select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    const color = d3.scaleOrdinal(d3.schemeCategory20);

    const simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) {
            return d.id;
        }))
        .force("charge", d3.forceManyBody().distanceMax(150)) //.strength(-500).distanceMax(30).distanceMin(20)
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("stroke-width", function (link) {
            return Math.sqrt(link.value);
        });

    const node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(nodes)
        .enter().append("g");


    // Popup wird beim über den Knoten Wischen angezeigt
    node.each(function (n) {
        // make node focusable, wird nur bei trigger: focus benötigt
        $(this).attr('tabindex', -1);
        $(this).popover({
            html : true,
            title: "Tweet-ID: " + n.id,
            content: "<b>Username:</b></br>" + n.username +
                     "</br><b>Anzahl Retweets:</b></br>" + n.retweets +
                     "</br><b>Anzahl Favoriten:</b></br>" + n.favorites ,
            trigger:"hover" // "focus"
        });
    });

    // Bei Doppelklick auf Knoten Link öffnen
    node.on('dblclick' , function(node){
        window.open(node.url, '_blank');
    });

    const circles = node.append("circle")
        .attr("r", 5)
        .attr("fill", function (d) {
                if (d.group === 1)
                    return "crimson";
                else if (d.group === 2)
                    return "ForestGreen";
                else if (d.group === 3)
                    return "DarkOrange";
                else
                    return "Gainsboro";
            }
        )
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));


    simulation
        .nodes(nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(links);

    function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
    }


    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}