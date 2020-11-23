
/**
 * Constructor for the a visualization
 *
 * replace all "VisTemplate" with name of object
 */

function GeneDetail(networkDetail){

    var self = this;
    //var window.gene_name_list = [];
    self.networkDetail = networkDetail;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
GeneDetail.prototype.init = function(){
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    self.gene_detail_view = $("#gene-detail")

    // =============== Experimental D3 code to line things up =====================
    
    // //Gets access to the div element created for this chart from HTML
    // var divNetwork = d3.select("#gene-detail").classed("content", true);
    // self.svgBounds = divNetwork.node().getBoundingClientRect();
    // self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    // self.svgHeight = 500;

    // //creates svg element within the div
    // self.svg = divNetwork.append("svg")
    //     .attr("id", "gene-detail-svg")
    //     .attr("width", self.svgWidth)
    //     .attr("height", self.svgHeight)
   
    // ===============================================================================
    
};



/**
 * Creates the stacked bar chart, text content and tool tips for electoral vote chart
 *
 * @param electionResult election data for the year selected
 * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */

GeneDetail.prototype.update = function(node_detail_array, gene_cluster_object){
    // gene_array is a array of [gene_name, score] from clicking on network node
    // gene_cluster_list is the nodes array from cluster
    var self = this;
    $("#gene-detail").empty(); // remove previous details

    // extract gene names as tf_array
    gene_cluster_array = [];
    gene_cluster_object.forEach((item, i) => {
      gene_cluster_array[[i]] = item.name
    });

    self.gProfilerConvert(localStorage.getItem("organism_code"), node_detail_array[[0]], localStorage.getItem("gene_name_database"), node_detail_array)
    //console.log(gene_name_json)


};

GeneDetail.prototype.visualize = function(node_detail_array, gene_id_to_name_array){
   var self = this;

  // create data links
  var chart_url = "https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/%7Bids%7D/chart?ids=GO%3A0003700%2CGO%3A0005515%2CGO%3A0007403%2CGO%3A0035165"//self.networkDetail.goUrlMaker(gene_cluster_array, self.networkDetail.chart_url_prefix);
  var gene_url = "https://flybase.org/reports/"+node_detail_array[[0]]

  var gene_id = '<p class="gene-detail-text">Gene ID: '+node_detail_array[[0]]+ '</p>'
  var gene_name = '<p class="gene-detail-text">Gene Name: '+gene_id_to_name_array[[0]].converted+ '</p>'
  var gene_score = '<p class="gene-detail-text">Score: '+node_detail_array[[1]]+ '</p>'
  var gene_link = '<a href="'+gene_url + '" target="_blank">Gene Info</a><br>'
  var gene_cluster_png_link = '<a href="'+chart_url + '" target="_blank">Gene Cluster GO map</a>'


  $("#gene-detail").append('<h2 class="gene-detail-heading">Gene Detail</h2>');
  $("#gene-detail").append(gene_id);
  $("#gene-detail").append(gene_name);
  $("#gene-detail").append(gene_score);
  $("#gene-detail").append(gene_link);
  $("#gene-detail").append(gene_cluster_png_link);
  $("#gene-detail").append('<br>');
  self.createInput("Download_Supplementary_Data")


  //Handle Button click
 $(':button').on('click', function(e){ //NOTE SINGLE GENE IS PASSED -- THAT SINGLE GENE CAN BE VISUALIZED AS THE PNG
   //self.gProfilerConvert(localStorage.getItem("organism_code"), gene_id, localStorage.getItem("gene_name_database"));
 }); // end on click

} // end visualize

GeneDetail.prototype.gProfilerConvert = function(organism, gene_id, target, node_detail_array){
  var self = this;

    $.ajax({
      type: "POST",
      url: "https://biit.cs.ut.ee/gprofiler/api/convert/convert/",
      data: '{"organism": "'+organism+'", "target": "'+target+'", "query": '+'["'+gene_id+'"]}',
      headers: { 'content-type': 'application/json', 'Accept': 'application/json' }
    }).done(function( data ) {
      self.visualize(node_detail_array, JSON.parse(data).result);

    });

} // end gProfilerConvert()


//cite: https://stackoverflow.com/a/18226615
GeneDetail.prototype.createInput = function(button_text){
  var $input = $('<input type="button" value='+button_text+' />');
  $input.appendTo($("#gene-detail"));
} // end createInput

// Download a file form a url.
GeneDetail.prototype.saveFile = function(url) {
  // Get file name from url.
  var filename = url.substring(url.lastIndexOf("/") + 1).split("?")[0];
  var xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';
  xhr.onload = function() {
    var a = document.getElementById('a');
    a.href = window.URL.createObjectURL(xhr.response); // xhr.response is a blob
    a.download = filename; // Set the file name.
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    delete a;
  };
  xhr.open('GET', url);
  xhr.send();
}
