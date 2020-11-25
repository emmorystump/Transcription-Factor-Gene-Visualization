
/**
 * Constructor for the a visualization
 *
 * replace all "networkDetail" with name of object
 */
function NetworkDetail(goNetwork){
    var self = this;
    // if (tf_or_gene_list.length == 1){
    //   self.input_type="tf"; // get this from right side panel TODO: this eliminates if statement
    //   self.tf_or_gene_list = tf_or_gene_list;
    // } else{
    //   self.input_type="tf"; // get this from right side panel
    //   self.tf_or_gene_list = tf_or_gene_list;
    // }
    self.init();
    self.goNetwork = goNetwork;
    //self.update();

    // self.goUrlMaker(self.test_go_terms, self.chart_url_prefix);
    // self.downloadData("test")
};

/**
 * Initializes the svg elements required for this chart
 */
NetworkDetail.prototype.init = function(){

    var self = this;
    self.chart_url_prefix = "https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/%7Bids%7D/chart?ids=";
    self.json_url_prefix = "https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/graph?startIds=";
    self.gprofiler_convert_prefix = "https://biit.cs.ut.ee/gprofiler/convert?organism=" // add organism based on selection

    // test data
    // test gene_info has four genes. test go terms added by hand
    self.test_go_terms = ["GO:0003700","GO:0005515","GO:0007403","GO:0035165"]
    self.test_gene_info = {"FBgn0040736": {"name": "IM3", "link": "https://flybase.org/reports/FBgn0040736", "description": "None", "database": "ENSG,FLYBASENAME_GENE_ACC,FLYBASE_GENE_ID", "go": ["GO:0002376", "GO:0003674", "GO:0005576", "GO:0009617", "GO:0019731", "GO:0045087"]}, "FBgn0034454": {"name": "CG15120", "link": "https://flybase.org/reports/FBgn0034454", "description": "None", "database": "ENSG,FLYBASENAME_GENE_ACC,FLYBASE_GENE_ID", "go": ["GO:0005634", "GO:0005829", "GO:0030544", "GO:0031625", "GO:0051087", "GO:0003700", "GO:0051879", "GO:0060548"]}, "FBgn0052075": {"name": "CG32075", "link": "https://flybase.org/reports/FBgn0052075", "description": "None", "database": "ENSG,FLYBASENAME_GENE_ACC,FLYBASE_GENE_ID", "go": ["GO:0005515", "GO:0000460", "GO:0000470", "GO:0004519", "GO:0006364", "GO:0030687", "GO:0090305", "GO:0090730"]}, "FBgn0038966": {"name": "pinta", "link": "https://flybase.org/reports/FBgn0038966", "description": "None", "database": "ENSG,FLYBASENAME_GENE_ACC,FLYBASE_GENE_ID", "go": ["GO:0005501", "GO:0007601", "GO:0007602", "GO:0016063", "GO:0016918", "GO:0019841", "GO:0050896", "GO:1902936"]}, "FBgn0000606": {"name": "eve", "link": "https://flybase.org/reports/FBgn0000606", "description": "None", "database": "ENSG,FLYBASENAME_GENE_ACC,FLYBASE_GENE_ID", "go": ["GO:0000122", "GO:0006355", "GO:0006357", "GO:0007275", "GO:0007350", "GO:0007366", "GO:0007376", "GO:0007377", "GO:0007417", "GO:0007507", "GO:0007512", "GO:0000978", "GO:0007517", "GO:0008045", "GO:0008595", "GO:0009997", "GO:0016020", "GO:0016021", "GO:0035289", "GO:0035290", "GO:0043565", "GO:0045165", "GO:0000980", "GO:0045944", "GO:0050770", "GO:1901739", "GO:0000981", "GO:0001709", "GO:0003007", "GO:0003677", "GO:0003700", "GO:0005634"]}, "FBgn0025807": {"name": "Rad9", "link": "https://flybase.org/reports/FBgn0025807", "description": "None", "database": "ENSG,FLYBASENAME_GENE_ACC,FLYBASE_GENE_ID", "go": ["GO:0007403", "GO:0000076", "GO:0071479", "GO:0090305", "GO:0000077", "GO:0005515", "GO:0005634", "GO:0006281", "GO:0008408", "GO:0030896", "GO:0031573", "GO:0031965"]}, "FBgn0041236": {"name": "None", "link": "https://flybase.org/reports/FBgn0041236", "description": "None", "database": "None", "go": ["GO:0001580", "GO:0016021", "GO:0030424", "GO:0030425", "GO:0033038", "GO:0033041", "GO:0043025", "GO:0050909", "GO:0050912", "GO:0050913", "GO:0001582", "GO:0005886", "GO:0007165", "GO:0007635", "GO:0008049", "GO:0008527", "GO:0010037", "GO:0016020"]}, "FBgn0034553": {"name": "CG9993", "link": "https://flybase.org/reports/FBgn0034553", "description": "None", "database": "ENSG,FLYBASENAME_GENE_ACC,FLYBASE_GENE_ID", "go": ["GO:0001676", "GO:0102391", "GO:0003824", "GO:0003996", "GO:0004467", "GO:0006633", "GO:0015645", "GO:0016405", "GO:0016874", "GO:0046949"]}, "FBgn0011283": {"name": "None", "link": "https://flybase.org/reports/FBgn0011283", "description": "None", "database": "None", "go": ["GO:0005549", "GO:0005550", "GO:0005576", "GO:0007606", "GO:0007608"]}, "FBgn0030330": {"name": "Tango10", "link": "https://flybase.org/reports/FBgn0030330", "description": "None", "database": "ENSG,FLYBASENAME_GENE_ACC,FLYBASE_GENE_ID", "go": ["GO:0003674", "GO:0005515", "GO:0005829", "GO:0009306"]}, "FBgn0030073": {"name": "CG10962", "link": "https://flybase.org/reports/FBgn0030073", "description": "None", "database": "ENSG,FLYBASENAME_GENE_ACC,FLYBASE_GENE_ID", "go": ["GO:0035165", "GO:0000253", "GO:0004303", "GO:0016491", "GO:0055114", "GO:0072555", "GO:0072582"]}};

    // set the dimensions and margins of the graph
    self.margin = {top: 30, right: 30, bottom: 30, left: 30},
    self.width = 800 - self.margin.left - self.margin.right,
    self.height = 1000 - self.margin.top - self.margin.bottom;

    // initiate an svg object, append g element
    self.svg = d3.select(".network-detail")
      .append("svg")
      .attr("width", self.width + self.margin.left + self.margin.right)
      .attr("height", self.height + self.margin.top + self.margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + self.margin.left + "," + self.margin.top + ")");
};

