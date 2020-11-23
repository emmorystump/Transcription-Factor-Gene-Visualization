
function Network(networkDetail, geneDetail, goNetwork) {

    var self = this;
    self.networkDetail = networkDetail;
    self.geneDetail = geneDetail;
    self.goNetwork = goNetwork;
    self.init();
};

Network.prototype.init = function () {
    var self = this;
    self.margin = { top: 30, right: 20, bottom: 30, left: 50 };

    //Gets access to the div element created for this chart from HTML
    var divNetwork = d3.select("#network-vis").classed("content", true);
    self.svgBounds = divNetwork.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 500;

    //creates svg element within the div
    self.svg = divNetwork.append("svg")
        .attr("width", self.svgWidth)
        .attr("height", self.svgHeight)
};

Network.prototype.update = function (data, organism, tfSelected, minScore, maxScore) {
    var self = this;
    var svg = self.svg;
    if (organism == "fly") {
        var dataDir = "data/fruitfly/"
        var regID_to_regName = "ff_regulatorID_to_regulatorName.csv"
    }
    else if (organism == "yeast") {
        var dataDir = "data/yeast/"
        var regID_to_regName = "y_regulatorID_to_regulatorName.csv"

    }

    d3.csv(dataDir + regID_to_regName).then(function (allTFs) {
        if (tfSelected == "" || tfSelected == null) {
            var random = Math.floor(Math.random() * allTFs.length) + 1;
            tfSelected = allTFs[random].input;
            console.log("Min and Max Scores: ")
            console.log(minScore);
            console.log(maxScore);
            if(minScore != null && maxScore != null){
                sessionStorage.setItem("selectedTf", tfSelected);
                console.log("Setting intial TF selection in storage");
                console.log(sessionStorage.getItem('selectedTf'));
            }

        }
       
        // TODO: If we change TF using the side panel, the max and min score boundary is carried over
        // from the previous TF selection, not sure if we want to change this. Also

        d3.json(dataDir + "tf_to_target/" + tfSelected + ".json").then(function (tf) {
            // chase todo: update TF png_url

            // DEFINE 'NODES' AND 'EDGES'
            for (var i = 0; i < tf.linked.length; i++) {
                tf.scores[i] = +tf.scores[i]
            }
            var gene_id_list = []; // store just the gene_id
            var allNodeLinks = { "nodes": [], "links": [] };
            var std = d3.deviation(tf.scores);
            var mean = d3.mean(tf.scores);
            var threshold = mean + 3 * std;
            // if (minScore == null || maxScore == null){
            //     minScore = threshold
            // }
            if (minScore < mean){
                minScore = mean;
            };
            console.log(tfSelected)
            console.log(minScore)
            console.log(maxScore)
            console.log(threshold)
            allNodeLinks.nodes.push(
                {
                    "id": 0, "name": tf.id,
                    "type": "tf", "score": 0,
                    "x": self.svgWidth / 2, "y": self.svgHeight / 2
                });

            var linkCounter = 1;
            for (var i = 1; i <= tf.linked.length; i++) {
                var curGeneID = tf.linked[i];
                var curGeneScore = tf.scores[i]
                if (minScore != null && maxScore != null) {
                    if (curGeneScore >= +minScore && curGeneScore <= +maxScore) {
                        allNodeLinks.nodes.push(
                            {
                                "id": i, "name": curGeneID,
                                "type": "gene", "score": curGeneScore,
                                "x": self.svgWidth / 2, "y": self.svgHeight / 2
                            })
                        allNodeLinks.links.push({ "source": 0, "target": linkCounter });
                        linkCounter += 1;
                    }
                }
                else {
                    if (curGeneScore > threshold) {
                        gene_id_list[gene_id_list.length] = curGeneID;
                        allNodeLinks.nodes.push(
                            {
                                "id": i, "name": curGeneID,
                                "type": "gene", "score": curGeneScore,
                                "x": self.svgWidth / 2, "y": self.svgHeight / 2
                            })
                        allNodeLinks.links.push({ "source": 0, "target": linkCounter });
                        linkCounter += 1;
                    }
                }
            } // allNodeLinks filling complete

            // generate GO map from tf network cluster
            self.goNetwork.update(gene_id_list);

            d3.select("#edge-chart-heading-text")
                .text(tfSelected)

            console.log(allNodeLinks.links.length)
            var links = allNodeLinks.links;
            var nodes = allNodeLinks.nodes;

            var linkScale = d3.scaleLinear()
                .domain([d3.min(nodes, function (d) {
                    return d.score;
                }), d3.max(nodes, function (d) {
                    return d.score;
                })])
                .range([1, 10]);
            // START RUNNING THE SIMULATION
            var simulation = d3.forceSimulation(nodes)
                .force('link', d3.forceLink(links).distance(100))
                .force("charge", d3.forceManyBody())
                .force("center", d3.forceCenter(self.svgWidth / 2 - 50, self.svgHeight / 2))
                .force('collision', d3.forceCollide().radius(function (d) {
                    return 15;
                }));

            svg.selectAll("g").remove();
            svg.selectAll(".node").remove();

            // DRAW THE LINKS (SVG LINE)

            var link = svg.append("g")
                .selectAll("line")
                .data(links)
                .join("line")
                .attr("stroke-width", function (d) {
                    return linkScale(d.score)
                })
                .attr("stroke", "#999")
                .attr("stroke-opacity", 0.6);

        
            // DRAW THE NODES (SVG CIRCLE)
            var node = svg.selectAll(".node")
                .data(nodes)
                .enter()
                .append("circle")
                .attr("class", "node")
                .attr("r", 10)
                .attr("fill", function (d) {
                    if (d.type == "tf") {
                        return "#6778d0";
                    }
                    else {
                        return "#ba495b";
                    }
                })
                .attr("stroke", "white")
                .attr("stroke-width", 1);

            node.transition()
                .duration(2000)
                .attr('opacity', 1)

            link.transition()
                .duration(2000)
                .attr('opacity', 1)

            simulation.on("tick", () => {
                node
                    .attr("cx", d => d.x = Math.max(5, Math.min(self.svgWidth - 5, d.x)))
                    .attr("cy", d => d.y = Math.max(5, Math.min(self.svgHeight - 5, d.y)));
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);
            });

            node.call(d3.drag()
                .on("start", function (event) {
                    if (!event.active) simulation.alphaTarget(0.1).restart();
                    event.subject.fx = event.subject.x;
                    event.subject.fy = event.subject.y;
                })
                .on("drag", function (event) {
                    event.subject.fx = event.x;
                    event.subject.fy = event.y;
                })
                .on("end", function (event) {
                    if (!event.active) simulation.alphaTarget(0);
                    event.subject.fx = null;
                    event.subject.fy = null;
                }));

            node.on("click", function (node_info, gene_info) {
                self.geneDetail.update([gene_info.name, gene_info.score], nodes)
            })
                .on("mouseover", function (node_info, gene_info) {
                    d3.select(this).attr("fill", "green")
                })
                .on("mouseout", function (node_info, gene_info) {
                    d3.select(this).attr("fill", function (d, i) {
                        if (gene_info.type == "tf") {
                            return "#6778d0"
                        } else {
                            return "#ba495b"
                        }
                    }) // end d3.select
                })
        }); // end d3.json
    }) // end d3.csv


} // end network.update()
