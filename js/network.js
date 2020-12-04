
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
 * @param tf_selected
 * @param minScore
 * @param maxScore
 */
Network.prototype.update = function(data, organism, tf_selected, minScore, maxScore){
  var self = this;
  self.minScore = minScore;
  self.maxScore = maxScore;

  // TODO: put datadir in organism dict in redirect.js
  if (organism == "fly") {
      self.data_dir = "data/fruitfly/"
      var regID_to_regName_csv_path = self.data_dir+"ff_regulatorID_to_regulatorName.csv"
  }
  else if (organism == "yeast") {
      self.data_dir = "data/yeast/"
      var regID_to_regName_csv_path = self.data_dir+"y_regulatorID_to_regulatorName.csv"
  }

  console.log("here: " + tf_selected == "null")

  try{
    d3.csv(regID_to_regName_csv_path).then(function (allTFs) {
        // if no tf is passed, selected a random one
        console.log("here")
        if (tf_selected == "" || tf_selected == null) {
            console.log("HERE DUMMY")
            var random = Math.floor(Math.random() * allTFs.length) + 1;
            tf_selected = allTFs[random].input; // make list of
            console.log("Min and Max Scores: ")
            console.log(minScore);
            console.log(self.maxScore);
            if(minScore != null && self.maxScore != null){
                sessionStorage.setItem("selectedTf", tf_selected);
                console.log("Setting intial TF selection in storage");
                console.log(sessionStorage.getItem('selectedTf'));
            } // end inner if
        } // end outer if
        // wrangleData creates the json and calls visualize
        self.wrangleData(data, tf_selected);
     }); // end d3.csv()
  } catch(err){
    console.log("ERROR: Network.update d3.csv. regID_to_regName: " + regID_to_regName + "; tf_selected: " + tf_selected)
  }

}; // end update()

/**
 * parse network data based on organism/thresholds.
 * Calls Network.visualize()
 *
 * @param tf_selected
 */
Network.prototype.wrangleData = function(data, tf_selected){
  var self = this;

  // Define nodes and edges
  try{
    d3.json(self.data_dir + "tf_to_target/" + tf_selected + ".json").then(function (tf) { // change tf to tf_file?

      // store TF info
      self.tf_dict = {id: tf.id,
                      name: data[tf.id].name,
                      go: data[tf.id].go,
                      description: data[tf.id].description,
                      link: data[tf.id].link
                    } // end tf_dict

      // scores --> nums 1 - length(scores)?
      for (var i = 0; i < tf.linked.length; i++) {
          tf.scores[i] = +tf.scores[i]
      } // end for

      // store just the gene_id
      self.gene_id_list = [];
      self.allNodeLinks = { "nodes": [], "links": [] };

      // store distribution statistics
      var std = d3.deviation(tf.scores);
      var mean = d3.mean(tf.scores);
      var threshold = mean + 3 * std;

      self.allNodeLinks.nodes.push(
          {
          // TODO: with time, change 'name' to id to index, name to id and gene_name to name
              "id": 0, "name": self.tf_dict.id, "gene_name": self.tf_dict.name,
              "description": self.tf_dict.description, "go": self.tf_dict.go, "link": self.tf_dict.link,
              "type": "tf", "score": 0,
              "x": self.svgWidth / 2, "y": self.svgHeight / 2
          }); // end tf info push

      // fill allNodeLinks
      var linkCounter = 1;

      // begin filling allNodeLinks with target genes
      for (var i = 1; i <= tf.linked.length; i++) {


          try{ // fill the dict as long as tf.linked[i] (a transcription factor) is defined.
            var gene_dict = {id: tf.linked[i],
                             name: data[tf.linked[i]].name,
                             score: tf.scores[i],
                             description: data[tf.linked[i]].description,
                             go: data[tf.linked[i]].go,
                             link: data[tf.linked[i]].link
                           } // end gene_dict
          // skip to next iteration if not (TODO: Is there a way in javascript to catch specific errors as opposed to any error?)
          } catch (err) {
            continue;
          }

          if (self.minScore != null && self.maxScore != null) {
              if (gene_dict.score >= +self.minScore && gene_dict.score <= +self.maxScore) {
                // push gene id into gene id list when is the best place to do this?
                self.gene_id_list[i] = gene_dict.id;
                  // push the next node
                  self.allNodeLinks.nodes.push(
                      {
                        // TODO: with time, change 'name' to id to index, name to id and gene_name to name
                          "id": i, "name": gene_dict.id, "gene_name": gene_dict.name,
                          "description": gene_dict.description, "go": gene_dict.go, "link": gene_dict.link,
                          "type": "gene", "score": gene_dict.score,
                          "x": self.svgWidth / 2, "y": self.svgHeight / 2
                      })
                  // push the associated link
                  self.allNodeLinks.links.push({ "source": 0, "target": linkCounter });
                  linkCounter += 1;
              } // end inner if
          } else {
              if (gene_dict.score > +self.minScore) {
                // when is the best place to do this? (duplicated a few lines up)
                self.gene_id_list[i] = gene_dict.id;
                  // push the next node
                  self.allNodeLinks.nodes.push(
                      {
                          "id": i, "name": gene_dict.id, "gene_name": gene_dict.name,
                          "description": gene_dict.description, "go": go, "link": gene_dict.link,
                          "type": "gene", "score": gene_dict.score,
                          "x": self.svgWidth / 2, "y": self.svgHeight / 2
                      })
                  // push the associated link
                  self.allNodeLinks.links.push({ "source": 0, "target": linkCounter });
                  linkCounter += 1;
              } // end inner if
          } //end else

      } // end for

      // attach data to Export Results on main page
      var export_results_button = $("#export-network-button");
      console.log(self.allNodeLinks)
      var csv_data = self.allNodeLinks + $.map(self.allNodeLinks, function(d){return d}).join();
      export_results_button.attr("href", csv_data);
      export_results_button.attr("download", self.tf_dict.id +"_network.csv");
      export_results_button.click();

      // visualize the data
      self.visualize();
     }); // end d3.json
  } catch(error){
    console.log("ERROR: network.wrangleData()")
  }
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
        .text(self.tf_dict.id)

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
        self.geneDetail.update(gene_info, self.tf_dict) // take this as input -- may need to fix in geneDetail
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
