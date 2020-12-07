
/**
 * Constructor for NetworkDetail
 * @params colorScheme: global colorScheme passed in main.js
 */

function NetworkDetail(colorScheme){

    var self = this;
    self.colorScheme = colorScheme;
    //var window.gene_name_list = [];
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
NetworkDetail.prototype.init = function(){
    var self = this;

    self.gene_instructions = "Click a gene in the network visualization for more information";
    self.go_instructions = "Click one of the significant GO terms on the manhatten plot for more information";

    self.gene_detail_text = "";
    self.go_detail_text = "";

    self.yeast_gene_url_prefix = "https://fungidb.org/fungidb/app/search?q=";
    self.fly_gene_url_prefix = "https://flybase.org/reports/";

    self.go_chart_url_prefix = "https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/%7Bids%7D/chart?ids=";
    self.kegg_path_prefix = "https://www.genome.jp/dbget-bin/www_bfind_sub?mode=bfind&max_hit=1000&dbkey=kegg&keywords=";

};



/**
 * update self.gene_detail_text and pass the new info to self.appendText()
 *
 * @param node_object_array: passed when network-vis node is clicked -- the d3 created data object associated with each node
 * @param tf_object: tf information, in dictionary structure. see network.js self.tf_dict
 * tf_object structure: {"tf_id": tf.id, "name":tf_geneName, "description": tf_description, "go": tf_go, "link": tf_link}
 */
NetworkDetail.prototype.updateGeneDetail = function(node_object_array, tf_object){
    var self = this;
    gene_info_url_prefix = "";
    //get correct link url url_prefix
    if (sessionStorage.getItem("organism") == "fly"){
      gene_info_url_prefix = self.fly_gene_url_prefix
    } else{
      gene_info_url_prefix = self.yeast_gene_url_prefix
    } // move this back to sessionStorage

    // go terms come from the stored data in data/ itself, not from an API request
    var go_term_array = "" // todo: this wrangling/error handling could be taken care of better in the call to update
    if (typeof(node_object_array.go) == "string"){
      go_term_array = [node_object_array.go]
    } else{
      go_term_array = node_object_array.go
    } // end go_term_array handling
    // create go URL
    var chart_url = self.goUrlMaker(go_term_array, self.go_chart_url_prefix, "go");

    // switch the Gene Detail/Go Detail tab
    $("#go-detail-tab").removeClass('active');
    $("#gene-detail-tab").addClass('active');

    // hide go details if they exist
    $(".go-detail-text").removeClass('active');
    // remove instructions text
    $(".go-gene-instructions").empty();
    // remove previous details
    $(".gene-detail-text").empty();

    // update gene_detail_text (important that this be a global, to this object,
    // variable for handling of instruction messages vs data message in appendText)
    self.gene_detail_text = '<p>Gene ID: '+node_object_array.name+
    '</p><p>Gene Name: '+node_object_array.gene_name+
    '</p><p>Score: '+node_object_array.score+
    '</p><a href="'+ gene_info_url_prefix+node_object_array.name  +
    '" target="_blank">Gene Info</a><br><a href="'+chart_url +
    '" target="_blank">Gene Go Chart</a><br>';

    // pass text to appendText for publishing to dom
    self.appendText(self.gene_deta_text, "gene");

}; // end updateGeneDetail()

/*
 * update self.go_detail_text and pass the new info to self.appendText()
 * @params manhatten_plot_node_data: the d3 created object of data bound to each circle in mahnatten go plot
 *
 */
NetworkDetail.prototype.updateGoDetail = function(manhatten_plot_node_data){
  var self = this;
  // instantiate variables to determine whether to create go or kegg url link
  var keg_or_go = "";
  var keg_or_go_path_prefix = "";
  // determine if KEGG or GO annotations
  if (manhatten_plot_node_data.native.startsWith("KEGG")){
    kegg_or_go = "kegg"
    kegg_or_go_path_prefix = self.kegg_path_prefix;
  } else{
    kegg_or_go = "go"
    kegg_or_go_path_prefix = self.go_chart_url_prefix;
  } // end go/kegg determination
  var chart_url = self.goUrlMaker([manhatten_plot_node_data.native], kegg_or_go_path_prefix, kegg_or_go)

  // switch the Gene Detail/Go Detail tab
  $("#gene-detail-tab").removeClass('active');
  $("#go-detail-tab").addClass('active');

  // hide go details if they exist
  $(".gene-detail-text").removeClass('active');
  // remove instructions text
  $(".go-gene-instructions").empty();
  // remove previous details
  $(".go-detail-text").empty();

  // update self.go_detail_text (important that this be a global, to this object,
  // variable for handling of instruction messages vs data message in appendText)
  self.go_detail_text = ("<p>Description: " + manhatten_plot_node_data.description + "<br>"+
                     "GO_term: " + manhatten_plot_node_data.native + "<br>"+
                     "<p> p-value: " + manhatten_plot_node_data.p_value.toExponential() + "<\p>"+
                     '<a class="nav-link" href="'+chart_url+'" target="_blank">GO/KEGG term chart<\a>');

  // send to appendText to publish to dom
  self.appendText(self.go_detail_text, "go");

}; // end updateGoDetail()

/**
* create and send API request to gparser
* @params gene_array: this must be an array, even if only 1 item, of go or kegg terms
*                     (eg, [GO:0003700,GO:0005515,GO:0007403,GO:0035165] or [KEGG:04013])
* @params url_prefix: prefix to which the go/kegg terms will be appended (see self.init())
* @params go_or_kegg: a string indicating whether the terms in gene array are go or kegg terms
* (if more than one kegg term is passed, this will break currently. Multiple go terms are only passed from clicking a node in network vis currently, so
*  this limitation shoudn't be a problem, but adding error handling a good idea)
* @returns: url link to information on gene_arry values
**/
NetworkDetail.prototype.goUrlMaker = function(gene_array, url_prefix, go_or_kegg){
  var self = this;
  // unnecessary? store locally (depending on if this is passed by object or reference?) b/c these will be changed in the function
  var url = url_prefix;
  var gene_array = gene_array;

  // check go_or_kegg argument (3rd argument)
  try{
    if(!["go", "kegg"].includes(go_or_kegg)) throw 'Error: NetworkDetail.goUrlMaker takes three arguments, the third of which is either "go" or "kegg"'
  } catch(err){
    console.error(err)
  } // end error check on 3rd argument

  // create url, with method depending on value in go_or_kegg
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
  } // end create url

  // make sure that url is not an empty string (indicating failure to update url above)
  try{
    if(url == "") throw 'Error: var url in NetworkDetail.goUrlMaker is empty'
  } catch(err){
    console.error(err)
  }

  return(url);
}; // end goUrlMaker()

