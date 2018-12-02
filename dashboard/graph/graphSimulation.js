
function startSimulation(nodes, links){
    const svg = d3.select("body").select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    const simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) {return d.id;})) //.distance(20).strength(0.1)
        .force("charge", d3.forceManyBody().distanceMax(100)) //.strength(-500).distanceMax(30).distanceMin(20)
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("stroke-width", Math.sqrt(5))
        .attr("stroke", function (link) {
            if (link.value === 1) // Retweet
                return "MIDNIGHTBLUE";
            else if (link.value === 2) // Reply
                return "MEDIUMSLATEBLUE";
            else if (link.value === 3) // Quote
                return "DEEPSKYBLUE";
            else if (link.value === 4) // autor
                return "LIGHTBLUE";
            else
                return "DIMGRAY";
        });

    const node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(nodes)
        .enter().append("g");

    // Popup wird beim über den Knoten Wischen angezeigt und Knoten bekommt eine id eingetragen
    node.each(function (n) {
        // make node focusable, wird nur bei trigger: focus benötigt
        $(this).attr('tabindex', -1);
        $(this).attr("id", n.id);
        $(this).popover({
            html : true,
            title: "Tweet-ID: " + n.id,
            content: "<b>Username:</b></br>" + n.username +
                     "</br><b>Text:</b></br>" + n.text +
                     "</br><b>Anzahl Retweets:</b></br>" + n.retweets +
                     "</br><b>Wert des Sentiments:</b></br>" + n.sentiment ,
            trigger:"hover" // "focus"
        });
    });

    const radius = 5;

    const circles = node.append("circle")
        .attr("r", radius)
        .attr("fill", function (node) {
                if (node.value === 1)
                    return "crimson";
                else if (node.value === 2)
                    return "ForestGreen";
                else if (node.value === 3)
                    return "DarkOrange";
                else if (node.value === 4)
                    return "Gainsboro";
                else
                    return "GRAY";
            }
        )
        .attr("stroke", '#fff')
        .attr("stroke-width", '1.5px')
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));


    node.on('dblclick' , function(node){
        // Listeneintrag erstellen
        const added = createListGroupItem(node, '#listgroup2');
        if(added)
            alert("Knoten hinzugefügt!");
        else
            alert("Knoten bereits vorhanden!");
    });


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

        //Knoten können das svg Element nicht verlassen
        node.attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
            .attr("cy", function(d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });
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