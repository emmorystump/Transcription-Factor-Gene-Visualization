

// ("<p>Description: " + i.description + "<br>"+
//        "GO_term: " + i.native + "<br>"+
//        "<p> p-value: " + i.p_value + "<\p>"+
//        '<a class="nav-link" href="'+self.geneDetail.goUrlMaker(i.parents, sessionStorage.getItem("go_chart_url_prefix")) + '" target="_blank">GO term chart<\a>')

/**
 * Constructor
 */
function GoManhattenPlot(colorScheme, geneDetail, goHeatmap, functional_categories){

    var self = this;
    self.colorScheme = colorScheme;
    self.geneDetail = geneDetail;
    self.goHeatmap = goHeatmap;
    self.functional_categories = functional_categories;
    self.init();
}; // end constructor

/**
 * Initializes the svg elements required for this chart
 * TODO: put tooltip infrastructure somewhere w/common access -- less redundancy
 */
GoManhattenPlot.prototype.init = function(){
    var self = this;
    self.margin = {top: 100, right: 100, bottom: 0, left: 50};

    //Gets access to the div element created for this chart from HTML
    var divGoManhattenPlot = d3.select("#go-manhatten-plot").classed("content", true);
    self.svgBounds = divGoManhattenPlot.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 400;

    //creates svg element within the div
    self.svg = divGoManhattenPlot.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight+self.svgBounds.top)
        .append("g")
        .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

    var go_categories = ["GO:BP", "GO:CC","GO:MF","KEGG"];
    // Build X scales and axis:
    self.x = d3.scaleBand()
      .domain(go_categories)
      .range([0, self.svgWidth]);

    // Build X scales and axis:
    self.y = d3.scaleLog()
      .range([ 0, self.svgHeight-self.margin.top-self.margin.bottom ]);

}; // end init()

/**
 * accepts gene_id_list, passes to goProfilerGO to create API request from gprofiler
 * @params gene_name_list a list of gene_id
 */
GoManhattenPlot.prototype.update = function(gene_id_list){

  var self = this;

  self.gProfilerGO(sessionStorage.getItem("organism_code"), gene_id_list);

}; // end update()


/**
 * sends API request to gprofiler, returns data to self.distributeGOdata
 * @params the organism code, eg dmelanogaster, stored in sessionStorage when an organism is selected
 * @params gene_array is the list of genes displayed in network.js
 */
GoManhattenPlot.prototype.gProfilerGO = function(organism, gene_array){

    var self = this;

    var x = $.ajax({
      type: "POST",
      url: "https://biit.cs.ut.ee/gprofiler/api/gost/profile/",
      data: '{"organism":"'+organism+'", "query":'+'["'+gene_array.join('","')+'"],' +'"sources": ["GO:BP", "GO:CC", "GO:MF", "KEGG"], '+'"user_threshold":0.05, "return_only_filtered": true, "ordered": true}', //", "sources:"'+source_id+'"user_threshold":0.05, "all_results": true, "ordered": true}'
      headers: { 'content-type': 'application/json', 'Accept': 'application/json' },
      success: function( data ) {
        self.distributeGOdata(JSON.parse(data));
      }
    });
}; // end gProfilerGO()

/**
 * receives the return from gProfilerGO and distributes the data
 * @params go_data_object has two parts: result and meta
 */
GoManhattenPlot.prototype.distributeGOdata = function(go_data_object){

  var self = this;

  // update the manhatten plot
  self.visualize(go_data_object.result);

  // send data to the heatmap to parse into gene/go array
  self.goHeatmap.createGeneGoEdgeObject(go_data_object);

}; // end wrangleAndDistributeGOdata()

/**
 * visualize the GO data
 * @params the 'results' object of the returned data from the gProfilerGO
 */
GoManhattenPlot.prototype.visualize = function(go_object){
  // need to fix margin around svg, axis, etc
  var self = this;
  var pval = [];

  //TODO: needs to be replaced with min/max of data
  console.log(go_object)
  // these are turned negative after finding min/max -- see next block
  var min_Log10_pval = [1*10**6];
  var min_index = [];
  var max_Log10_pval = [-1];
  var max_index = [];
  go_object.forEach((item, i) => {
    pval[0] = -1*Math.log(item.p_value);
    if (pval[0] < min_Log10_pval[0]){
      min_Log10_pval[0] = pval[0];
      max_index = i;
    }else if(pval[0] > max_Log10_pval[0]){
      max_Log10_pval[0] = pval[0];
      min_index = i;
    }
  });

  try{
    if(max_Log10_pval == -1) throw "Error: no max pvalue found in GoManhattenPlot.visualize"
  } catch(err){
    console.log(err)
  }

    self.y.domain([go_object[min_index].p_value, go_object[max_index].p_value])
          .clamp(true);

    var pointScale = d3.scaleLog()
                       .domain([go_object[min_index].p_value, go_object[max_index].p_value])
                       .range([8, 4])
                       .clamp(true)

  console.log(go_object[min_index].p_value+" , "+go_object[max_index].p_value)

  // remove all circles, if they exist, to clear graph for new data
  $(".manhatten-circles").remove()

  // append axis to svg object
  self.svg.append("g")
    .attr("transform", "translate(0," + (self.svgHeight-self.margin.top-self.margin.bottom) + ")")
    .attr("class", "x-axis")
    .call(d3.axisBottom(self.x))
    .on("click", function(d,i){
      //this extracts the axis label, eg GO:BP, from a click on the xaxis of the GO plot
      var axis_selection = d.explicitOriginalTarget.__data__;
      //only pass if recognized functional group (see init())
      if(self.functional_categories.includes(axis_selection)){
        d3.select("#network-vis")
          .selectAll(".node")
          .attr("fill", function (d) {
              if (d.type == "tf") {
                  return self.colorScheme("tf");
              }
              else {
                  return self.colorScheme("gene");
              }
            });
        self.goHeatmap.update(axis_selection);
      } // end if
    }); // end onclick

  self.svg.append("g")
    .call(d3.axisLeft(self.y));

  self.svg.selectAll("circle")
    .data(go_object)
    .enter()
    .append("circle")
    .attr("cx", function(d,i) { return self.x(d.source) + self.svgWidth/8 }) // TODO: THIS NEEDS TO BE SOMEHOW ADJUSTED BASED ON SCREEN SIZE? SOMETHING OTHER THAN HARD CODING
    .attr("cy", function(d,i) { return self.y(d.p_value) })
    .attr("r", function(d,i) {return pointScale(d.p_value)} )
    .style("opacity", .4)
    .attr("fill", function(d,i) {return self.colorScheme(d.source)})
    .attr("class", "manhatten-circles")
    .attr("class", function(d,i) {return d.source})
    .on("click", function(node_info, data){
      self.geneDetail.updateGoDetail(data)
    })
    .on("mouseover", function(node_info, data){
      // highlight the term circle
      // put a halo around the selected node
    })
    .on("mouseleave", function(node_info, data){
      // return color to prev
    });

}; // end visualize()
