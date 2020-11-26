
/**
 * Constructor for the a visualization
 *
 * replace all "VisTemplate" with name of object
 */
function GoNetwork(){

    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
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
      self.goClassColor = d3.scaleOrdinal()
        .domain(["GO:BP", "GO:CC","GO:MF","KEGG"])
        .range(["#d95f02","#f0027f","#6a3d9a","#33a02c"]);

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
        self.visualize(JSON.parse(data).result);
      }
    });
} // end gProfilerGO()

GoNetwork.prototype.visualize = function(go_object){
  // need to fix margin around svg, axis, etc
  var self = this;
  console.log(self.goClassColor("KEGG"))

  var min_negLog10_pval = 1.3;
  var max_negLog10_pval = 6;

  // append axis to svg object
  self.svg.append("g")
    .attr("transform", "translate(0," + 280 + ")")
    .attr("class", "x-axis")
    .call(d3.axisBottom(self.x));

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
    .attr("cx", function(d,i) { return self.x((d.source))+180 })
    .attr("cy", function(d,i) { return self.y(-Math.log(d.p_value)) })
    .attr("r", function(d,i) {return pointScale(-Math.log(d.p_value))} )
    .attr("fill", function(d,i) {return self.goClassColor(d.source)})
    .attr("class", "my-circles")
    .call(log, "dataset")

    function log(sel,msg) {
    console.log(msg,sel);
  }
} // end visualize