/**
* publish to dom either self.gene/go_detail_text or an instructions message
* @params detail_text: the text to publish. If an empty string is passed (see main.js),
*                      then the stored self.go/gene_detail_text is used. if that is empty string,
*                      the self.gene/go_instructions are used instead
* @params which_div: either 'go' or 'gene'
**/
NetworkDetail.prototype.appendText = function(detail_text, which_div){
  var self = this;
  // instantiate variable to hold text
  var text = "";
  // error check whether a correct second argument is passed
  try{
    if (!["gene","go"].includes(which_div)) throw 'NetworkDetail.appendText must get second argument either "gene" or "go"'
  } catch(err){
    console.error(err)
  } // end error handling on 2nd argument

  // update text based on detail_text and whether or not information is already stored in self.gene/go_detail_text
  if(which_div == "go"){
    if(detail_text == "" & self.go_detail_text == ""){
        text = self.go_instructions;
    } else{
      text = self.go_detail_text;
    }
  } else{ // which_div must be gene
     if(detail_text == "" & self.gene_detail_text == ""){
         text = self.gene_instructions;
     } else{
         text = self.gene_detail_text;
     }
  } // end text update

  // remove old message in gene/go detail tabs div
  $(".gene-detail-text").empty();
  $(".go-detail-text").empty();
  // append text to DOM
  $(".go-detail-text").append(text);

};// end appendText()
