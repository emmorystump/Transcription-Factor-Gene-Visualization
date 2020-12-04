
/**
 * Constructor
 *
 * @param geneDetail vis object, see ./js/GeneDetail.js
 * @param goManhattenPlot vis object, see ./js/GoManhattenPlot.js
 */
function Network(geneDetail, goManhattenPlot) {

    var self = this;
    self.geneDetail = geneDetail;
    self.goManhattenPlot = goManhattenPlot;
    self.init();
};

/**
 * initialize object
 *
 */
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
        .attr("height", self.svgHeight);

    // cite: https://www.d3-graph-gallery.com/graph/scatter_tooltip.html
    // consider this a cite for all tooltip related code
    self.tooltip = d3.select("#network-vis")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .attr("id", "network-vis-tooltip")
      .style("background-color", "white") // styling should go into css -- make uniform tooltip style?
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px");

    // A function that change this tooltip when the user hover a point.
    // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
    self.mouseover = function(d) {
      self.tooltip
        .style("opacity", 1)
    };

    self.mousemove = function(d, i) {
      var x_pos = i.x+50 + "px";
      if(i.x < self.svgWidth / 2){
        x_pos = i.x-150 + "px"
      }
      self.tooltip
        .html("<p>Gene Name: " + i.gene_name + "<\p>" + "Gene ID: " + i.name)
        .style("left", x_pos) // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
        .style("top", (i.y+10) + "px")
    };

    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    self.mouseleave = function(d) {
      self.tooltip
        .transition()
        .duration(200)
        .style("opacity", 0)
    };

} // end init()

/**
 * Receive input from main.js, update data and visualization
 * Calls Network.wrangleData(), which calls Network.Visualize()
 * @param data
 * @param organism
 * @param data
 * @param tfSelected
 * @param minScore
 * @param maxScore
 */
Network.prototype.update = function(data, organism, tfSelected, minScore, maxScore){
  var self = this;
  self.minScore = minScore;
  self.maxScore = maxScore;
  self.tfSelected = tfSelected;

  if (organism == "fly") {
      self.data_dir = "data/fruitfly/"
      var regID_to_regName = "ff_regulatorID_to_regulatorName.csv"
  }
  else if (organism == "yeast") {
      self.data_dir = "data/yeast/"
      var regID_to_regName = "y_regulatorID_to_regulatorName.csv"
  }

  d3.csv(self.data_dir + regID_to_regName).then(function (allTFs) {
      if (self.tfSelected == "" || self.tfSelected == null) {
          var random = Math.floor(Math.random() * allTFs.length) + 1;
          self.tfSelected = allTFs[random].input;
          console.log("Min and Max Scores: ")
          console.log(minScore);
          console.log(self.maxScore);
          if(minScore != null && self.maxScore != null){
              sessionStorage.setItem("selectedTf", self.tfSelected);
              console.log("Setting intial TF selection in storage");
              console.log(sessionStorage.getItem('selectedTf'));
          } // end inner if
      } // end outer if
   }); // end d3.csv()

   // wrangleData creates the json and calls visualize
   self.wrangleData(data);

}; // end update()

/**
 * parse network data based on organism/thresholds.
 * Calls Network.visualize()
 *
 * @param tfSelected
 */
