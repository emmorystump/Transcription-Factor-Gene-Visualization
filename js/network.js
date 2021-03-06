
/**
 * Constructor
 *
 * @params goManhattenPlot: vis object, see ./js/GoManhattenPlot.js
 */
function Network(goManhattenPlot) {

    var self = this;
    // This inherets from all previous vis classes except weights currently
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

    // A function that change this tooltip when the user hovers a point.
    // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
    self.mouseover = function (d) {
        self.tooltip
            .style("opacity", 1)
    };

    self.mousemove = function (d, i) {
        var x_pos = i.x + 50 + "px";
        if (i.x < self.svgWidth / 2) {
            x_pos = i.x - 200 + "px"
        }
        self.tooltip
            .html("<p>Gene Name: " + i.gene_name + "<\p>" + "Gene ID: " + i.name)
            .style("left", x_pos) // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
            .style("top", (i.y + 10) + "px")
    };

    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    self.mouseleave = function (d) {
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
// TODO: ADD FUNCTIONALITY TO FILTER BASED ON FUNCTIONAL CATEGORY
// TODO: move data handling into networkDetail?
// add button to do so (text could just be filter) that will become present when a suer clicks manhatten x axis label or a go term in gene/function grid
Network.prototype.update = function(data, organism, tf_selected, minScore, maxScore, selectedType){
  var self = this;
  self.minScore = minScore;
  self.maxScore = maxScore;

  // TODO: put datadir in organism dict in redirect.js
      if (organism == "fly") {
          self.data_dir = "data/fruitfly/"
          if (selectedType == "tf") {
              var id_name_dict = self.data_dir + "ff_regulatorID_to_regulatorName.csv"
          }
          else if (selectedType == "gene") {
              var id_name_dict = self.data_dir + "ff_geneID_to_geneName.csv"
          }
          else {
              var id_name_dict = self.data_dir + "ff_regulatorID_to_regulatorName.csv"
          }
      }
      else if (organism == "yeast") {
          self.data_dir = "data/yeast/"
          if (selectedType == "tf") {
              var id_name_dict = self.data_dir + "y_regulatorID_to_regulatorName.csv"
          }
          else if (selectedType == "gene") {
              var id_name_dict = self.data_dir + "y_geneID_to_geneName.csv"
          }
          else {
              var id_name_dict = self.data_dir + "y_regulatorID_to_regulatorName.csv"
          }
      }

      try {
          d3.csv(id_name_dict).then(function (allTFs) {
              // if no tf is passed, selected a random one
              if(tf_selected == "" || tf_selected == null) {
                  if(sessionStorage.getItem("selectedTf") == null){
                      console.log(sessionStorage.getItem("selectedGenes"))
                      console.log(sessionStorage.getItem("selectedTf"))
                      var random = Math.floor(Math.random() * allTFs.length) + 1;
                      tf_selected = allTFs[random].input; // make list of
                      sessionStorage.setItem("selectedTf", tf_selected)
                      console.log(sessionStorage.getItem("selectedTf"))
                  }else {
                      tf_selected = sessionStorage.getItem("selectedTf")
                  } // end inner if else clause
                }// end outer if
            // wrangleData creates the json and calls visualize
            self.wrangleData(data, tf_selected, selectedType);
          }); // end d3.csv()
      } catch (err) {
          console.error("ERROR: Network.update d3.csv. id_name_dict: " + id_name_dict + "; tf_selected: " + tf_selected)
      }

}; // end update()

/**
 * parse network data based on organism/thresholds.
 * Calls Network.visualize()
 *
 * @params data: loaded from file, see self.update()
 * @params tf_selected: the gene id of the current TF
 * @params selectedType: tf or gene -- part of the functionality to transform input gene to list of regulators (right?)
 */
 Network.prototype.wrangleData = function (data, tf_selected, selectedType) {
     var self = this;
     var individual_data_dir = "all/";
     if(selectedType == "tf"){
         individual_data_dir = "tf_to_target/";
     }
     else if(selectedType == "gene"){
         individual_data_dir = "target_to_tf/";
     }
     // Define nodes and edges
     try {
         d3.json(self.data_dir + individual_data_dir + tf_selected + ".json").then(function (tf) { // change tf to tf_file?
           try {
                 // store TF info
                 self.tf_dict = {
                     id: tf.id,
                     name: data[tf.id].name,
                     go: data[tf.id].go,
                     description: data[tf.id].description,
                     link: data[tf.id].link
                 } // end tf_dict
             } catch (err) {
                 window.alert(tf.id + " is not available, please enter another TF/gene ID.")
             } // end try/catch
             // scores --> nums 1 - length(scores)?
             for (var i = 0; i < tf.linked.length; i++) {
                 tf.scores[i] = +tf.scores[i]
             } // end for            // store just the gene_id
             var gene_id_list = [];
             self.allNodeLinks = { "nodes": [], "links": [] };
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
               try { // fill the dict as long as tf.linked[i] (a transcription factor) is defined.
                     var gene_dict = {
                         id: tf.linked[i],
                         name: data[tf.linked[i]].name,
                         score: tf.scores[i],
                         description: data[tf.linked[i]].description,
                         go: data[tf.linked[i]].go,
                         link: data[tf.linked[i]].link
                     } // end gene_dict
                 // skip to next iteration if not (TODO: Is there a way in javascript to catch specific errors as opposed to any error?)
                 } catch (err) {
                     continue;
                 } // end try/catch
                 if (self.minScore != null && self.maxScore != null) {
                     if (gene_dict.score >= +self.minScore && gene_dict.score <= +self.maxScore) {
                         // push gene id into gene id list when is the best place to do this?
                         gene_id_list[i] = gene_dict.id;
                         // push the next node
                         self.allNodeLinks.nodes.push(
                             {
                                 // TODO: with time, change 'name' to id to index, name to id and gene_name to name
                                 "id": i, "name": gene_dict.id, "gene_name": gene_dict.name,
                                 "description": gene_dict.description, "go": gene_dict.go, "link": gene_dict.link,
                                 "type": "gene", "score": gene_dict.score,
                                 "x": self.svgWidth / 2, "y": self.svgHeight / 2
                             }) // end gene allNodeLinks dict
                         // push the associated link
                         self.allNodeLinks.links.push({ "source": 0, "target": linkCounter });
                         linkCounter += 1;
                     } // end inner if
                 }
             } // end for
             // TODO: EXPORT CURRENT GENE TARGET CSV
             // attach data to Export Results on main page
             var export_results_button = $("#export-network-button");
             //TODO add column names and figure out how to export
             var csv_string = "gene_id,gene_name,netprophet_score\n" + $.map(self.allNodeLinks.nodes, function (d) { return [d.name, d.gene_name, d.score].join(",") }).join("\n");
             var blob = new Blob([csv_string], { type: 'text/csv;charset=utf-8;' });
             var url = URL.createObjectURL(blob);
             export_results_button.attr("href", url);
             export_results_button.attr("download", self.tf_dict.id + "_network.csv");
             export_results_button.click();
             // visualize the data
             self.visualize(gene_id_list);
         }); // end d3.json
     } catch (error) {
         console.error("ERROR: network.wrangleData() "+ error)
     } // end try/catch
 }; // end wrangleData()


/**
 * Visualize network information. This is the end result of calling network.update()
 * @params gene_id_list
 */
Network.prototype.visualize = function (gene_id_list) {
    var self = this;
    var svg = self.svg;

    // generate GO manhantten plot from tf network cluster
    self.goManhattenPlot.update(gene_id_list);
    var selectedType = "";
    if(sessionStorage.getItem("selectedType") == "tf"){
        selectedType = "TF";
    }
    else if(sessionStorage.getItem("selectedType") == "gene"){
        selectedType = "Gene";
    };
    d3.select("#edge-chart-heading-text")
        .text(selectedType + ": " + self.tf_dict.id)

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
        .attr("id", function (d) { return d.name })
        .attr("r", 10)
        .attr("fill", function (d) {
            if (d.type == "tf") {
                return self.goManhattenPlot.goHeatmap.networkDetail.colorScheme("tf");
            }
            else {
                return self.goManhattenPlot.goHeatmap.networkDetail.colorScheme("gene");
            }
        })
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .style("opacity", function(d) {if(d.type == "tf") {return 1}else return .9});

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

    node.on("click", function (node_info, gene_info) {
        // select all nodes, removed node-highlight class
        d3.selectAll(".node").classed("highlight", false)
                             .style("stroke", null)
                             .style("stroke-width", null)
        // select clicked node and add node-highlight class
        d3.select(this).classed("highlight", true)
                       .style("stroke", self.goManhattenPlot.goHeatmap.networkDetail.colorScheme("highlight"))
                       .style("stroke-width", "3" );
        // add click-hightlight class to this node
        self.goManhattenPlot.goHeatmap.networkDetail.updateGeneDetail(gene_info, self.tf_dict)
    })
        .on("mouseover", function (node_info, gene_info) {
            // activate tooltip
            self.tooltip.style("opacity", 1)
            // add highlight circle to node
            d3.select(this).style("stroke", self.goManhattenPlot.goHeatmap.networkDetail.colorScheme("highlight"))
                           .style("stroke-width", "3" );
        })
        // i think this affects the tooltip -- check
        .on("mousemove", self.mousemove)
        // remove the highlight from all nodes that don't have the highlight class
        .on("mouseout", function (node_info, gene_info) {
            if(d3.select(this).attr("class") != "node highlight"){
              d3.select(this).style("stroke", null)
                             .style("stroke-width", null)
            }
        })
        // i think this affects the tooltip -- check
        .on("mouseleave", self.mouseleave)


}; // end network.update()
