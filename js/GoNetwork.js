
/**
 * Constructor for the a visualization
 *
 * replace all "VisTemplate" with name of object
 */
function GoNetwork(geneDetail, goHeatmap){

    var self = this;
    self.geneDetail = geneDetail;
    self.goHeatmap = goHeatmap;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 * TODO: put tooltip infrastructure somewhere w/common access -- less redundancy
 */
GoNetwork.prototype.init = function(){
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    //Gets access to the div element created for this chart from HTML
    var divGoNetwork = d3.select(".go-network").classed("content", true);
    self.svgBounds = divGoNetwork.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 300;

    //creates svg element within the div
    self.svg = divGoNetwork.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight);

    var go_categories = ["GO:BP", "GO:CC","GO:MF","KEGG"];
    // Build X scales and axis:
    self.x = d3.scaleBand()
      .domain(go_categories)
      .range([ 0, self.svgWidth ]);
      //.padding(0.01);

    // Build X scales and axis:
    self.y = d3.scaleLinear()
      .range([ self.svgHeight, 0 ]);

    // Build color scale
    self.functionalCategories = ["GO:BP", "GO:CC","GO:MF","KEGG"]
    self.goClassColor = d3.scaleOrdinal()
      .domain(self.functionalCategories)
      .range(["#d95f02","#f0027f","#6a3d9a","#33a02c"]);

    // cite: https://www.d3-graph-gallery.com/graph/scatter_tooltip.html
    // consider this a cite for all tooltip related code
    self.tooltip = d3.select(".go-network")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .attr("id", "go-network-tooltip")
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
          .html("<p>Description: " + i.description + "<br>"+
                 "GO_term: " + i.native + "<br>"+
                 "<p> p-value: " + i.p_value + "<\p>"+
                 '<a class="nav-link" href="'+self.geneDetail.goUrlMaker(i.parents, sessionStorage.getItem("go_chart_url_prefix")) + '" target="_blank">GO term chart<\a>')
          .style("left", x_pos) // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
          .style("top", i.y + "px")
      };

      // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
      self.mouseleave = function(d) {
        self.tooltip
          .transition()
          .duration(200)
          .style("opacity", 0)
      };

};
/**
 * accepts gene_id_list, passes to gProfilerGO
 * @params gene_name_list a list of gene_id
 */

GoNetwork.prototype.update = function(gene_id_list){

  var self = this;
  //console.log(gene_name_list)

  self.gProfilerGO(sessionStorage.getItem("organism_code"), gene_id_list);

}; // end update()

GoNetwork.prototype.gProfilerGO = function(organism, gene_array){

    var self = this;

    var x = $.ajax({
      type: "POST",
      url: "https://biit.cs.ut.ee/gprofiler/api/gost/profile/",
      data: '{"organism":"'+organism+'", "query":'+'["'+gene_array.join('","')+'"],' +'"sources": ["GO:BP", "GO:CC", "GO:MF", "KEGG"], '+'"user_threshold":0.05, "no_evidences": true, "return_only_filtered": true, "ordered": true}', //", "sources:"'+source_id+'"user_threshold":0.05, "all_results": true, "ordered": true}'
      headers: { 'content-type': 'application/json', 'Accept': 'application/json' },
      success: function( data ) {
        parsed_data = JSON.parse(data).result;
        self.visualize(parsed_data);
        self.goHeatmap.receiveData(gene_array, parsed_data)
      }
    });
} // end gProfilerGO()

GoNetwork.prototype.visualize = function(go_object){
  // need to fix margin around svg, axis, etc
  var self = this;

  var min_negLog10_pval = 1.3;
  var max_negLog10_pval = 6;

  // append axis to svg object
  self.svg.append("g")
    .attr("transform", "translate(0," + 280 + ")")
    .attr("class", "x-axis")
    .call(d3.axisBottom(self.x))
    .on("click", function(d,i){
      //this extracts the axis label, eg GO:BP, from a click on the xaxis of the GO plot
      var axis_selection = d.explicitOriginalTarget.__data__;
      //only pass if recognized functional group (see init())
      if(self.functionalCategories.includes(axis_selection)){
        self.goHeatmap.update(axis_selection);
      } // end if
    });

  self.y.domain([min_negLog10_pval, max_negLog10_pval]);

  self.svg.append("g")
    .call(d3.axisLeft(self.y));

  var pointScale = d3.scaleLinear()
                     .domain([min_negLog10_pval, max_negLog10_pval])
                     .range([1,10])

  self.svg.selectAll("circle")
    .data(go_object)
    .enter()
    .append("circle")
    .attr("cx", function(d,i) { return self.x((d.source))+95 }) // TODO: THIS NEEDS TO BE SOMEHOW ADJUSTED BASED ON SCREEN SIZE? SOMETHING OTHER THAN HARD CODING
    .attr("cy", function(d,i) { return self.y(-Math.log(d.p_value)) })
    .attr("r", function(d,i) {return pointScale(-Math.log(d.p_value))} )
    .attr("fill", function(d,i) {return self.goClassColor(d.source)})
    .attr("class", "my-circles")
    .attr("class", function(d,i) {return d.source})
    .on("click", function(node_info, data){
      self.tooltip.style("opacity", 1);
      self.mousemove(node_info, data);
    })
    .on("mouseover", function(node_info, data){
      self.tooltip.style("opacity", 1);
      // put a halo around the selected node
    });

    self.svg.on("mouseleave", self.mouseleave);

} // end visualize