Network.prototype.wrangleData = function(data){
  var self = this;

  d3.json(self.data_dir + "tf_to_target/" + self.tfSelected + ".json").then(function (tf) {
    // DEFINE 'NODES' AND 'EDGES'
    for (var i = 0; i < tf.linked.length; i++) {
        tf.scores[i] = +tf.scores[i]
    } // end for

    // store just the gene_id
    self.gene_id_list = [];
    self.allNodeLinks = { "nodes": [], "links": [] };

    var std = d3.deviation(tf.scores);
    var mean = d3.mean(tf.scores);
    var threshold = mean + 3 * std;

    var tf_geneName = data[tf.id].name;
    var tf_description = data[tf.id].description;
    var tf_go = data[tf.id].go;
    var tf_link = data[tf.id].link;
    self.allNodeLinks.nodes.push(
        {
            "id": 0, "name": tf.id, "gene_name": tf_geneName,
            "description": tf_description, "go": tf_go, "link": tf_link,
            "type": "tf", "score": 0,
            "x": self.svgWidth / 2, "y": self.svgHeight / 2
        }); // end tf info push

    // fill allNodeLinks
    var linkCounter = 1;

    for (var i = 1; i <= tf.linked.length; i++) {
        var curGeneID = tf.linked[i];
        var curGeneScore = tf.scores[i];

        if (curGeneID == "undefined" || data[curGeneID] == "undefined"){
            continue;
        } // end if

        if (self.minScore != null && self.maxScore != null) {
            if (curGeneScore >= +self.minScore && curGeneScore <= +self.maxScore) {
              self.gene_id_list[i] = curGeneID;
              var geneName = data[curGeneID].name;
              var description = data[curGeneID].description;
              var go = data[curGeneID].go;
              var link = data[curGeneID].link;
                self.allNodeLinks.nodes.push(
                    {
                        "id": i, "name": curGeneID, "gene_name": geneName,
                        "description": description, "go": go, "link": link,
                        "type": "gene", "score": curGeneScore,
                        "x": self.svgWidth / 2, "y": self.svgHeight / 2
                    })
                self.allNodeLinks.links.push({ "source": 0, "target": linkCounter });
                linkCounter += 1;
            } // end inner if
        } else {
            if (curGeneScore > +self.minScore) {
              self.gene_id_list[i] = curGeneID;
              var geneName = data[curGeneID].name;
              var description = data[curGeneID].description;
              var go = data[curGeneID].go;
              var link = data[curGeneID].link;
                self.allNodeLinks.nodes.push(
                    {
                        "id": i, "name": curGeneID, "gene_name": gene_name,
                        "description": description, "go": go, "link": link,
                        "type": "gene", "score": curGeneScore,
                        "x": self.svgWidth / 2, "y": self.svgHeight / 2
                    })
                self.allNodeLinks.links.push({ "source": 0, "target": linkCounter });
                linkCounter += 1;
            } // end inner if
        } //end else

    } // end for
    self.visualize();
  }); // end d3.json
}; // end wrangleData()


/**
 * Visualize network information. This is the end result of calling network.update()
 *
 */
Network.prototype.visualize = function () {
    var self = this;
    var svg = self.svg;

    console.log(self.gene_id_list)

    // generate GO manhantten plot from tf network cluster
    self.goManhattenPlot.update(self.gene_id_list);

    d3.select("#edge-chart-heading-text")
        .text(self.tfSelected)

    var links = self.allNodeLinks.links;
    var nodes = self.allNodeLinks.nodes;

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
        .attr("id", function(d) {return d.name})
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
            .attr("cx", d => d.x = Math.max(5, Math.min(self.svgWidth - 10, d.x)))
            .attr("cy", d => d.y = Math.max(5, Math.min(self.svgHeight - 10, d.y)));
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

    // TODO: KEEP HIGHLIGHTING WHEN GENE IS CLICKED UNTIL NEXT GENE IS CLICKED
    node.on("click", function (node_info, gene_info) {
      // select all nodes, removed click-highlight class
      d3.selectAll(".node")
      // add click-hightlight class to this node
        self.geneDetail.update(gene_info, {"tf_id": tf.id, "name":tf_geneName, "description": tf_description, "go": tf_go, "link": tf_link})
    })
        .on("mouseover", function (node_info, gene_info) {
            self.tooltip.style("opacity", 1)
            d3.select(this).attr("fill", "green");
        })
        .on("mousemove", self.mousemove)
        .on("mouseout", function (node_info, gene_info) {
            d3.select(this).attr("fill", function (d, i) {
                if (gene_info.type == "tf") {
                    return "#6778d0"
                } else {
                    return "#ba495b"
                }
            })
        })
      .on("mouseleave", self.mouseleave)


}; // end network.update()
