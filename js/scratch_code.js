


// ######################chase scratch#############################//

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
