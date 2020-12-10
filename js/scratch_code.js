<div class="col-md-6">
  <div class="row content-heading" id="edge-chart-heading">
    <h2 id="edge-chart-heading-text"></h2>
    <div id="network-vis"></div>
  </div> <!-- end network-vis row (top left quandrant) -->
  <div class="row">
    <div class="col-md-6" id="detail-tabs-column">
        <h2>Gene/GO Details</h2>
      <!-- network detail tabs -->
      <!-- cite: https://codepen.io/jcblw/pen/DxAJF -->
      <div class="row">
        <div class="tab-container">
          <ul class="tabs network-detail-tabs clearfix" >
            <li id="go-detail-tab">
              <a href=# >GO Detail</a>
            </li>
            <li id="gene-detail-tab" class=active >
              <a href=# >Gene Detail</a>
            </li>
        </div><!-- end tab-container -->
      </div> <!-- end detail tabs row -->
      <!-- gene/go details -->
      <div class="row">
        <div id="go-gene-detail" class="col-md-4 m-0 go-gene-detail">
          <div class="gene-detail-text">Click a gene in the network visualization for more information</div>
          <div class="go-detail-text"></div>
        </div><!-- end go-gene-detail -->
    </div> <!-- end go-gene-detail row -->
  </div> <!-- end detail-tabs-column -->
</div>
</div> <!-- end first column (contains network-vis and network-details) -->
<!-- right column is for the manhantten plot and heatmap vis -->
<div class="col-md-6" id="plot-column">
  <!-- plot tabs -->
  <div class="row plots-tabs">
    <div class="tab-container">
      <ul class="tabs plot-tabs clearfix" >
        <li id="heatmap-plot-selector">
          <a href=# >Heatmap</a>
        </li>
        <li id="manhatten-plot-selector" class=active >
          <a href=# >Manhatten Plot</a>
        </li>
    </div><!-- end tabs-container -->
  </div> <!-- end plot-tabs row -->
  <!-- second row of right column is for the plot headings -->
  <div class="row plot-heading-row">
    <div id="plot-heading-div" class="col-md-auto"></div>
  </div><!-- end plot-heading-row -->
  <!-- third row of right column is for the plots -->
  <div class="row actual-plot-row">
    <div id="plot-div" class="col-md-auto"></div>
  </div><!-- end actual-plot-row -->
  <div class="row plot-error-row">
    <div id="plot-error"></div>
  </div><!-- end actual-plot-row -->
</div> <!-- end plot-col -->


// ######################chase scratch#############################//

// // Download a file form a url.
// NetworkDetail.prototype.saveFile = function(url) {
//   // Get file name from url.
//   var filename = url.substring(url.lastIndexOf("/") + 1).split("?")[0];
//   var xhr = new XMLHttpRequest();
//   xhr.responseType = 'blob';
//   xhr.onload = function() {
//     var a = document.getElementById('a');
//     a.href = window.URL.createObjectURL(xhr.response); // xhr.response is a blob
//     a.download = filename; // Set the file name.
//     a.style.display = 'none';
//     document.body.appendChild(a);
//     a.click();
//     delete a;
//   };
//   xhr.open('GET', url);
//   xhr.send();
// }

// GoHeatmap.prototype.gProfilerConvert = function(organism, gene_list, target, go_data){
//   var self = this;
//   // remove null items from list (this occurs when the genes are filtered on score threshold -- maybe do this in network instead?)
//   // cite: https://stackoverflow.com/a/281335
//   var cleanArray = gene_list.filter(function () { return true });
//
//     $.ajax({
//       type: "POST",
//       url: "https://biit.cs.ut.ee/gprofiler/api/convert/convert/",
//       data: '{"organism": "'+organism+'", "target": "'+target+'", "query": '+'["'+cleanArray.join('","')+'"]}',
//       headers: { 'content-type': 'application/json', 'Accept': 'application/json' }
//     }).done(function( data ) {
//       self.setData(JSON.parse(data).result, go_data);
//     });
//
// }; // end gProfilerConvert()

// a heatmap rough rough draft
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

// the following is code for pulling/saving phytosphingosine
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

// NetworkDetail.prototype.download = function(content, fileName, contentType) {
//     var a = document.createElement("a");
//     var file = new Blob([content], {type: contentType});
//     a.href = URL.createObjectURL(file);
//     a.download = fileName;
//     a.click();
// }

// // Download a file form a url.
// NetworkDetail.prototype.saveFile = function(url, data_attr_name) {
//
//   // cite: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequestEventTarget/onload
//   var xmlhttp = new XMLHttpRequest(),
//   method = 'GET',
//   url = url;
//
//   xmlhttp.open(method, url, true);
//   xmlhttp.onload = function () {
//       sessionStorage.setItem(data_attr_name, xmlhttp.response);
//   };
//   xmlhttp.send();

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

// ############################################################################################ //
