
/**
 * Constructor for the a visualization
 *
 * replace all "networkDetail" with name of object
 */
function networkDetail(tf_or_gene_list){
    var self = this;
    if (tf_or_gene_list.length == 1){
      self.input_type="tf";
      self.tf_or_gene_list = tf_or_gene_list;
    } else{
      self.input_type="tf";
      self.tf_or_gene_list = tf_or_gene_list;
    }
    self.init();
    self.update();
};

/**
 * Initializes the svg elements required for this chart
 */
networkDetail.prototype.init = function(){
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};
    //Gets access to the div element created for this chart from HTML
    //var divelectoralVotes = d3.select("#electoral-vote").classed("content", true);
    //self.svgBounds = divelectoralVotes.node().getBoundingClientRect();
    //self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    //self.svgHeight = 150;

    //creates svg element within the div
    //self.svg = divVisTemplate.append("svg")
    //    .attr("width",self.svgWidth)
    //    .attr("height",self.svgHeight);
                    console.log("HERE")
};

networkDetail.prototype.downloadData = function(tf_or_gene_list){
  var self = this;
  // ask user to download
  // create png url
  png_prefix = "https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/%7Bids%7D/chart?ids=";
  json_prefix = "https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/graph?startIds=";
  // lists will
  test_png = "https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/%7Bids%7D/chart?ids=GO%3A0003700%2CGO%3A0005515%2CGO%3A0007403%2CGO%3A0035165";
  test_json = "https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/graph?startIds=GO%3A0035289%2CGO%3A0042063%2CGO%3A0042387%2CGO%3A0042690";

  self.saveFile(test_png);
  self.saveFile(test_json);
}

networkDetail.prototype.update = function(){
  var self = this;

  // create graph URL

  // read in PNG # TODO: error handing if png file not found
  path_to_png = 'data/fruitfly/chart.png'
  path_to_json = 'data/fruitfly/graph'


  // place link to png in network detail
  var network_description_chart_link = document.getElementById("go-network-chart")
  network_description_chart_link.href = path_to_png;

d3.json(path_to_json).then(function(data) {
  console.log(data);
});

};

// Download a file form a url.
networkDetail.prototype.saveFile = function(url) {
  // cite: https://codepen.io/theConstructor/pen/vKNRdE
  var filename = url.substring(url.lastIndexOf("/") + 1).split("?")[0];
  var xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';
  xhr.onload = function() {
    var a = document.createElement('a');
    a.href = window.URL.createObjectURL(xhr.response); // xhr.response is a blob. it is also the item that we want
    a.download = filename; // Set the file name.
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    delete a;
  };
  xhr.open('GET', url);
  xhr.send();
};
// //
// // // retrieve PNG ontology graph here:
// // https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/%7Bids%7D/chart?ids=GO%3A0003700%2CGO%3A0005515%2CGO%3A0007403%2CGO%3A0035165
// //
// // // graph json
// // https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/graph?startIds=GO%3A0035289%2CGO%3A0042063%2CGO%3A0042387%2CGO%3A0042690
// //
// //
// // // cite: https://codepen.io/theConstructor/pen/vKNRdE
// // //Handle Button click
// // $('button').on('click', function(e){
// //   //Store user entered value
// //   $('#imgUrl').css('color', 'black')
// //   var userUrl =  $('#imgUrl').val();
// //   e.preventDefault();
// //  if(userUrl == "" || !userUrl.match("^http")){
// //    console.log(userUrl.toString())
// //    $('#imgUrl').val('Must enter valid url begining with http or https');
// // $('#imgUrl').css('color', 'red')
// //  } else{
// //    //If pass then save url
// //    saveFile(userUrl);
// //
// //  }
// //
// // })
// //
// // // cite: https://codepen.io/theConstructor/pen/vKNRdE
// // function saveFile(url) {
// //   // Get file name from url.
// //   var filename = url.substring(url.lastIndexOf("/") + 1).split("?")[0];
// //   var xhr = new XMLHttpRequest();
// //   xhr.responseType = 'blob';
// //   xhr.onload = function() {
// //     var a = document.createElement('a');
// //     a.href = window.URL.createObjectURL(xhr.response); // xhr.response is a blob
// //     a.download = filename; // Set the file name.
// //     a.style.display = 'none';
// //     document.body.appendChild(a);
// //     a.click();
// //     delete a;
// //   };
// //   xhr.open('GET', url);
// //   xhr.send();
// // };
// //
// // saveFile(requestURL)
