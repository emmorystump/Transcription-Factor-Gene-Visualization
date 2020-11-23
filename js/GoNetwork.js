
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
    self.svgHeight = 150;

    //creates svg element within the div
    self.svg = divGoNetwork.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight);
};



/**
 * accepts gene_id_list, passes to gProfilerGO
 * @params gene_name_list a list of gene_id
 */

GoNetwork.prototype.update = function(gene_id_list){

  var self = this;
  //console.log(gene_name_list)

  self.gProfilerGO(localStorage.getItem("organism_code"), gene_id_list);

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
  console.log(go_object)
} // end visualize
