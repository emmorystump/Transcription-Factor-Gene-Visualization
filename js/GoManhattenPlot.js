 /**
  * Constructor
  */
function GoManhattenPlot(goHeatmap){

    var self = this;
    self.goHeatmap = goHeatmap;
    // append the manhatten plot by default
    self.init();
}; // end constructor

/**
 * Initializes the svg elements required for this chart
 */
GoManhattenPlot.prototype.init = function(){
    var self = this;

    self.margin = {top: 100, right: 20, bottom: 0, left: 40};
    self.go_categories = ["GO:BP", "GO:CC","GO:MF","KEGG"];

}; // end init()

/**
 * accepts gene_id_list, passes to goProfilerGO to create API request from gprofiler
 * @params gene_name_list a list of gene_id
 */
GoManhattenPlot.prototype.update = function(gene_id_list){

  var self = this;

  self.gProfilerGO(sessionStorage.getItem("organism_code"), gene_id_list);

}; // end update()


/**
 * sends API request to gprofiler, returns data to self.distributeGOdata
 * @params the organism code, eg dmelanogaster, stored in sessionStorage when an organism is selected
 * @params gene_array is the list of genes displayed in network.js
 */
GoManhattenPlot.prototype.gProfilerGO = function(organism, gene_array){

    var self = this;
    // TODO: LOADING SPINNY WHEEL NEXT TO UPDATE
    var x = $.ajax({
      type: "POST",
      url: "https://biit.cs.ut.ee/gprofiler/api/gost/profile/",
      data: '{"organism":"'+organism+'", "query":'+'["'+gene_array.join('","')+'"],' +'"sources": ["GO:BP", "GO:CC", "GO:MF", "KEGG"], '+'"user_threshold":0.05, "return_only_filtered": true, "ordered": true}', //", "sources:"'+source_id+'"user_threshold":0.05, "all_results": true, "ordered": true}'
      headers: { 'content-type': 'application/json', 'Accept': 'application/json' },
      success: function( data ) {
        var api_data_json = JSON.parse(data)
        console.log(api_data_json)
        self.go_data_result = api_data_json.result;
        self.distributeGOdata(api_data_json);
      }
    });
}; // end gProfilerGO()

/**
 * receives the return from gProfilerGO and distributes the data
 * @params go_data_object has two parts: result and meta
 */
GoManhattenPlot.prototype.distributeGOdata = function(go_data_object){

  var self = this;

  // send data to the heatmap to parse into gene/go array
  self.createGeneGoEdgeObject(go_data_object);
  // update the manhatten plot
  self.appendPlot(go_data_object.result);

}; // end wrangleAndDistributeGOdata()

GoManhattenPlot.prototype.createGeneGoEdgeObject = function(go_data){
    var self = this;

    var query_gene_list = go_data.meta.genes_metadata.query.query_1.ensgs

    self.goHeatmap.networkDetail.go_by_gene_data = {"GO:BP": {gene_list:[], go_term_list:[], edge_list:[], go_dict:{}},
                            "GO:CC":{gene_list:[], go_term_list:[], edge_list:[], go_dict:{}},
                            "GO:MF":{gene_list:[], go_term_list:[], edge_list:[], go_dict:{}},
                            "KEGG":{gene_list:[], go_term_list:[], edge_list:[], go_dict:{}}
                           };

    go_data.result.forEach((go_result, i) => {
      var go_term = go_result.native;
      var go_description = go_result.description;
      var go_pvalue = go_result.p_value;
      var functional_category = go_result.source;
      // extract the genes associated with the go_term
      var term_gene_list = []
      go_result.intersections.forEach((evidence_arr, i) => {
        if (evidence_arr !== null){
          if (evidence_arr.length !== 0){
            term_gene_list.push(query_gene_list[[i]]);
          }
        }
      });

      // add go term to go_term_list
      self.goHeatmap.networkDetail.go_by_gene_data[functional_category].go_term_list.push(go_term);
      term_gene_list.forEach((gene_id, index) => {
        // gene list if the gene is not already listed
        if(!(gene_id in self.goHeatmap.networkDetail.go_by_gene_data[functional_category].gene_list)){
          self.goHeatmap.networkDetail.go_by_gene_data[functional_category].gene_list.push(gene_id);
        }
        // fill edge_list
        self.goHeatmap.networkDetail.go_by_gene_data[functional_category].edge_list.push({gene: gene_id, go: go_term, score:100});
        // fill go_dict (it may be better to only store this, and create edge_list in visualize)
        if (!(go_term in self.goHeatmap.networkDetail.go_by_gene_data[functional_category].go_dict)){
          self.goHeatmap.networkDetail.go_by_gene_data[functional_category].go_dict[go_term] = {gene_list: [gene_id], description: go_description, pvalue: go_pvalue, term: go_term}
        } else {
            self.goHeatmap.networkDetail.go_by_gene_data[functional_category].go_dict[go_term].gene_list.push(gene_id)
        }
      });

    });

}; // end createGeneGoEdgeObject()

