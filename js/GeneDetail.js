
/**
 * Constructor for the a visualization
 *
 * replace all "VisTemplate" with name of object
 */

function GeneDetail(colorScheme){

    var self = this;
    self.colorScheme = colorScheme;
    //var window.gene_name_list = [];
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
GeneDetail.prototype.init = function(){
    var self = this;

    self.gene_instructions = "Click a gene in the network visualization for more information";
    self.go_instructions = "Click one of the significant GO terms on the manhatten plot for more information";

    self.gene_detail_text = "";
    self.go_detail_text = "";

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
    // hide go details if they exist
    $(".go-detail-text").removeClass('active');
    // remove instructions text
    $(".go-gene-instructions").empty();
    // remove previous details
    $(".gene-detail-text").empty();

    var chart_url = self.goUrlMaker(node_object_array.go, sessionStorage.getItem("go_chart_url_prefix"));

    self.gene_detail_text = '<p>Gene ID: '+node_object_array.name+
    '</p><p>Gene Name: '+node_object_array.gene_name+
    '</p><p>Score: '+node_object_array.score+
    '</p><a href="'+node_object_array.link +
    '" target="_blank">Gene Info</a><br><a href="'+chart_url +
    '" target="_blank">Gene Go Chart</a><br>';
    console.log(self.gene_detail_text)

    // // append to DOM
    // $(".gene-detail-text").append(self.gene_detail_text);
    // // make visible
    // $(".gene-detail-text").addClass('active');
    self.appendText(self.gene_deta_text, "gene")

};

GeneDetail.prototype.updateGoDetail = function(manhatten_plot_node_data){
  var self = this;
  // hide go details if they exist
  $(".gene-detail-text").removeClass('active');
  // remove instructions text
  $(".go-gene-instructions").empty();
  // remove previous details
  $(".go-detail-text").empty();


  self.go_detail_text = ("<p>Description: " + manhatten_plot_node_data.description + "<br>"+
                     "GO_term: " + manhatten_plot_node_data.native + "<br>"+
                     "<p> p-value: " + manhatten_plot_node_data.p_value + "<\p>"+
                     '<a class="nav-link" href="'+self.goUrlMaker(manhatten_plot_node_data.parents,
                     sessionStorage.getItem("go_chart_url_prefix")) + '" target="_blank">GO term chart<\a>');

 // append to DOM
 $(".go-detail-text").append(self.go_detail_text);
 // make visible
 $(".go-detail-text").addClass('active');
}; // end updateGoDetail()

/**
*
* @params detail_text:
* @params which_div: either 'go' or 'gene'
**/
GeneDetail.prototype.appendText = function(detail_text, which_div){
  var self = this;
  var text = "";

  try{
    if (!["gene","go"].includes(which_div)) throw 'GeneDetail.appendText must get second argument either "gene" or "go"'
  } catch(err){
    console.log(err)
  }

  if(which_div == "go"){
    if(detail_text == "" & self.go_detail_text == ""){
        text = self.go_instructions;
    } else{
      text = self.go_detail_text;
    }
  } else{ // which_div must be gene
     console.log("HERE")
     if(detail_text == "" & self.gene_detail_text == ""){
         text = self.gene_instructions;
     } else{
         console.log("here")
         text = self.gene_detail_text;
     }
  }

  // append to DOM
  console.log(text)
  $(".go-detail-text").empty();
  $(".go-detail-text").append(text);

} // end appendText

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
  var $input = $('<input type="button" value='+button_text+' class="btn btn-dark mb-2"/>');
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
