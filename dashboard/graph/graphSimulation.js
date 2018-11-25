
function startSimulation(nodes, links){
    const svg = d3.select("body").select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    const color = d3.scaleOrdinal(d3.schemeCategory20);

    const simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) {
            return d.id;
        }))
        .force("charge", d3.forceManyBody().distanceMax(100)) //.strength(-500).distanceMax(30).distanceMin(20)
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
                     "</br><b>Text:</b></br>" + n.text +
                     "</br><b>Anzahl Retweets:</b></br>" + n.retweets +
                     "</br><b>Wert des Sentiments:</b></br>" + n.sentiment ,
            trigger:"hover" // "focus"
        });
    });

    // Bei Doppelklick auf Knoten Link öffnen
    node.on('dblclick' , function(node){
        window.open(node.url, '_blank');
    });

    // Titel erscheint beim hovern über Kante
    link.append("title")
        .text(function(link) { return link.type; });

    /*
    node.append("text")
        .text(function(d) {
            return "test";
        })
        .attr('x', 6)
        .attr('y', 3);
    */

    const circles = node.append("circle")
        .attr("r", 5)
        .attr("fill", function (d) {
                if (d.sentiment < 0)
                    return "crimson";
                else if (d.sentiment > 0 && d.sentiment !== 1000)
                    return "ForestGreen";
                else if (d.sentiment === 0)
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