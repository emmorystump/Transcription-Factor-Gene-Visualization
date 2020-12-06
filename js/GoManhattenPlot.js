
/**
 * Constructor
 */
function GoManhattenPlot(colorScheme, geneDetail, goHeatmap, functional_categories){

    var self = this;
    self.colorScheme = colorScheme;
    self.geneDetail = geneDetail;
    self.goHeatmap = goHeatmap;
    self.functional_categories = functional_categories;
    self.init();
}; // end constructor

/**
 * Initializes the svg elements required for this chart
 */
GoManhattenPlot.prototype.init = function(){
    var self = this;
    self.margin = {top: 100, right: 100, bottom: 0, left: 50};
    var go_categories = ["GO:BP", "GO:CC","GO:MF","KEGG"];

    //Gets access to the div element created for this chart from HTML
    self.divGoManhattenPlot = d3.select("#go-manhatten-plot").classed("content", true);
    self.svgBounds = self.divGoManhattenPlot.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 400;

    //creates svg element within the div
    self.svg = self.divGoManhattenPlot.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight+self.svgBounds.top)
        .append("g")
        .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

    // build x scales and axis, but do not attach to svg -- this is done in visualize()
    self.x = d3.scaleBand()
      .domain(go_categories)
      .range([0, self.svgWidth])

    // Build X scales and axis, but do not attach to svg -- this is done in visualize()
    self.y = d3.scaleLog()
      .range([ 0, self.svgHeight-self.margin.top-self.margin.bottom ])
      .clamp(true);

    // size scale for the points in the plot -- domain set in visualize()
    self.pointScale = d3.scaleLog()
                        .range([8, 4])
                        .clamp(true);

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

    var x = $.ajax({
      type: "POST",
      url: "https://biit.cs.ut.ee/gprofiler/api/gost/profile/",
      data: '{"organism":"'+organism+'", "query":'+'["'+gene_array.join('","')+'"],' +'"sources": ["GO:BP", "GO:CC", "GO:MF", "KEGG"], '+'"user_threshold":0.05, "return_only_filtered": true, "ordered": true}', //", "sources:"'+source_id+'"user_threshold":0.05, "all_results": true, "ordered": true}'
      headers: { 'content-type': 'application/json', 'Accept': 'application/json' },
      success: function( data ) {
        self.distributeGOdata(JSON.parse(data));
      }
    });
}; // end gProfilerGO()

/**
 * receives the return from gProfilerGO and distributes the data
 * @params go_data_object has two parts: result and meta
 */
GoManhattenPlot.prototype.distributeGOdata = function(go_data_object){

  var self = this;

  // update the manhatten plot
  self.visualize(go_data_object.result);

  // send data to the heatmap to parse into gene/go array
  self.goHeatmap.createGeneGoEdgeObject(go_data_object);

}; // end wrangleAndDistributeGOdata()

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
      // if there is no error, remove the notice to the user (the error above) in preparation of appending the graph
      $("#go-network-error").remove()
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
      $(".manhatten-plot-instance").remove()
      // set y scale domain
      self.y.domain([go_object[min_pval_index[0]].p_value, go_object[max_pval_index[0]].p_value])
      // set point size domain
      self.pointScale.domain([go_object[min_pval_index[0]].p_value, go_object[max_pval_index[0]].p_value])

      // append x axis to svg object
      self.svg.append("g")
        .classed("manhatten-plot-instance", true)
        .attr("transform", "translate(0," + (self.svgHeight-self.margin.top-self.margin.bottom) + ")")
        .attr("class", "x-axis")
        .call(d3.axisBottom(self.x))
        .on("click", function(d,i){
          //this extracts the axis label, eg GO:BP, from a click on the xaxis of the GO plot
          var axis_selection = d.explicitOriginalTarget.__data__;
          //only pass if recognized functional group (see init())
          if(self.functional_categories.includes(axis_selection)){
            d3.select("#network-vis")
              .selectAll(".node")
              .attr("fill", function (d) {
                  if (d.type == "tf") {
                      return self.colorScheme("tf");
                  }
                  else {
                      return self.colorScheme("gene");
                  }
                });
            self.goHeatmap.update(axis_selection);
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
        .attr("cx", function(d,i) { return self.x(d.source) + self.svgWidth/8 }) // TODO: THIS NEEDS TO BE SOMEHOW ADJUSTED BASED ON SCREEN SIZE? SOMETHING OTHER THAN HARD CODING
        .attr("cy", function(d,i) { return self.y(d.p_value) })
        .attr("r", function(d,i) {return self.pointScale(d.p_value)} )
        .style("opacity", .4)
        .attr("fill", function(d,i) {return self.colorScheme(d.source)})
        .attr("class", "manhatten-plot-instance")
        .attr("class", function(d,i) {return d.source})
        .on("click", function(node_info, data){
          self.geneDetail.updateGoDetail(data)
        })
        .on("mouseover", function(node_info, data){
          // highlight the term circle
          // put a halo around the selected node
        })
        .on("mouseleave", function(node_info, data){
          // return color to prev
        }); // end circle append
    } // end the else clause of the if statement inside the try clause at the top of the function
  // catch the error re: go_object empty and print to screen as notice to user (not really an "error" -- nothing is broken)
  } catch(err){
    // clear graph and old notices
    $(".manhatten-plot-instance").remove()
    $("#go-network-error").remove()
    // print the notice
    $("#go-manhatten-plot").append('<p id="go-network-error">'+err+'</p>');
  } // end try .. catch wrapping whole function

}; // end visualize()