NetworkDetail.prototype.downloadData = function(tf_or_gene_list){
  var self = this;

  //generate png path
  switch (self.input_type){ // get this from input in right side panel
    case "tf":
      //var png_url = self.goUrlMaker(tf_or_gene_list);
      break;
    case "gene_list":
      //var png_url = self.goUrlMaker(tf_or_gene_list);
      //var json_url = self.goUrlMaker(tf_or_gene_list);
      break;
   }; // end switch

  var test_png_url = "https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/%7Bids%7D/chart?ids=GO%3A0003700%2CGO%3A0005515%2CGO%3A0007403%2CGO%3A0035165";
  var test_json_url = "https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/graph?startIds=GO%3A0035289%2CGO%3A0042063%2CGO%3A0042387%2CGO%3A0042690";

  //self.saveFile(test_png_url, "go_chart_png"); // replace with png_url
  self.saveFile(test_json_url, "go_network"); // replace with json_url
}; // end downloadData()

NetworkDetail.prototype.goUrlMaker = function(gene_array, url_prefix){
  // input must be iterable array
  //gene_array = [GO:0003700,GO:0005515,GO:0007403,GO:0035165]; // testing -- being passed in contructor now for testing purposes
  var self = this;
  console.log(gene_array)
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

NetworkDetail.prototype.update = function(tf_array, target_array){
  var self = this;

  // retrieve
  self.gProfilerConvert("dmelanogaster", tf_array, "FLYBASENAME_GENE", "tf_name_json");
  console.log(sessionStorage.getItem("tf_name_json"));

  // self.gProfilerConvert("dmelanogaster", target_array, "FLYBASENAME_GENE", "gene_name_json");
  // console.log(sessionStorage.getItem("gene_name_json"));
  //
  // self.gProfilerGO("dmelanogaster", target_array, "profile_tester");
  // console.log(sessionStorage.getItem("profile_tester"));




  // get path to graph -- Emmory and Lisa -- how do you suggest saving the data?

  // read in PNG # TODO: error handing if png file not found
  // path_to_png = 'data/fruitfly/chart.png'
  // path_to_json = 'data/fruitfly/graph.json'
  //
  // // place link to png in network detail
  // var network_description_chart_link = document.getElementById("go-network-chart")
  // network_description_chart_link.href = path_to_png;
  //
  // d3.json(path_to_json).then(function(data) {
  //   var gene_list = Object.keys(self.test_gene_info);
  //   var gene_name_list = []
  //   var go_terms = [];
  //   var heatmap_data =[];
  //   var go_term_counter = 0
  //   gene_list.forEach((gene_id, gene_id_index) => {
  //     self.test_gene_info[gene_id]["go"].forEach((go_term, go_term_index) => {
  //       gene_name_list[go_term_counter] = self.test_gene_info[gene_id].name;
  //       heatmap_entry = {gene_name: self.test_gene_info[gene_id].name, go_term: go_term, value: 10};
  //       heatmap_data[go_term_counter] = heatmap_entry
  //       go_terms[go_term_counter] = go_term;
  //       go_term_counter = go_term_counter + 1;
  //     });
  //   });
  //             //console.log(go_terms);
  //             //console.log(heatmap_data)
  //   //cite: https://stackoverflow.com/a/59600626
  //       var goTally = items => {
  //        const tally = {};
  //        for (let i = 0; i < go_terms.length; i++) {
  //           if (!tally[items[i]]) {
  //              tally[items[i]] = 0;
  //           }
  //           tally[items[i]]++;
  //        }
  //        return tally
  //     }
  //
  //     var go_tally = goTally(go_terms);
  //
  //         // Build X scales and axis:
  //   var x = d3.scaleBand()
  //     .range([ 0, self.width ])
  //     .domain(gene_name_list)
  //     .padding(0.01);
  //   self.svg.append("g")
  //     .attr("transform", "translate(0," + self.height + ")")
  //     .call(d3.axisBottom(x))
  //
  //   // Build X scales and axis:
  //   var y = d3.scaleBand()
  //     .range([ self.height, 0 ])
  //     .domain(go_terms) //only unique go terms
  //     .padding(0.01);
  //   self.svg.append("g")
  //     .call(d3.axisLeft(y));
  //
  //     // Build color scale
  //     var myColor = d3.scaleLinear()
  //       .range(["white", "#69b3a2"])
  //       .domain([1,10]);
  //
  //   heatmap_data.forEach((item, i) => {
  //       console.log(item)
  //     });
  //
  //     self.svg.selectAll("rect")
  //     .data(heatmap_data)
  //     .enter()
  //     .append("rect")
  //     .attr("x", function(d,i) { return x(d.gene_name) })
  //     .attr("y", function(d,i) { return y(d.go_term) })
  //     .attr("width", x.bandwidth() )
  //     .attr("height", y.bandwidth() )
  //     .style("fill", "blue" )
  //
  // }); // end read in json.then

}; // end update()

// NetworkDetail.prototype.gProfilerConvert = function(organism, gene_array, target){
//   var self = this;
//
//   //https://biit.cs.ut.ee/gprofiler/convert?organism=dmelanogaster&query=FBgn0004914&target=GO&numeric_namespace=ENTREZGENE_ACC
//
//   // // cite: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequestEventTarget/onload
//   // var test_url = "https://biit.cs.ut.ee/gprofiler/convert?organism=dmelanogaster&query=FBgn0004914&target=GO&numeric_namespace=ENTREZGENE_ACC"
//   // var xmlhttp = new XMLHttpRequest(),
//   //     url =  test_url
//   //     method = "POST"
//   //
//   // xmlhttp.open(method, url, true);
//   // xmlhttp.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
//   // xmlhttp.onload = function () {
//   //     //sessionStorage.setItem("test", xmlhttp.response);
//   //     console.log(xmlhttp.response);
//   // };
//   // xmlhttp.send();
//     $.ajax({
//       type: "POST",
//       url: "https://biit.cs.ut.ee/gprofiler/api/convert/convert/",
//       data: '{"organism": "'+organism+'", "target": "'+target+'", "query": '+'["'+gene_array.join('","')+'"]}',
//       headers: { 'content-type': 'application/json', 'Accept': 'application/json' }
//       //data: '{"organism": "hsapiens", "target": "FLYBASENAME_GENE", "query": ["CASQ2", "CASQ1", "GSTO1", "DMD", "GSTM2"]}' //data: '{"organism": organism, "target": target, "query": gene_array}' //      data: '{"organism": "hsapiens", "target": "mmusculus", "query": ["CASQ2", "CASQ1", "GSTO1", "DMD", "GSTM2"]}'
//     }).done(function( data ) {
//         if(sessionStorage.getItem("tmp_name") !== null){
//           sessionStorage.removeItem("tmp_name")
//         }
//           sessionStorage.setItem("tmp_name") = gene_name;
//         //self.download(data, 'geneID_to_geneName.json', 'text/plain')
//        // if(sessionStorage.getItem(data_attr_name)!==null){
//        //   sessionStorage.removeItem(data_attr_name);
//        // }
//        //sessionStorage.setItem(data_attr_name, data);
//
//     });
//
// } // end gProfilerConvert()

NetworkDetail.prototype.download = function(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

// Download a file form a url.
NetworkDetail.prototype.saveFile = function(url, data_attr_name) {

  // cite: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequestEventTarget/onload
  var xmlhttp = new XMLHttpRequest(),
  method = 'GET',
  url = url;

  xmlhttp.open(method, url, true);
  xmlhttp.onload = function () {
      sessionStorage.setItem(data_attr_name, xmlhttp.response);
  };
  xmlhttp.send();

  // cite: https://codepen.io/theConstructor/pen/vKNRdE
  // var filename = url.substring(url.lastIndexOf("/") + 1).split("?")[0];
  // var xhr = new XMLHttpRequest();
  // xhr.responseType = 'blob';
  // xhr.onload = function() {
  //   var a = document.createElement('a');
  //   a.href = window.URL.createObjectURL(xhr.response); // xhr.response is a blob. it is also the item that we want
  //   a.download = filename; // Set the file name.
  //   a.style.display = 'none';
  //   document.body.appendChild(a);
  //   a.click();
  //   delete a;
  // };
  // xhr.open('GET', url);
  // xhr.send();
}; // end saveFile()
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