GoManhattenPlot.prototype.appendPlot = function(go_data_result){
  var self = this;

  try{
    if (go_data_result == "") throw "value passed to appendPlot is null, looking for go_data_result attr"
  } catch(err){
    var go_data_result = self.go_data_result
  }

  // heading for gomanhatten plot
   var content_heading = '<h2 class="content-heading">Functional Enrichment\
                          <span data-feather="help-circle" ></span></label>\
                           <a id="function-enrich-help" data-toggle="modal" data-target="#funtionalEnrichmentModal"></a>\
                           </h2>\
                           <h5 class="content-heading">filtered for signficance (see gProfiler for details)</h5>'
  $("#plot-error").empty();
  $("#plot-title").find("h2").text("Functional Enrichment");
  $("#go-buttons").empty();
  $("#plot-subtitle").text("filtered for signficance (see gProfiler for details)");
  $("#plot-help").attr("data-toggle", "modal");
  $("#plot-help").attr("data-target", "#funtionalEnrichmentModal");

  // empty the plot div
  $("#plot-div").empty();

  // switch the Gene Detail/Go Detail tab
  $("#heatmap-plot-selector").removeClass('active');
  $("#manhatten-plot-selector").addClass('active');


  //Gets access to the div element created for this chart from HTML
  self.divGoManhattenPlot = d3.select("#plot-div").classed("content", true);
  self.svgBounds = self.divGoManhattenPlot.node().getBoundingClientRect();
  self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
  self.svgHeight = 400;

  //creates svg element within the div
  self.svg = self.divGoManhattenPlot.append("svg")
      .attr("width",self.svgWidth)
      .attr("height",self.svgHeight+self.svgBounds.top)
      .append("g")
      .attr("transform", "translate(" + self.margin.left + "," + (self.margin.top) + ")");

  // build x scales and axis, but do not attach to svg -- this is done in visualize()
  self.x = d3.scaleBand()
    .domain(self.go_categories)
    .range([0, self.svgWidth-50])

  // Build X scales and axis, but do not attach to svg -- this is done in visualize()
  self.y = d3.scaleLog()
    .range([ 0, self.svgHeight-self.margin.top-self.margin.bottom ])
    .clamp(true);

  // size scale for the points in the plot -- domain set in visualize()
  self.x_position = d3.scalePoint()
    .domain(self.go_categories)
    .range([self.x("GO:BP")+ self.margin.left+self.margin.right+19.25, self.x("KEGG")+ self.margin.left+self.margin.right+19.25]);

  self.pointScale = d3.scaleLog()
                      .range([12, 8])
                      .clamp(true);

  self.visualize(go_data_result)
};

/**
 * visualize the GO data
 * @params go_object: the 'results' object of the returned data from the gProfilerGO
 */
