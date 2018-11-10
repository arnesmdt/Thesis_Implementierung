function draw(){
    $("#graph").empty();

    $.get("http://localhost:3000/tweets", function(data){
        var res = JSON.parse(data);

        var nodes = res.nodes;

        var links = res.links;

        var svg = d3.select("body").select("svg"),
            width = +svg.attr("width"),
            height = +svg.attr("height");

        var color = d3.scaleOrdinal(d3.schemeCategory20);

        var simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d) { return d.id; }))
            .force("charge", d3.forceManyBody().distanceMax(150)) //.strength(-500).distanceMax(30).distanceMin(20)
            .force("center", d3.forceCenter(width / 2, height / 2));

        var link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

        var node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(nodes)
            .enter().append("g");

        //Wenn Knoten geklickt wird
        node.on('click' , function(node){ console.log(node.url);});

        var circles = node.append("circle")
            .attr("r", 5)
            .attr("fill", function(d) {
                    if(d.group === 1)
                        return "crimson";
                    else if(d.group === 2)
                        return "ForestGreen";
                    else if(d.group === 3)
                        return "DarkOrange";
                    else
                        return color(d.group);
                }
            )
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        /* Beschriftung der Knoten
          var lables = node.append("text")
              .text(function(d) {
                return d.id;
              })
              .attr('x', 6)
              .attr('y', 3);


          node.append("title")
              .text(function(d) { return d.id; });
        */

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

    });
}