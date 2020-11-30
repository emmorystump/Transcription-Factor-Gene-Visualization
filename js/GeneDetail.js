
/**
 * Constructor for the a visualization
 *
 * replace all "VisTemplate" with name of object
 */

function GeneDetail(){

    var self = this;
    //var window.gene_name_list = [];
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

GeneDetail.prototype.update = function(node_object_array, tf_object){
    // gene_array is a array of [gene_name, score] from clicking on network node
    // gene_cluster_list is the nodes array from cluster
    // tf_object is structure: {"tf_id": tf.id, "name":tf_geneName, "description": tf_description, "go": tf_go, "link": tf_link}

    var self = this;
    // remove previous details
    $("#gene-detail").empty();

    var chart_url = self.goUrlMaker(node_object_array.go, sessionStorage.getItem("go_chart_url_prefix"));

    var gene_id = '<p class="gene-detail-text">Gene ID: '+node_object_array.name+ '</p>';
    var gene_name = '<p class="gene-detail-text">Gene Name: '+node_object_array.gene_name+ '</p>';
    var gene_score = '<p class="gene-detail-text">Score: '+node_object_array.score+ '</p>';
    var gene_link = '<a href="'+node_object_array.link + '" target="_blank">Gene Info</a><br>';
    var gene_cluster_png_link = '<a href="'+chart_url + '" target="_blank">Gene Go Chart</a><br>';

    // $("#gene-detail").append('<h2 class="gene-detail-heading">Gene Detail</h2>');
    $("#gene-detail").append(gene_id);
    $("#gene-detail").append(gene_name);
    $("#gene-detail").append(gene_score);
    $("#gene-detail").append(gene_link);
    $("#gene-detail").append(gene_cluster_png_link);
    $("#gene-detail").append('<br>');
    self.createInput("Download_Supplementary_Data")

};

GeneDetail.prototype.goUrlMaker = function(gene_array, url_prefix){
  // gene_array must be a go_term_arry in the case of the chart
  // input must be iterable array
  //gene_array = [GO:0003700,GO:0005515,GO:0007403,GO:0035165]; // testing -- being passed in contructor now for testing purposes
  var self = this;
  self.gene_array = gene_array;
  //GO%3A0003700%2CGO%3A0005515%2CGO%3A0007403%2CGO%3A0035165" // this is what the string needs to look like to be appended to prefix

  self.gene_array.forEach((item, i) => {
    if (i == 0){
      self.gene_array[[i]] = item.replace(":", "%3A");
    }else {
      self.gene_array[[i]] = item.replace("GO:", "2CGO%3A");
    }
  }); // end if statement

  this.url = url_prefix + self.gene_array.join("%");

  return(this.url);

}; // end goUrlMaker()

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