GoManhattenPlot.prototype.visualize = function(go_object){
  var self = this;
  // instantiate variables used in the loop to find the bounds of the pvalues
  var pval = [];
  // these are turned negative after finding min/max -- see next block
  // actually neg log10 -- the names of these variables got screwed up as i debugged. If this message isn't here, read VERY carefully and ignore the variable names
  var min_negLog10_pval = [1*10**6];
  var min_pval_index = [0];
  var max_negLog10_pval = [-1];
  var max_pval_index = [0];

  // if the go_object is empty, throw error which is printed to screen (this is handled at the VERY bottom of this function)
  try{
    if(go_object.length < 1){
      throw 'No significant GO terms. Try a less stringent threshold on the edge weights to increase the number of target genes.';
    } else{
      // figure out what the min/max pvalues are
      go_object.forEach((item, i) => {
        pval[0] = -1*Math.log(item.p_value);
        if (pval[0] < min_negLog10_pval[0]){
          min_negLog10_pval[0] = pval[0];
          max_pval_index[0] = i;
        }
        if(pval[0] > max_negLog10_pval[0]){
          max_negLog10_pval[0] = pval[0];
          min_pval_index[0] = i;
        }
      }); // end p value min/max loop

      // if the max_negLog10_pval hasn't been updated, throw and error (this not a public notice error like above)
      try{
        if(max_negLog10_pval == -1) throw "Error: no max pvalue found in GoManhattenPlot.visualize"
      } catch(err){
        console.error(err)
      } // end pvalue error check

      // remove all circles, if they exist, to clear graph for new data
       $(".manhatten-plot-instance").empty()
       d3.selectAll(".manhatten-plot-instance").transition()
        .duration(2000)
        .attr('opacity', 1);

      // set y scale domain  go_object[min_pval_index[0]].p_value
      self.y.domain([go_object[min_pval_index[0]].p_value, go_object[max_pval_index[0]].p_value])
      // set point size domain
      self.pointScale.domain([go_object[min_pval_index[0]].p_value, go_object[max_pval_index[0]].p_value])

      // append x axis to svg object
      self.svg.append("g")
        .classed("manhatten-plot-instance", true)
        .attr("transform", "translate(0," + (self.svgHeight-self.margin.top-self.margin.bottom) + ")")
        .attr("id", "manhatten-x-axis")
        .call(d3.axisBottom(self.x))
        .style("font-size", "20px");

        d3.select("#manhatten-x-axis")
        .on("click", function(d,i){
          //this extracts the axis label, eg GO:BP, from a click on the xaxis of the GO plot
          var axis_selection = d.srcElement.innerHTML;
          //only pass if recognized functional group (see init())
          if(self.go_categories.includes(axis_selection)){
            d3.select("#network-vis")
              .selectAll(".node")
              .attr("fill", function (d) {
                  if (d.type == "tf") {
                      return self.goHeatmap.networkDetail.colorScheme("tf");
                  }
                  else {
                      return self.goHeatmap.networkDetail.colorScheme("gene");
                  }
                });
            self.goHeatmap.networkDetail.axis_selection = axis_selection;
            self.goHeatmap.appendPlot(axis_selection);
          } // end if
        }); // end onclick

      // append y axis to dom
      self.svg
          .classed("manhatten-plot-instance", true)
          .append("g")
          .call(d3.axisLeft(self.y));

      // add circles to manhatten plot
      self.svg.selectAll("circle")
        .data(go_object)
        .enter()
        .append("circle")
        .attr("cx", function(d,i) { return self.x_position(d.source) }) //+ self.svgWidth/8.75 TODO: THIS NEEDS TO BE SOMEHOW ADJUSTED BASED ON SCREEN SIZE? SOMETHING OTHER THAN HARD CODING
        .attr("cy", function(d,i) { return self.y(d.p_value) })
        .attr("r", function(d,i) {return self.pointScale(d.p_value)} )
        .style("opacity", .6)
        .attr("fill", function(d,i) {return self.goHeatmap.networkDetail.colorScheme(d.source)})
        .attr("class", "manhatten-plot-instance")
        .attr("class", function(d,i) {return d.source})
        .on("click", function(node_info, data){
          // d3.select("#network-vis").selectAll(".node")
          self.goHeatmap.networkDetail.updateGoDetail({term: data.native, description: data.description, pvalue: data.p_value});
        })
        .on("mouseover", function(node_info, data){
          var go_category = data.source;
          var go_term = data.native;
          // add highlighting to associated genes
          d3.select("#network-vis").selectAll(".node")
                                   .attr("fill", function(d,i){
                                     // TODO: put go_by_gene_data in networkDetail
                                     if(self.goHeatmap.networkDetail.go_by_gene_data[go_category].go_dict[go_term].gene_list.includes(d3.select(this).attr("id"))){
                                       return self.goHeatmap.networkDetail.colorScheme(go_category)
                                     } else{
                                       if (d.type == "tf") {
                                           return self.goHeatmap.networkDetail.colorScheme("tf");
                                       }
                                       else {
                                           return self.goHeatmap.networkDetail.colorScheme("gene");
                                       }
                                     }
                                   })
        })
        // remove highlighting from associated genes
        .on("mouseleave", function(node_info, data){
          d3.select("#network-vis").selectAll(".node")
                                   .attr("fill", function (d) {
                                       if (d.type == "tf") {
                                           return self.goHeatmap.networkDetail.colorScheme("tf");
                                       }
                                       else {
                                           return self.goHeatmap.networkDetail.colorScheme("gene");
                                       }
                                   })
        }); // end mouseleave
        // console.log(self.svg)
    } // end the else clause of the if statement inside the try clause at the top of the function
  // catch the error re: go_object empty and print to screen as notice to user (not really an "error" -- nothing is broken)
  } catch(err){
    // clear graph and old notices
    $("#plot-title").find("h2").text("");
    $("#plot-subtitle").text("");
    $("#plot-error").empty();
    $("#go-buttons").empty();
    $("#plot-div").empty();
    $("#plot-help").attr("data-toggle", "modal");
    $("#plot-help").attr("data-target", "#funtionalEnrichmentModal");
    // print the notice
    $("#plot-error").append('<h4>'+err+'</h4>');
  } // end try .. catch wrapping whole function

}; // end visualize()
