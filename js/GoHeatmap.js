
/**
 * Constructor for the a GoHeatmap
 *
 */
function GoHeatmap(){

    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
GoHeatmap.prototype.init = function(){
    var self = this;
    self.margin = {top: 100, right: 100, bottom: 30, left: 100};

    //Gets access to the div element created for this chart from HTML
    var divGoHeatmap = d3.select(".go-heatmap").classed("content", true);
    self.svgBounds = divGoHeatmap.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width;
    self.svgHeight = 300;

    //creates svg element within the div
    self.svg = divGoHeatmap.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight+self.svgBounds.top)
        .append("g")
        .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

        // Build X scales and axis:
    self.x = d3.scaleBand()
      .range([ 0, self.svgWidth-self.margin.left-self.margin.right ])
      .padding(0.01);

    // Build X scales and axis:
    self.y = d3.scaleBand()
      .range([ self.svgHeight-self.svgBounds.top, 0 ])
      .padding(0.01);

    // Build color scale
    self.myColor = d3.scaleLinear()
      .range(["white", "#69b3a2"])
      .domain([1,100])

};

GoHeatmap.prototype.receiveData = function(gene_list, go_data){

  var self = this;

  self.gProfilerConvert(sessionStorage.getItem("organism_code"), gene_list, "GO", go_data)

};

GoHeatmap.prototype.gProfilerConvert = function(organism, gene_list, target, go_data){
  var self = this;
  // remove null items from list (this occurs when the genes are filtered on score threshold -- maybe do this in network instead?)
  // cite: https://stackoverflow.com/a/281335
  var cleanArray = gene_list.filter(function () { return true });

    $.ajax({
      type: "POST",
      url: "https://biit.cs.ut.ee/gprofiler/api/convert/convert/",
      data: '{"organism": "'+organism+'", "target": "'+target+'", "query": '+'["'+cleanArray.join('","')+'"]}',
      headers: { 'content-type': 'application/json', 'Accept': 'application/json' }
    }).done(function( data ) {
      self.setData(JSON.parse(data).result, go_data);
    });

}; // end gProfilerConvert()

/**
 *
 * @param
 * @param
 */

GoHeatmap.prototype.setData = function(gene_to_go_json, go_data){
    var self = this;
    console.log(go_data)
    var go_dict = {};
    console.log(gene_to_go_json)
    gene_to_go_json.forEach((item, i) => {
      if(item.converted in go_dict){
        go_dict[item.converted].push(item.incoming)
      }else{
        go_dict[item.converted] = [item.incoming]
      }
    }); // end forEach

    self.go_by_gene_data = {"GO:BP": {gene_list:[], go_term_list:[], edge_list:[]},
                            "GO:CC":{gene_list:[], go_term_list:[], edge_list:[]},
                            "GO:MF":{gene_list:[], go_term_list:[], edge_list:[]},
                            "KEGG":{gene_list:[], go_term_list:[], edge_list:[]}};

    go_data.forEach((item, i) => {
      //functional_category = item.source (doesn't work to assign this to a variable and then select from go_By_gene_data...dont know why)
      //go_term = item.native (see above)

      // append go term to correct item.source go_term_list (if doesn't already exist)
      if(!(item.native in self.go_by_gene_data[item.source].go_term_list)){
          self.go_by_gene_data[item.source].go_term_list.push(item.native);
      }
      item.parents.forEach((parent_go_term, i) => {
        if(!(parent_go_term in self.go_by_gene_data[item.source].go_term_list)){
            self.go_by_gene_data[item.source].go_term_list.push(parent_go_term);
        } //NOTE: ADDING THIS TO ADD PARENT GO TERMS -- MAY WANT TO REMOVE
        if(parent_go_term in go_dict){
          // append genes associated with this go term to gene_list (if they don't already exist in the list)
          // cite: https://stackoverflow.com/a/34902391
          var filtered_genes = go_dict[parent_go_term].filter(
                function(e) {
                  return this.indexOf(e) < 0;
                },
                self.go_by_gene_data[item.source].gene_list
              );
          if(filtered_genes.length > 0){
                self.go_by_gene_data[item.source].gene_list.push(filtered_genes);
          }
          // fill edge_list
            go_dict[parent_go_term].forEach((gene_id, index) => {
              self.go_by_gene_data[item.source].edge_list.push({gene: gene_id, go: parent_go_term, score:100})
            });

        } // end if(item.native in go_dict)

      });


      if(item.native in go_dict){
        // append genes associated with this go term to gene_list (if they don't already exist in the list)
        // cite: https://stackoverflow.com/a/34902391
        var filtered_genes = go_dict[item.native].filter(
              function(e) {
                return this.indexOf(e) < 0;
              },
              self.go_by_gene_data[item.source].gene_list
            );
        if(filtered_genes.length > 0){
              self.go_by_gene_data[item.source].gene_list.push(filtered_genes);
        }
        // fill edge_list
          go_dict[item.native].forEach((gene_id, index) => {
            self.go_by_gene_data[item.source].edge_list.push({gene: gene_id, go: item.native, score:100})
          });

      } // end if(item.native in go_dict)

    }); // end go_data.forEach
    console.log(self.go_by_gene_data)

}; // end setData()


/**
 * Creates the stacked bar chart, text content and tool tips for electoral vote chart
 *
 * @param go_category is passed in GoManhattenPlot. it is passed when a label on the x-axis is clicked
 */

GoHeatmap.prototype.update = function(go_category){ // TODO: ENTER/UPDATE/EXIT OR OTHERWISE CLEAR OLD MAP PRIOR TO UPDATING
    var self = this;

    // remove all items from previous graph (everything added to graph below is classed with heatmap-update)
    $(".heatmap-update").remove()

    // update the y domain with the gene list
    self.y.domain(self.go_by_gene_data[go_category]["gene_list"].flat());
    // append the y axis to the svg element
    self.svg.append("g")
            .call(d3.axisLeft(self.y))
            .attr("class", "heatmap-update");

    // update the x axis with the go terms
    self.x.domain(self.go_by_gene_data[go_category]["go_term_list"].flat());
    // add the x axis to the svg element

    self.svg.append("g")
            //.attr("transform", "translate(0," + self.svgHeight + ")")
            .call(d3.axisTop(self.x))
            .attr("class", "heatmap-update")
            .selectAll("text")
            .attr("y", 0)
            .attr("x", -70)
            .attr("dy", "-.35em")
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start");

    console.log(self.go_by_gene_data[go_category]["edge_list"])
    // add blocks to heatmap
    self.svg.selectAll("rect")
            .data(self.go_by_gene_data[go_category]["edge_list"], function(d) {return d.gene+':'+d.go;})
            .enter()
            .append("rect")
            .attr("class", "heatmap-update")
            .attr("x", function(d) { return self.x(d.go) })
            .attr("y", function(d) { return self.y(d.gene) })
            .attr("width", self.x.bandwidth() )
            .attr("height", self.y.bandwidth() )
            .style("fill", function(d) { return self.myColor(d.score)} );

}; // end update
