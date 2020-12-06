
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

    self.yeast_gene_url_prefix = "https://fungidb.org/fungidb/app/search?q=";

    self.go_chart_url_prefix = "https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/%7Bids%7D/chart?ids=";
    self.kegg_path_prefix = "https://www.genome.jp/dbget-bin/www_bfind_sub?mode=bfind&max_hit=1000&dbkey=kegg&keywords=";

};



/**
 * Creates the stacked bar chart, text content and tool tips for electoral vote chart
 *
 * @param node_object_array
 * @param tf_object
 */

GeneDetail.prototype.update = function(node_object_array, tf_object){
    // gene_array is a array of [gene_name, score] from clicking on network node
    // gene_cluster_list is the nodes array from cluster
    // tf_object is structure: {"tf_id": tf.id, "name":tf_geneName, "description": tf_description, "go": tf_go, "link": tf_link}

    // switch the tab
    $("#go-detail-tab").removeClass('active');
    $("#gene-detail-tab").addClass('active');

    var self = this;
    // hide go details if they exist
    $(".go-detail-text").removeClass('active');
    // remove instructions text
    $(".go-gene-instructions").empty();
    // remove previous details
    $(".gene-detail-text").empty();

    // go terms come from the stored data in data/ itself, not from an API request
    var go_term_array = "" // todo: this wrangling/error handling could be taken care of better in the call to update
    if (typeof(node_object_array.go) == "string"){
      go_term_array = [node_object_array.go]
    } else{
      go_term_array = node_object_array.go
    }
    var chart_url = self.goUrlMaker(go_term_array, sessionStorage.getItem("go_chart_url_prefix"), "go");

    self.gene_detail_text = '<p>Gene ID: '+node_object_array.name+
    '</p><p>Gene Name: '+node_object_array.gene_name+
    '</p><p>Score: '+node_object_array.score+
    '</p><a href="'+ self.yeast_gene_url_prefix+node_object_array.name  +
    '" target="_blank">Gene Info</a><br><a href="'+chart_url +
    '" target="_blank">Gene Go Chart</a><br>';

    self.appendText(self.gene_deta_text, "gene");

};

GeneDetail.prototype.updateGoDetail = function(manhatten_plot_node_data){
  var self = this;
  var keg_or_go = "";
  var keg_or_go_path_prefix = "";

  // switch the tab
  $("#gene-detail-tab").removeClass('active');
  $("#go-detail-tab").addClass('active');

  // hide go details if they exist
  $(".gene-detail-text").removeClass('active');
  // remove instructions text
  $(".go-gene-instructions").empty();
  // remove previous details
  $(".go-detail-text").empty();

  // determine if KEGG or GO annotations
  console.log(manhatten_plot_node_data.native)
  if (manhatten_plot_node_data.native.startsWith("KEGG")){
    kegg_or_go = "kegg"
    kegg_or_go_path_prefix = self.kegg_path_prefix;
  } else{
    kegg_or_go = "go"
    kegg_or_go_path_prefix = self.go_chart_url_prefix;
  }
  console.log(manhatten_plot_node_data)


  self.go_detail_text = ("<p>Description: " + manhatten_plot_node_data.description + "<br>"+
                     "GO_term: " + manhatten_plot_node_data.native + "<br>"+
                     "<p> p-value: " + manhatten_plot_node_data.p_value + "<\p>"+
                     '<a class="nav-link" href="'+self.goUrlMaker([manhatten_plot_node_data.native], kegg_or_go_path_prefix, kegg_or_go) +
                     '" target="_blank">GO/KEGG term chart<\a>');

  self.appendText(self.go_detail_text, "go");

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
  $(".gene-detail-text").empty();
  $(".go-detail-text").empty();
  $(".go-detail-text").append(text);

} // end appendText

GeneDetail.prototype.goUrlMaker = function(gene_array, url_prefix, go_or_kegg){
  // gene_array must be a go_term_arry in the case of the chart
  // input must be iterable array
  //gene_array = [GO:0003700,GO:0005515,GO:0007403,GO:0035165]; // testing -- being passed in contructor now for testing purposes
  var self = this;
  var url = url_prefix;
  var gene_array = gene_array;
  console.log(gene_array)

  try{
    if(!["go", "kegg"].includes(go_or_kegg)) throw 'Error: GeneDetail.goUrlMaker takes three arguments, the third of which is either "go" or "kegg"'
  } catch(err){
    console.log(err)
  }

  if (go_or_kegg == "go"){
    gene_array.forEach((item, i) => {
      if (i == 0){
        gene_array[[i]] = item.replace(":", "%3A");
      }else {
        gene_array[[i]] = item.replace("GO:", "2CGO%3A");
      }
    });
  url = url_prefix + gene_array.join("%");
  } else{
    kegg_num = gene_array[0].split(":")[1];
    url = url_prefix + kegg_num;
  }

  try{
    if(url == "") throw 'Error: var url in GeneDetail.goUrlMaker is empty'
  } catch(err){
    console.log(err)
  }
  console.log(url)

  return(url);

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
