
/**
 * Constructor for the a GoHeatmap
 */
function GoHeatmap(colorScheme){

    var self = this;
    self.colorScheme = colorScheme;
    self.init();
}; // end constructor

/**
 * Initializes the svg elements required for this chart
 */
GoHeatmap.prototype.init = function(){
    var self = this;
    self.margin = {top: 100, right: 100, bottom: 30, left: 100};

    //Gets access to the div element created for this chart from HTML
    var divGoHeatmap = d3.select(".go-heatmap").classed("content", true);
    self.svgBounds = divGoHeatmap.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width;
    self.svgHeight = 500; // TODO: SOMEHOW, THIS NEEDS TO BE UPDATED WITH THE NUMBER OF GENES TO DISPLAY (maybe bins? 1-20 some length, 20-40 some length, etc)

    //creates svg element within the div
    self.svg = divGoHeatmap.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight+self.svgBounds.top)
        .append("g")
        .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

        // Build X scales and axis:
    self.x = d3.scaleBand()
      .range([ 0, self.svgWidth-self.margin.left-self.margin.right ])
      .padding(0.01);

    // Build X scales and axis:
    self.y = d3.scaleBand()
      .range([ self.svgHeight-self.svgBounds.top, 0 ])
      .padding(0.01);

    // Build color scale
    self.myColor = d3.scaleLinear()
      .range(["white", "#69b3a2"])
      .domain([1,100])

}; // end init()

/**
 *
 * @param
 * @param
 */

GoHeatmap.prototype.createGeneGoEdgeObject = function(go_data){
    var self = this;

    var query_gene_list = go_data.meta.genes_metadata.query.query_1.ensgs

    self.go_by_gene_data = {"GO:BP": {gene_list:[], go_term_list:[], edge_list:[], go_dict:{}},
                            "GO:CC":{gene_list:[], go_term_list:[], edge_list:[], go_dict:{}},
                            "GO:MF":{gene_list:[], go_term_list:[], edge_list:[], go_dict:{}},
                            "KEGG":{gene_list:[], go_term_list:[], edge_list:[], go_dict:{}}
                           };

    go_data.result.forEach((go_result, i) => {
      var go_term = go_result.native;
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
      self.go_by_gene_data[functional_category].go_term_list.push(go_term);
      term_gene_list.forEach((gene_id, index) => {
        // gene list if the gene is not already listed
        if(!(gene_id in self.go_by_gene_data[functional_category].gene_list)){
          self.go_by_gene_data[functional_category].gene_list.push(gene_id);
        }
        // fill edge_list
        self.go_by_gene_data[functional_category].edge_list.push({gene: gene_id, go: go_term, score:100});
        // fill go_dict (it may be better to only store this, and create edge_list in visualize)
        if (!(go_term in self.go_by_gene_data[functional_category].go_dict)){
          self.go_by_gene_data[functional_category].go_dict[go_term] = [gene_id]
        } else {
            self.go_by_gene_data[functional_category].go_dict[go_term].push(gene_id)
        }
      });

    });

}; // end setData()


/**
 * Creates the stacked bar chart, text content and tool tips for electoral vote chart
 *
 * @param go_category is passed in GoManhattenPlot. it is passed when a label on the x-axis is clicked
 */

GoHeatmap.prototype.update = function(go_category){ // TODO: ENTER/UPDATE/EXIT OR OTHERWISE CLEAR OLD MAP PRIOR TO UPDATING
    var self = this;

    // remove all items from previous graph (everything added to graph below is classed with heatmap-update)
    $(".heatmap-update").remove()

    // update the y domain with the gene list
    self.y.domain(self.go_by_gene_data[go_category]["gene_list"].flat());
    // append the y axis to the svg element
    self.svg.append("g")
            .call(d3.axisLeft(self.y))
            .attr("class", "heatmap-update");

    // update the x axis with the go terms
    self.x.domain(self.go_by_gene_data[go_category]["go_term_list"].flat());
    // add the x axis to the svg element

    self.svg.append("g")
            //.attr("transform", "translate(0," + self.svgHeight + ")")
            .call(d3.axisTop(self.x))
            .attr("class", "heatmap-update")
            .selectAll("text")
            .attr("y", 0)
            .attr("x", -70)
            .attr("dy", "-.35em")
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start")
            .on("click", function(d,i){
              //this extracts the axis label, eg GO:BP, from a click on the xaxis of the GO plot
              var axis_selection = d.explicitOriginalTarget.__data__;
              //color nodes by GO category
              $("#network-vis").find(".node").each((index,node) => {
                  if (self.go_by_gene_data[go_category].go_dict[axis_selection].includes(node.__data__.name)){
                      d3.selectAll("#"+node.__data__.name).attr("fill", self.colorScheme(go_category));
                  }
              });
            });

    // add blocks to heatmap
    self.svg.selectAll("rect")
            .data(self.go_by_gene_data[go_category]["edge_list"], function(d) {return d.gene+':'+d.go;})
            .enter()
            .append("rect")
            .attr("class", "heatmap-update")
            .attr("x", function(d) { return self.x(d.go) })
            .attr("y", function(d) { return self.y(d.gene) })
            .attr("width", self.x.bandwidth() )
            .attr("height", self.y.bandwidth() )
            .style("fill", self.colorScheme(go_category) );

}; // end update()
